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
import { hashSha256 } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import {
  getTemplate,
  TemplateService,
  type RenderOptions,
  type TemplateSlug,
} from "@/modules/template";
import { UsageService } from "@/modules/usage";
import type { GenerateResponse } from "./image.schema";

interface GenerateParams {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  template: TemplateSlug;
  options?: RenderOptions;
}

interface AiRenderOutcome {
  pngBuffer: Buffer;
  aiEnabled: boolean;
  aiFellBack: boolean;
  aiModel: string | null;
  aiPrompt: string | null;
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
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, template, options } = params;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    await this.usageService.enforceQuota(userId, projectId, apiKeyId);

    const aiModel = await this.resolveAiModelOrThrow(userId, options);
    const cacheKey = await this.buildCacheKey(projectId, url, template, options, aiModel);
    const cached = await this.prisma.image.findUnique({ where: { cacheKey } });
    const force = options?.force === true;

    if (cached && force) {
      logger.info({ imageId: cached.id, cacheKey }, "Force regenerate — evicting cached image");
      await this.evictCached(cached.id, cacheKey);
    } else if (cached) {
      await this.usageService.recordUsage(userId, projectId, true, apiKeyId);
      await this.prisma.image.update({
        where: { id: cached.id },
        data: { serveCount: { increment: 1 } },
      });

      return {
        imageUrl: cached.cdnUrl ?? cached.imageUrl,
        cached: true,
        aiEnabled: cached.aiEnabled,
        aiModel: cached.aiModel,
        aiPrompt: cached.aiPrompt,
        metadata: {
          title: cached.title,
          description: cached.description,
          favicon: cached.faviconUrl,
        },
      };
    }

    const startMs = performance.now();

    const metadata = await this.scraper.extractMetadata(url);
    const outcome = await this.renderWithAiFallback(metadata, template, options, aiModel);
    const generationMs = Math.round(performance.now() - startMs);

    const templateRecord = await this.prisma.template.findUnique({
      where: { slug: template },
      select: { id: true },
    });

    const stored = await this.storage.store(cacheKey, outcome.pngBuffer);

    const image = await this.prisma.image.create({
      data: {
        userId,
        projectId,
        apiKeyId: apiKeyId ?? null,
        templateId: templateRecord?.id ?? null,
        sourceUrl: url,
        cacheKey,
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
        category: getTemplate(template).info.category,
        aiEnabled: outcome.aiEnabled,
        aiModel: outcome.aiModel,
        aiPrompt: outcome.aiPrompt,
      },
    });

    await this.usageService.recordUsage(userId, projectId, false, apiKeyId);

    logger.info(
      { imageId: image.id, cacheKey, generationMs, template, aiEnabled: outcome.aiEnabled },
      "OG image generated",
    );

    return {
      imageUrl: image.imageUrl,
      cached: false,
      generationMs,
      aiEnabled: outcome.aiEnabled,
      aiFellBack: outcome.aiFellBack || undefined,
      aiModel: outcome.aiModel,
      aiPrompt: outcome.aiPrompt,
      metadata: {
        title: image.title,
        description: image.description,
        favicon: image.faviconUrl,
      },
    };
  }

  async generateByPublicId(
    publicId: string,
    url: string,
    template: TemplateSlug,
    options?: RenderOptions,
  ): Promise<Buffer> {
    const project = await this.resolveAndValidatePublicProject(publicId, url);

    await this.usageService.enforceQuota(project.user.id, project.id);

    const aiModel = await this.resolveAiModelOrThrow(project.user.id, options);
    const cacheKey = await this.buildCacheKey(project.id, url, template, options, aiModel);
    const cached = await this.prisma.image.findUnique({ where: { cacheKey } });

    if (cached) {
      await this.usageService.recordUsage(project.user.id, project.id, true);
      await this.prisma.image.update({
        where: { id: cached.id },
        data: { serveCount: { increment: 1 } },
      });

      const buffer = await this.storage.get(cacheKey);
      if (buffer) return buffer;
    }

    const startMs = performance.now();

    const metadata = await this.scraper.extractMetadata(url);
    const outcome = await this.renderWithAiFallback(metadata, template, options, aiModel);
    const generationMs = Math.round(performance.now() - startMs);

    const templateRecord = await this.prisma.template.findUnique({
      where: { slug: template },
      select: { id: true },
    });

    const stored = await this.storage.store(cacheKey, outcome.pngBuffer);

    await this.prisma.image.create({
      data: {
        userId: project.user.id,
        projectId: project.id,
        templateId: templateRecord?.id,
        sourceUrl: url,
        cacheKey,
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
        category: getTemplate(template).info.category,
        aiEnabled: outcome.aiEnabled,
        aiModel: outcome.aiModel,
        aiPrompt: outcome.aiPrompt,
      },
    });

    await this.usageService.recordUsage(project.user.id, project.id, false);

    logger.info(
      { cacheKey, generationMs, template, aiEnabled: outcome.aiEnabled },
      "OG image generated (public)",
    );
    return outcome.pngBuffer;
  }

  private async resolveAiModelOrThrow(
    userId: string,
    options?: RenderOptions,
  ): Promise<string | null> {
    if (!options?.aiGenerated) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const model = resolveFalModelForPlan(user.plan);
    if (!model) {
      throw new ForbiddenError("AI image generation requires a Pro plan or higher.");
    }
    return model;
  }

  private async renderWithAiFallback(
    metadata: UrlMetadata,
    template: TemplateSlug,
    options: RenderOptions | undefined,
    aiModel: string | null,
  ): Promise<AiRenderOutcome> {
    if (aiModel && this.imageProvider.isEnabledForModel(aiModel)) {
      const override = options?.aiPrompt ?? null;
      logger.info({ aiModel, hasOverride: Boolean(override) }, "AI image generation starting");
      const enrichedKeywords = override ? null : await this.promptProvider.generate(metadata);
      const prompt = buildAiImagePrompt(metadata, { override, enrichedKeywords });

      try {
        const pngBuffer = await this.imageProvider.generate({ model: aiModel, prompt });
        return {
          pngBuffer,
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
        const pngBuffer = await this.templateService.render(template, metadata, options);
        return {
          pngBuffer,
          aiEnabled: false,
          aiFellBack: true,
          aiModel: null,
          aiPrompt: null,
        };
      }
    }

    const pngBuffer = await this.templateService.render(template, metadata, options);
    return {
      pngBuffer,
      aiEnabled: false,
      aiFellBack: false,
      aiModel: null,
      aiPrompt: null,
    };
  }

  private async evictCached(imageId: string, cacheKey: string): Promise<void> {
    try {
      await this.storage.delete(cacheKey);
    } catch (error) {
      logger.warn(
        { cacheKey, error: error instanceof Error ? error.message : String(error) },
        "Failed to delete storage blob during force regenerate (continuing)",
      );
    }
    await this.prisma.image.delete({ where: { id: imageId } });
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

  private async buildCacheKey(
    projectId: string,
    url: string,
    template: string,
    options: RenderOptions | undefined,
    aiModel: string | null,
  ): Promise<string> {
    const normalized = JSON.stringify({
      projectId,
      url,
      template,
      ...options,
      aiModel,
    });
    return hashSha256(normalized);
  }
}
