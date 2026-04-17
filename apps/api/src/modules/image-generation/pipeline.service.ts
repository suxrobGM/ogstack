import type { PageAnalysisAi } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { buildAiImagePrompt, ImageProviderService } from "@/common/services/ai";
import { type UrlMetadata } from "@/common/services/scraper";
import { ImageStorageService } from "@/common/services/storage";
import { WatermarkService } from "@/common/services/watermark";
import { PrismaClient, type Image } from "@/generated/prisma";
import { toPrismaImageKind } from "@/modules/image/image.mapper";
import { PageAnalysisService } from "@/modules/page-analysis";
import { getTemplate, TemplateService, type TemplateSlug } from "@/modules/template";
import { RenderContextBuilder, type RenderContext } from "./context.builder";
import type { AiRenderOutcome } from "./generation.mapper";
import { IconPipelineService } from "./icon-pipeline.service";

export interface PipelineResult {
  image: Image;
  outcome: AiRenderOutcome;
  generationMs: number;
}

@singleton()
export class ImagePipelineService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly templateService: TemplateService,
    private readonly imageProvider: ImageProviderService,
    private readonly storage: ImageStorageService,
    private readonly watermarkService: WatermarkService,
    private readonly pageAnalysis: PageAnalysisService,
    private readonly contextBuilder: RenderContextBuilder,
    private readonly iconPipeline: IconPipelineService,
  ) {}

  /** Scrape → (optional LLM) → render → store → persist. */
  async run(ctx: RenderContext): Promise<PipelineResult> {
    if (ctx.kind === "icon_set") {
      return this.iconPipeline.run(ctx);
    }
    const startMs = performance.now();
    const { metadata, ai } = await this.pageAnalysis.getPageContext({
      url: ctx.url,
      userId: ctx.userId,
      userPrompt: ctx.options?.aiPrompt,
      fullOverride: ctx.fullOverride,
      // AI seeds are only consumed by AI-image rendering. Template-only flows
      // skip the LLM to keep token usage off the hot path.
      skipAi: !ctx.aiModel,
    });

    const outcome = await this.renderWithAiFallback(metadata, ai, ctx);
    const generationMs = Math.round(performance.now() - startMs);

    const stored = await this.storage.store(`${ctx.cacheKey}.png`, outcome.pngBuffer);
    const imageUrl = `${stored.url}?v=${Date.now()}`;

    // Only OG rows link back to a Template DB record (hero and icon kinds
    // live in their own registries and don't seed DB template rows).
    const templateRecord =
      ctx.kind === "og"
        ? await this.prisma.template.findUnique({
            where: { slug: ctx.template },
            select: { id: true },
          })
        : null;

    const category = this.resolveCategory(ctx);

    const image = await this.prisma.image.create({
      data: {
        userId: ctx.userId,
        projectId: ctx.projectId,
        apiKeyId: ctx.apiKeyId ?? null,
        templateId: templateRecord?.id ?? null,
        kind: toPrismaImageKind(ctx.kind),
        sourceUrl: ctx.url,
        cacheKey: ctx.cacheKey,
        imageUrl,
        title: metadata.ogTitle ?? metadata.title,
        description: metadata.ogDescription ?? metadata.description,
        faviconUrl: metadata.favicon,
        width: ctx.dimensions.width,
        height: ctx.dimensions.height,
        format: "PNG",
        fileSize: stored.size,
        generationMs,
        serveCount: 1,
        category,
        aiEnabled: outcome.aiEnabled,
        aiModel: outcome.aiModel,
        aiPrompt: outcome.aiPrompt,
        generatedOnPlan: ctx.plan,
      },
    });

    return { image, outcome, generationMs };
  }

  private resolveCategory(ctx: RenderContext): string | null {
    if (ctx.kind === "icon_set") return null;
    return getTemplate(ctx.template as TemplateSlug).info.category;
  }

  private async renderWithAiFallback(
    metadata: UrlMetadata,
    ai: PageAnalysisAi | null,
    ctx: RenderContext,
  ): Promise<AiRenderOutcome> {
    const finalize = async (buf: Buffer): Promise<Buffer> =>
      ctx.watermark ? this.watermarkService.apply(buf) : buf;

    if (ctx.aiModel && this.imageProvider.isEnabledForModel(ctx.aiModel)) {
      const promptOptions = this.contextBuilder.resolveHeadlineOptions(
        ai,
        ctx.options,
        ctx.fullOverride,
      );
      logger.info(
        {
          aiModel: ctx.aiModel,
          hasOverride: Boolean(promptOptions.override),
          hasAiExtraction: Boolean(ai),
        },
        "AI image generation starting",
      );
      const prompt = buildAiImagePrompt(metadata, promptOptions);

      try {
        const rawBuffer = await this.imageProvider.generate({ model: ctx.aiModel, prompt });
        return {
          pngBuffer: await finalize(rawBuffer),
          aiEnabled: true,
          aiFellBack: false,
          aiModel: ctx.aiModel,
          aiPrompt: prompt,
        };
      } catch (error) {
        logger.warn(
          { template: ctx.template, error: error instanceof Error ? error.message : String(error) },
          "AI image generation failed, falling back to template render",
        );
        return this.renderTemplate(metadata, finalize, true, ctx);
      }
    }

    return this.renderTemplate(metadata, finalize, false, ctx);
  }

  private async renderTemplate(
    metadata: UrlMetadata,
    finalize: (buf: Buffer) => Promise<Buffer>,
    aiFellBack: boolean,
    ctx: RenderContext,
  ): Promise<AiRenderOutcome> {
    const rawBuffer = await this.templateService.render(
      ctx.template,
      metadata,
      ctx.options,
      ctx.dimensions,
    );
    return {
      pngBuffer: await finalize(rawBuffer),
      aiEnabled: false,
      aiFellBack,
      aiModel: null,
      aiPrompt: null,
    };
  }
}
