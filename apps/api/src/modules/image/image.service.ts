import { zipSync } from "fflate";
import { singleton } from "tsyringe";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ImageStorageService } from "@/common/services/storage";
import { ImageKind, Prisma, PrismaClient, type Image } from "@/generated/prisma";
import {
  assetsFromImage,
  imageWithRelationsInclude,
  storageKeyFor,
  toImageItem,
  toPrismaImageKind,
} from "./image.mapper";
import type { ImageItem, ImageListQuery, ImageListResponse, ImageUpdateBody } from "./image.schema";

export interface ImageBundle {
  buffer: Buffer;
  filename: string;
}

@singleton()
export class ImageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: ImageStorageService,
  ) {}

  async findById(userId: string, id: string): Promise<ImageItem> {
    const row = await this.findOwnedImageWithRelations(userId, id);
    return toImageItem(row);
  }

  /**
   * Build a downloadable bundle for an image. icon_set images zip every stored
   * asset (PNGs, favicon.ico, site.webmanifest). Other kinds return the single
   * PNG so the download button behaves consistently across kinds.
   */
  async buildDownloadBundle(userId: string, id: string): Promise<ImageBundle> {
    const row = await this.assertOwnedImage(userId, id);

    if (row.kind !== ImageKind.ICON_SET) {
      const buffer = await this.storage.get(storageKeyFor(row.kind, row.cacheKey));
      if (!buffer) {
        throw new NotFoundError("Image file is missing from storage.");
      }
      return { buffer, filename: `${row.cacheKey}.png` };
    }

    const assets = assetsFromImage(row) ?? [];
    if (assets.length === 0) {
      throw new BadRequestError("This icon set has no assets to bundle.");
    }

    const entries: Record<string, Uint8Array> = {};
    for (const asset of assets) {
      const key = `${row.cacheKey}/${asset.name}`;
      const data = await this.storage.get(key);
      if (!data) {
        logger.warn({ imageId: row.id, key }, "Missing asset during bundle; skipping");
        continue;
      }
      entries[asset.name] = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    const zipped = zipSync(entries);
    return { buffer: Buffer.from(zipped), filename: "favicons.zip" };
  }

  async list(userId: string, query: ImageListQuery): Promise<ImageListResponse> {
    const { page, limit, projectId, category, kind, from, to, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ImageWhereInput = {
      userId,
      ...(projectId && { projectId }),
      ...(category && { category }),
      ...(kind && { kind: toPrismaImageKind(kind) }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { sourceUrl: { contains: search, mode: "insensitive" as const } },
          { title: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: imageWithRelationsInclude,
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      items: items.map(toImageItem),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(userId: string, id: string, body: ImageUpdateBody): Promise<ImageItem> {
    await this.assertOwnedImage(userId, id);
    const updated = await this.prisma.image.update({
      where: { id },
      data: { title: body.title, description: body.description },
      include: imageWithRelationsInclude,
    });
    return toImageItem(updated);
  }

  async delete(userId: string, id: string): Promise<{ success: true }> {
    const existing = await this.assertOwnedImage(userId, id);
    return this.deleteImageRow(existing);
  }

  async bulkDelete(userId: string, ids: string[]): Promise<{ success: true; deleted: number }> {
    const rows = await this.prisma.image.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true, cacheKey: true, kind: true },
    });

    let deleted = 0;
    for (const row of rows) {
      await this.deleteImageRow(row);
      deleted += 1;
    }
    return { success: true, deleted };
  }

  async deleteAsAdmin(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.image.findUnique({
      where: { id },
      select: { id: true, cacheKey: true, kind: true },
    });
    if (!existing) throw new NotFoundError("Image not found");
    return this.deleteImageRow(existing);
  }

  /** Delete a project's images older than the cutoff; per-row failures are logged and skipped. */
  async deleteStaleForProject(projectId: string, olderThan: Date): Promise<number> {
    const rows = await this.prisma.image.findMany({
      where: { projectId, createdAt: { lt: olderThan } },
      select: { id: true, cacheKey: true, kind: true },
    });

    let deleted = 0;
    for (const row of rows) {
      try {
        await this.deleteImageRow(row);
        deleted += 1;
      } catch (err) {
        logger.warn({ err, imageId: row.id }, "deleteStaleForProject: row delete failed");
      }
    }
    return deleted;
  }

  private async assertOwnedImage(userId: string, id: string): Promise<Image> {
    const row = await this.prisma.image.findUnique({ where: { id } });
    if (!row) throw new NotFoundError("Image not found");
    if (row.userId !== userId) throw new ForbiddenError("Not allowed");
    return row;
  }

  private async findOwnedImageWithRelations(userId: string, id: string) {
    const row = await this.prisma.image.findUnique({
      where: { id },
      include: imageWithRelationsInclude,
    });
    if (!row) throw new NotFoundError("Image not found");
    if (row.userId !== userId) throw new ForbiddenError("Not allowed");
    return row;
  }

  private async deleteImageRow(
    image: Pick<Image, "id" | "cacheKey" | "kind">,
  ): Promise<{ success: true }> {
    const key = storageKeyFor(image.kind, image.cacheKey);
    try {
      await this.storage.delete(key);
    } catch (err) {
      logger.warn({ err, key }, "storage.delete failed — continuing");
    }
    await this.prisma.image.delete({ where: { id: image.id } });
    return { success: true };
  }
}
