import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import {
  buildAiImagePrompt,
  FAL_MODELS,
  ImageProviderService,
  resolveFalModelForPlan,
  type BuildPromptOptions,
} from "@/common/services/ai";
import { type UrlMetadata } from "@/common/services/scraper";
import { ImageStorageService } from "@/common/services/storage";
import { shouldWatermark, WatermarkService } from "@/common/services/watermark";
import { PrismaClient, type Image, type Plan } from "@/generated/prisma";
import { PageAnalysisService, type PageAnalysisAi } from "@/modules/page-analysis";
import {
  getTemplate,
  TemplateService,
  type RenderOptions,
  type TemplateSlug,
} from "@/modules/template";
import { UsageService } from "@/modules/usage";
import { ImageCacheService } from "./image-cache.service";
import { toGenerateResponse, type AiRenderOutcome } from "./image.mapper";
import type { GenerateResponse } from "./image.schema";

interface GenerateParams {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  template: TemplateSlug;
  options?: RenderOptions;
  /** When true, `options.aiPrompt` is used as-is as the full Flux prompt and
   *  no AI content extraction runs. Defaults to false (blend mode). */
  fullOverride?: boolean;
}

/** Everything the pipeline needs, resolved once at the start of a request. */
interface RenderContext {
  userId: string;
  projectId: string;
  apiKeyId: string | undefined;
  url: string;
  template: TemplateSlug;
  options: RenderOptions | undefined;
  plan: Plan;
  aiModel: string | null;
  watermark: boolean;
  cacheKey: string;
  fullOverride: boolean;
}

interface PipelineResult {
  image: Image;
  outcome: AiRenderOutcome;
  generationMs: number;
}

