import { isPlanAtLeast, type ImageKind } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { ImageConflictError, NotFoundError, TierLockedError } from "@/common/errors";
import { logger } from "@/common/logger";
import { FAL_MODELS } from "@/common/services/ai";
import { ImageStorageService } from "@/common/services/storage";
import { PrismaClient } from "@/generated/prisma";
import type { RenderOptions } from "@/modules/template";
import { UsageService } from "@/modules/usage";
import { ImageCacheService } from "./image-cache.service";
import { RenderContextBuilder } from "./image-context.builder";
import { ImagePipelineService } from "./image-pipeline.service";
import { toGenerateResponse } from "./image.mapper";
import type { GenerateResponse } from "./image.schema";
import { PublicProjectResolver } from "./public-project.resolver";

interface GenerateParams {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  kind?: ImageKind;
  template?: string;
  options?: RenderOptions;
  /** When true, `options.aiPrompt` is used as-is as the full Flux prompt. */
  fullOverride?: boolean;
  /** When true, replace an existing image at the same (projectId, url). Deletes old R2 + row. */
  override?: boolean;
}

@singleton()
export class ImageGenerationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly usageService: UsageService,
    private readonly storage: ImageStorageService,
    private readonly cache: ImageCacheService,
    private readonly contextBuilder: RenderContextBuilder,
    private readonly pipeline: ImagePipelineService,
    private readonly publicResolver: PublicProjectResolver,
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, kind, template, options, fullOverride, override } =
      params;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    const ctx = await this.contextBuilder.build({
      userId,
      projectId,
      apiKeyId,
      url,
      kind: kind ?? "og",
      template,
      options,
      fullOverride: fullOverride ?? false,
    });

    const cached = await this.cache.find(ctx.cacheKey);
    if (cached && options?.force !== true) {
      await this.usageService.recordUsage(userId, projectId, { cacheHit: true, apiKeyId });
      await this.cache.incrementServeCount(cached.id);
      return toGenerateResponse(cached, { fromCache: true });
    }

    if (cached && options?.force === true) {
      await this.cache.evict(cached.id, cached.cacheKey);
    }

    await this.handleDuplicateUrl(projectId, url, ctx.cacheKey, override ?? false);

    if (ctx.aiModel) {
      await this.usageService.enforceAiImageQuota(userId, ctx.aiModel === FAL_MODELS.flux2Pro);
    }

    const { image, outcome, generationMs } = await this.pipeline.run(ctx);

    await this.usageService.recordUsage(userId, projectId, {
      cacheHit: false,
      apiKeyId,
      aiEnabled: outcome.aiEnabled,
      aiProModel: ctx.aiModel === FAL_MODELS.flux2Pro,
    });
    logger.info(
      {
        imageId: image.id,
        cacheKey: ctx.cacheKey,
        generationMs,
        template,
        aiEnabled: outcome.aiEnabled,
      },
      "OG image generated",
    );

    return toGenerateResponse(image, { fromCache: false, outcome, generationMs });
  }

  async generateByPublicId(
    publicId: string,
    url: string,
    template?: string,
    options?: RenderOptions,
    kind: ImageKind = "og",
  ): Promise<Buffer> {
    const project = await this.publicResolver.resolveAndValidate(publicId, url);

    const ctx = await this.contextBuilder.build({
      userId: project.user.id,
      projectId: project.id,
      apiKeyId: undefined,
      url,
      kind,
      template,
      options,
      fullOverride: false,
    });

    const cached = await this.cache.find(ctx.cacheKey);
    if (cached) {
      if (!isPlanAtLeast(project.user.plan, cached.generatedOnPlan)) {
        throw new TierLockedError(
          "This image was generated on a higher tier. Re-subscribe to serve it.",
        );
      }
      await this.usageService.recordUsage(project.user.id, project.id, { cacheHit: true });
      await this.cache.incrementServeCount(cached.id);
      const buffer = await this.storage.get(`${cached.cacheKey}.png`);
      if (buffer) return buffer;
    }

    if (ctx.aiModel) {
      await this.usageService.enforceAiImageQuota(
        project.user.id,
        ctx.aiModel === FAL_MODELS.flux2Pro,
      );
    }

    const { outcome, generationMs } = await this.pipeline.run(ctx);

    await this.usageService.recordUsage(project.user.id, project.id, {
      cacheHit: false,
      aiEnabled: outcome.aiEnabled,
      aiProModel: ctx.aiModel === FAL_MODELS.flux2Pro,
    });
    logger.info(
      { cacheKey: ctx.cacheKey, generationMs, template, aiEnabled: outcome.aiEnabled },
      "OG image generated (public)",
    );
    return outcome.pngBuffer;
  }

  /**
   * When an image already exists for (projectId, url) but with a different
   * cache key (different template/options), require explicit override. On
   * override, evict the old image + R2 object before continuing.
   */
  private async handleDuplicateUrl(
    projectId: string,
    url: string,
    newCacheKey: string,
    override: boolean,
  ): Promise<void> {
    const existing = await this.prisma.image.findFirst({
      where: { projectId, sourceUrl: url },
    });
    if (!existing) return;
    if (existing.cacheKey === newCacheKey) return;

    if (!override) {
      throw new ImageConflictError(
        "An image already exists for this URL with different settings. Pass override=true to replace it.",
        existing.id,
      );
    }

    await this.cache.evict(existing.id, existing.cacheKey);
  }
}
