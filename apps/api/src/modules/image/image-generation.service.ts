import { singleton } from "tsyringe";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import {
  buildAiImagePrompt,
  ImageProviderService,
  PromptProviderService,
  resolveFalModelForPlan,
} from "@/common/services/ai";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper.service";
import { ImageStorageService } from "@/common/services/storage";
import { shouldWatermark, WatermarkService } from "@/common/services/watermark";
import { PrismaClient, type Image, type Plan } from "@/generated/prisma";
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
    private readonly scraper: ScraperService,
    private readonly templateService: TemplateService,
    private readonly usageService: UsageService,
    private readonly storage: ImageStorageService,
    private readonly imageProvider: ImageProviderService,
    private readonly promptProvider: PromptProviderService,
    private readonly watermarkService: WatermarkService,
    private readonly cache: ImageCacheService,
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, template, options } = params;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    await this.usageService.enforceQuota(userId, projectId, apiKeyId);

    const ctx = await this.buildRenderContext({
      userId,
      projectId,
      apiKeyId,
      url,
      template,
      options,
    });

    const cached = await this.lookupCached(ctx, options?.force === true);
    if (cached) {
      await this.usageService.recordUsage(userId, projectId, true, apiKeyId);
      await this.cache.incrementServeCount(cached.id);
      return toGenerateResponse(cached, { fromCache: true });
    }

    const { image, outcome, generationMs } = await this.runGenerationPipeline(ctx);

    await this.usageService.recordUsage(userId, projectId, false, apiKeyId);
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

    await this.usageService.enforceQuota(project.user.id, project.id);

    const ctx = await this.buildRenderContext({
      userId: project.user.id,
      projectId: project.id,
      apiKeyId: undefined,
      url,
      template,
      options,
    });

    const cached = await this.lookupCached(ctx, false);
    if (cached) {
      await this.usageService.recordUsage(project.user.id, project.id, true);
      await this.cache.incrementServeCount(cached.id);
      const buffer = await this.storage.get(cached.cacheKey);
      if (buffer) return buffer;
    }

    const { outcome, generationMs } = await this.runGenerationPipeline(ctx);

    await this.usageService.recordUsage(project.user.id, project.id, false);
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
    const metadata = await this.scraper.extractMetadata(ctx.url);
    const outcome = await this.renderWithAiFallback(
      metadata,
      ctx.template,
      ctx.options,
      ctx.aiModel,
      ctx.watermark,
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
    if (!model) {
      throw new ForbiddenError("AI image generation requires a Pro plan or higher.");
    }
    return { plan: user.plan, aiModel: model };
  }

  private async renderWithAiFallback(
    metadata: UrlMetadata,
    template: TemplateSlug,
    options: RenderOptions | undefined,
    aiModel: string | null,
    watermark: boolean,
  ): Promise<AiRenderOutcome> {
    const finalize = async (buf: Buffer): Promise<Buffer> =>
      watermark ? this.watermarkService.apply(buf) : buf;

    if (aiModel && this.imageProvider.isEnabledForModel(aiModel)) {
      const override = options?.aiPrompt ?? null;
      logger.info({ aiModel, hasOverride: Boolean(override) }, "AI image generation starting");
      const enrichedKeywords = override ? null : await this.promptProvider.generate(metadata);
      const prompt = buildAiImagePrompt(metadata, { override, enrichedKeywords });

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
