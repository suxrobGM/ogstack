import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ScraperService } from "@/common/services/scraper.service";
import { hashSha256 } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import { TemplateService, type RenderOptions, type TemplateSlug } from "@/modules/template";
import { UsageService } from "@/modules/usage";
import type { GenerateResponse } from "./generation.schema";

interface GenerateParams {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  template: TemplateSlug;
  options?: RenderOptions;
}

@singleton()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scraper: ScraperService,
    private readonly templateService: TemplateService,
    private readonly usageService: UsageService,
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, template, options } = params;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    await this.usageService.enforceQuota(userId, projectId, apiKeyId);

    const cacheKey = await this.buildCacheKey(projectId, url, template, options);
    const cached = await this.prisma.generatedImage.findUnique({ where: { cacheKey } });

    if (cached) {
      await this.usageService.recordUsage(userId, projectId, true, apiKeyId);
      await this.prisma.generatedImage.update({
        where: { id: cached.id },
        data: { serveCount: { increment: 1 } },
      });

      return {
        imageUrl: cached.cdnUrl ?? cached.imageUrl,
        cached: true,
        metadata: {
          title: cached.title,
          description: cached.description,
          favicon: cached.faviconUrl,
        },
      };
    }

    const startMs = performance.now();

    const metadata = await this.scraper.extractMetadata(url);
    const pngBuffer = await this.templateService.render(template, metadata, options);
    const generationMs = Math.round(performance.now() - startMs);

    const templateRecord = await this.prisma.template.findUnique({
      where: { slug: template },
      select: { id: true },
    });

    const imageUrl = await this.storeImage(cacheKey, pngBuffer);

    const image = await this.prisma.generatedImage.create({
      data: {
        userId,
        projectId,
        apiKeyId,
        templateId: templateRecord?.id,
        sourceUrl: url,
        cacheKey,
        imageUrl,
        title: metadata.ogTitle ?? metadata.title,
        description: metadata.ogDescription ?? metadata.description,
        faviconUrl: metadata.favicon,
        width: 1200,
        height: 630,
        format: "PNG",
        fileSize: pngBuffer.length,
        generationMs,
        serveCount: 1,
      },
    });

    await this.usageService.recordUsage(userId, projectId, false, apiKeyId);

    logger.info({ imageId: image.id, cacheKey, generationMs, template }, "OG image generated");

    return {
      imageUrl: image.imageUrl,
      cached: false,
      generationMs,
      metadata: {
        title: image.title,
        description: image.description,
        favicon: image.faviconUrl,
      },
    };
  }

  async generateImageByPublicId(
    publicId: string,
    url: string,
    template: TemplateSlug,
    options?: RenderOptions,
  ): Promise<Buffer> {
    const project = await this.resolveAndValidatePublicProject(publicId, url);

    await this.usageService.enforceQuota(project.user.id, project.id);

    const cacheKey = await this.buildCacheKey(project.id, url, template, options);
    const cached = await this.prisma.generatedImage.findUnique({ where: { cacheKey } });

    if (cached) {
      await this.usageService.recordUsage(project.user.id, project.id, true);
      await this.prisma.generatedImage.update({
        where: { id: cached.id },
        data: { serveCount: { increment: 1 } },
      });

      const imageResponse = await fetch(cached.cdnUrl ?? cached.imageUrl);
      return Buffer.from(await imageResponse.arrayBuffer());
    }

    const startMs = performance.now();

    const metadata = await this.scraper.extractMetadata(url);
    const pngBuffer = await this.templateService.render(template, metadata, options);
    const generationMs = Math.round(performance.now() - startMs);

    const templateRecord = await this.prisma.template.findUnique({
      where: { slug: template },
      select: { id: true },
    });

    const imageUrl = await this.storeImage(cacheKey, pngBuffer);

    await this.prisma.generatedImage.create({
      data: {
        userId: project.user.id,
        projectId: project.id,
        templateId: templateRecord?.id,
        sourceUrl: url,
        cacheKey,
        imageUrl,
        title: metadata.ogTitle ?? metadata.title,
        description: metadata.ogDescription ?? metadata.description,
        faviconUrl: metadata.favicon,
        width: 1200,
        height: 630,
        format: "PNG",
        fileSize: pngBuffer.length,
        generationMs,
        serveCount: 1,
      },
    });

    await this.usageService.recordUsage(project.user.id, project.id, false);

    logger.info({ cacheKey, generationMs, template }, "OG image generated (public)");
    return pngBuffer;
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
    options?: RenderOptions,
  ): Promise<string> {
    const normalized = JSON.stringify({ projectId, url, template, ...options });
    return hashSha256(normalized);
  }

  /** Store image and return its URL. Placeholder for R2/CDN integration. */
  private async storeImage(cacheKey: string, _buffer: Buffer): Promise<string> {
    return `/images/${cacheKey}.png`;
  }
}
