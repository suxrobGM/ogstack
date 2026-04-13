import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { Prisma, PrismaClient, type UserRole } from "@/generated/prisma";
import { ImageService } from "@/modules/image/image.service";
import type { PaginatedResponse } from "@/types/response";
import type { AdminImage, AdminImageListQuery } from "./admin.schema";

@singleton()
export class AdminImageService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly imageService: ImageService,
  ) {}

  async listImages(query: AdminImageListQuery): Promise<PaginatedResponse<AdminImage>> {
    const { page, limit, search, userId, projectId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ImageWhereInput = {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
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
          user: { select: { email: true } },
          project: { select: { name: true } },
          template: { select: { name: true } },
        },
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      items: items.map((img) => ({
        id: img.id,
        userId: img.userId,
        userEmail: img.user?.email ?? "",
        projectId: img.projectId,
        projectName: img.project?.name ?? "",
        sourceUrl: img.sourceUrl,
        cdnUrl: img.cdnUrl,
        title: img.title,
        template: img.template?.name ?? null,
        serveCount: img.serveCount,
        createdAt: img.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteImage(
    imageId: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<{ success: true }> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      select: { id: true, userId: true, projectId: true, cacheKey: true },
    });
    if (!image) throw new NotFoundError("Image not found");

    const result = await this.imageService.deleteAsAdmin(imageId);

    await this.prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action: "DELETE_IMAGE",
        entityType: "Image",
        entityId: imageId,
        metadata: {
          ownerUserId: image.userId,
          projectId: image.projectId,
          cacheKey: image.cacheKey,
        },
      },
    });

    return result;
  }
}
