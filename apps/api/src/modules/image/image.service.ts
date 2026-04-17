import { singleton } from "tsyringe";
import { ForbiddenError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ImageStorageService } from "@/common/services/storage";
import { Prisma, PrismaClient, type Image } from "@/generated/prisma";
import {
  imageWithRelationsInclude,
  storageKeyFor,
  toImageItem,
  toPrismaImageKind,
} from "./image.mapper";
import type { ImageItem, ImageListQuery, ImageListResponse, ImageUpdateBody } from "./image.schema";

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
