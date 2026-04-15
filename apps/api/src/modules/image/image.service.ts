import { singleton } from "tsyringe";
import { ForbiddenError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ImageStorageService } from "@/common/services/storage";
import { Prisma, PrismaClient } from "@/generated/prisma";
import type { ImageItem, ImageListQuery, ImageListResponse, ImageUpdateBody } from "./image.schema";

type ImageWithRelations = Prisma.ImageGetPayload<{
  include: {
    template: { select: { slug: true; name: true } };
    project: { select: { name: true; publicId: true } };
  };
}>;

function toImageItem(row: ImageWithRelations): ImageItem {
  return {
    id: row.id,
    sourceUrl: row.sourceUrl,
    imageUrl: row.imageUrl,
    cdnUrl: row.cdnUrl,
    title: row.title,
    description: row.description,
    faviconUrl: row.faviconUrl,
    category: row.category,
    template: row.template ? { slug: row.template.slug, name: row.template.name } : null,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    publicProjectId: row.project?.publicId ?? null,
    aiModel: row.aiModel,
    generatedOnPlan: row.generatedOnPlan,
    width: row.width,
    height: row.height,
    format: row.format,
    generationMs: row.generationMs,
    serveCount: row.serveCount,
    createdAt: row.createdAt,
  };
}

@singleton()
export class ImageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: ImageStorageService,
  ) {}

  async findById(userId: string, id: string): Promise<ImageItem> {
    const row = await this.prisma.image.findUnique({
      where: { id },
      include: {
        template: { select: { slug: true, name: true } },
        project: { select: { name: true, publicId: true } },
      },
    });
    if (!row) throw new NotFoundError("Image not found");
    if (row.userId !== userId) throw new ForbiddenError("Not allowed");
    return toImageItem(row);
  }

  async list(userId: string, query: ImageListQuery): Promise<ImageListResponse> {
    const { page, limit, projectId, category, from, to, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ImageWhereInput = {
      userId,
      ...(projectId && { projectId }),
      ...(category && { category }),
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
        include: {
          template: { select: { slug: true, name: true } },
          project: { select: { name: true, publicId: true } },
        },
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
    const existing = await this.prisma.image.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Image not found");
    if (existing.userId !== userId) throw new ForbiddenError("Not allowed");

    const updated = await this.prisma.image.update({
      where: { id },
      data: { title: body.title, description: body.description },
      include: {
        template: { select: { slug: true, name: true } },
        project: { select: { name: true, publicId: true } },
      },
    });
    return toImageItem(updated);
  }

  async delete(userId: string, id: string): Promise<{ success: true }> {
    const existing = await this.prisma.image.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Image not found");
    if (existing.userId !== userId) throw new ForbiddenError("Not allowed");
    return this.deleteImageRow(existing.id, existing.cacheKey);
  }

  async bulkDelete(userId: string, ids: string[]): Promise<{ success: true; deleted: number }> {
    const rows = await this.prisma.image.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true, cacheKey: true },
    });

    let deleted = 0;
    for (const row of rows) {
      await this.deleteImageRow(row.id, row.cacheKey);
      deleted += 1;
    }
    return { success: true, deleted };
  }

  async deleteAsAdmin(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.image.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Image not found");
    return this.deleteImageRow(existing.id, existing.cacheKey);
  }

  private async deleteImageRow(id: string, cacheKey: string): Promise<{ success: true }> {
    const otherRefs = await this.prisma.image.count({
      where: { cacheKey, id: { not: id } },
    });

    if (otherRefs === 0) {
      try {
        await this.storage.delete(cacheKey);
      } catch (err) {
        logger.warn({ err, cacheKey }, "storage.delete failed — continuing");
      }
    }

    await this.prisma.image.delete({ where: { id } });
    return { success: true };
  }
}