@singleton()
export class ImageGenerationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly templateService: TemplateService,
    private readonly usageService: UsageService,
    private readonly storage: ImageStorageService,
    private readonly imageProvider: ImageProviderService,
    private readonly pageAnalysis: PageAnalysisService,
    private readonly watermarkService: WatermarkService,
    private readonly cache: ImageCacheService,
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, template, options, fullOverride } = params;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    const ctx = await this.buildRenderContext({
      userId,
      projectId,
      apiKeyId,
      url,
      template,
      options,
      fullOverride: fullOverride ?? false,
    });

    const cached = await this.lookupCached(ctx, options?.force === true);
    if (cached) {
      await this.usageService.recordUsage(userId, projectId, { cacheHit: true, apiKeyId });
      await this.cache.incrementServeCount(cached.id);
      return toGenerateResponse(cached, { fromCache: true });
    }

    if (ctx.aiModel) {
      await this.usageService.enforceAiImageQuota(userId, ctx.aiModel === "fal-ai/flux-2-pro");
    }

    const { image, outcome, generationMs } = await this.runGenerationPipeline(ctx);

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
    template: TemplateSlug,
    options?: RenderOptions,
  ): Promise<Buffer> {
    const project = await this.resolveAndValidatePublicProject(publicId, url);

    const ctx = await this.buildRenderContext({
      userId: project.user.id,
      projectId: project.id,
      apiKeyId: undefined,
      url,
      template,
      options,
      fullOverride: false,
    });

    const cached = await this.lookupCached(ctx, false);
    if (cached) {
      await this.usageService.recordUsage(project.user.id, project.id, { cacheHit: true });
      await this.cache.incrementServeCount(cached.id);
      const buffer = await this.storage.get(cached.cacheKey);
      if (buffer) return buffer;
    }

    if (ctx.aiModel) {
      await this.usageService.enforceAiImageQuota(
        project.user.id,
        ctx.aiModel === FAL_MODELS.flux2Pro,
      );
    }

    const { outcome, generationMs } = await this.runGenerationPipeline(ctx);

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

  /** Resolves plan, AI model, watermark flag, and cache key — done once per request. */
  private async buildRenderContext(
    input: Omit<RenderContext, "plan" | "aiModel" | "watermark" | "cacheKey">,
  ): Promise<RenderContext> {
    const { plan, aiModel } = await this.resolveUserRenderContext(input.userId, input.options);
    const watermark = shouldWatermark(plan);
    const cacheKey = await this.cache.buildKey({
      projectId: input.projectId,
      url: input.url,
      template: input.template,
      options: input.options,
      aiModel,
      watermark,
    });
    return { ...input, plan, aiModel, watermark, cacheKey };
  }

  private resolveHeadlineBuildOptions(
    ai: PageAnalysisAi | null,
    options: RenderOptions | undefined,
    fullOverride: boolean,
  ): BuildPromptOptions {
    if (fullOverride) {
      return {
        override: options?.aiPrompt ?? null,
        enrichedKeywords: null,
        overrideHeadline: null,
        overrideTagline: null,
      };
    }
    return {
      override: null,
      enrichedKeywords: ai?.imagePrompt.backgroundKeywords ?? null,
      overrideHeadline: ai?.imagePrompt.headline ?? null,
      overrideTagline: ai?.imagePrompt.tagline ?? null,
    };
  }

  /** Returns a cached image or null; evicts when `force` is true. */
  private async lookupCached(ctx: RenderContext, force: boolean): Promise<Image | null> {
    const cached = await this.cache.find(ctx.cacheKey);
    if (cached && force) {
      logger.info(
        { imageId: cached.id, cacheKey: ctx.cacheKey },
        "Force regenerate — evicting cached image",
      );
      await this.cache.evict(cached.id, ctx.cacheKey);
      return null;
    }
    return cached;
  }

  /** Core render pipeline: scrape, render (AI + fallback + watermark), store, persist. */
  private async runGenerationPipeline(ctx: RenderContext): Promise<PipelineResult> {
    const startMs = performance.now();
    const { metadata, ai } = await this.pageAnalysis.getForImageGeneration({
      url: ctx.url,
      userId: ctx.userId,
      userPrompt: ctx.options?.aiPrompt,
      fullOverride: ctx.fullOverride,
      // AI seeds are only consumed by AI-image rendering. Template-only flows
      // skip the LLM entirely to keep token usage off the hot path.
      skipAi: !ctx.aiModel,
    });
    const outcome = await this.renderWithAiFallback(
      metadata,
      ai,
      ctx.template,
      ctx.options,
      ctx.aiModel,
      ctx.watermark,
      ctx.fullOverride,
    );
    const generationMs = Math.round(performance.now() - startMs);

    const stored = await this.storage.store(ctx.cacheKey, outcome.pngBuffer);
    const templateRecord = await this.prisma.template.findUnique({
      where: { slug: ctx.template },
      select: { id: true },
    });

    const image = await this.prisma.image.create({
      data: {
        userId: ctx.userId,
        projectId: ctx.projectId,
        apiKeyId: ctx.apiKeyId ?? null,
        templateId: templateRecord?.id ?? null,
        sourceUrl: ctx.url,
        cacheKey: ctx.cacheKey,
        imageUrl: stored.url,
        title: metadata.ogTitle ?? metadata.title,
        description: metadata.ogDescription ?? metadata.description,
        faviconUrl: metadata.favicon,
        width: 1200,
        height: 630,
        format: "PNG",
        fileSize: stored.size,
        generationMs,
        serveCount: 1,
        category: getTemplate(ctx.template).info.category,
        aiEnabled: outcome.aiEnabled,
        aiModel: outcome.aiModel,
        aiPrompt: outcome.aiPrompt,
      },
    });

    return { image, outcome, generationMs };
  }

  private async resolveUserRenderContext(
    userId: string,
    options?: RenderOptions,
  ): Promise<{ plan: Plan; aiModel: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!options?.aiGenerated) {
      return { plan: user.plan, aiModel: null };
    }

    const model = resolveFalModelForPlan(user.plan);
    return { plan: user.plan, aiModel: model };
  }

  private async renderWithAiFallback(
    metadata: UrlMetadata,
    ai: PageAnalysisAi | null,
    template: TemplateSlug,
    options: RenderOptions | undefined,
    aiModel: string | null,
    watermark: boolean,
    fullOverride: boolean,
  ): Promise<AiRenderOutcome> {
    const finalize = async (buf: Buffer): Promise<Buffer> =>
      watermark ? this.watermarkService.apply(buf) : buf;

    if (aiModel && this.imageProvider.isEnabledForModel(aiModel)) {
      const promptOptions = this.resolveHeadlineBuildOptions(ai, options, fullOverride);
      logger.info(
        {
          aiModel,
          hasOverride: Boolean(promptOptions.override),
          hasAiExtraction: Boolean(ai),
        },
        "AI image generation starting",
      );
      const prompt = buildAiImagePrompt(metadata, promptOptions);

      try {
        const rawBuffer = await this.imageProvider.generate({ model: aiModel, prompt });
        return {
          pngBuffer: await finalize(rawBuffer),
          aiEnabled: true,
          aiFellBack: false,
          aiModel,
          aiPrompt: prompt,
        };
      } catch (error) {
        logger.warn(
          { template, error: error instanceof Error ? error.message : String(error) },
          "AI image generation failed, falling back to template render",
        );
        const rawBuffer = await this.templateService.render(template, metadata, options);
        return {
          pngBuffer: await finalize(rawBuffer),
          aiEnabled: false,
          aiFellBack: true,
          aiModel: null,
          aiPrompt: null,
        };
      }
    }

    const rawBuffer = await this.templateService.render(template, metadata, options);
    return {
      pngBuffer: await finalize(rawBuffer),
      aiEnabled: false,
      aiFellBack: false,
      aiModel: null,
      aiPrompt: null,
    };
  }

  private async resolveAndValidatePublicProject(publicId: string, url: string) {
    const project = await this.prisma.project.findUnique({
      where: { publicId },
      include: { user: { select: { id: true } } },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.domains.length > 0) {
      const hostname = new URL(url).hostname;
      const allowed = project.domains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
      if (!allowed) {
        throw new BadRequestError("Domain not allowed for this project");
      }
    }

    return project;
  }
}
