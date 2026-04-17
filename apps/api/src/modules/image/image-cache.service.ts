import type { ImageKind } from "@ogstack/shared/constants";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { ImageStorageService } from "@/common/services/storage";
import { hashSha256 } from "@/common/utils/crypto";
import { PrismaClient, type Image } from "@/generated/prisma";
import type { RenderOptions } from "@/modules/template";

interface BuildKeyInput {
  projectId: string;
  url: string;
  kind: ImageKind;
  template: string;
  options: RenderOptions | undefined;
  aiModel: string | null;
  watermark: boolean;
}

@singleton()
export class ImageCacheService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: ImageStorageService,
  ) {}

  buildKey(input: BuildKeyInput): Promise<string> {
    const { force, ...stableOptions } = input.options ?? {};
    const normalized = JSON.stringify({
      projectId: input.projectId,
      url: input.url,
      kind: input.kind,
      template: input.template,
      ...stableOptions,
      aiModel: input.aiModel,
      watermark: input.watermark,
    });
    return hashSha256(normalized);
  }

  find(cacheKey: string): Promise<Image | null> {
    return this.prisma.image.findUnique({ where: { cacheKey } });
  }

  async incrementServeCount(imageId: string): Promise<void> {
    await this.prisma.image.update({
      where: { id: imageId },
      data: { serveCount: { increment: 1 } },
    });
  }

  async evict(imageId: string, cacheKey: string): Promise<void> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      select: { kind: true },
    });
    try {
      // Icon sets live under a per-generation prefix; everything else is a
      // single `.png` file keyed on the cacheKey.
      const key = image?.kind === "ICON_SET" ? `${cacheKey}/` : `${cacheKey}.png`;
      await this.storage.delete(key);
    } catch (error) {
      logger.warn(
        { cacheKey, error: error instanceof Error ? error.message : String(error) },
        "Failed to delete storage blob during eviction (continuing)",
      );
    }
    await this.prisma.image.delete({ where: { id: imageId } });
  }
}
