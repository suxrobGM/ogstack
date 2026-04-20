import { isPlanAtLeast, type ImageKind } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { ImageConflictError, NotFoundError, TierLockedError } from "@/common/errors";
import { logger } from "@/common/logger";
import { FAL_MODELS } from "@/common/services/ai";
import { ImageStorageService } from "@/common/services/storage";
import { PrismaClient, type Image } from "@/generated/prisma";
import { fromPrismaImageKind, toPrismaImageKind } from "@/modules/image/image.mapper";
import { PublicProjectResolver } from "@/modules/project/public-project.resolver";
import type { RenderOptions } from "@/modules/template";
import { UsageService } from "@/modules/usage";
import { RenderContextBuilder, type RenderContext } from "./context.builder";
import { toGenerateResponse } from "./generation.mapper";
import type { AiOptions, AiParam, GenerateResponse, StyleOptions } from "./generation.schema";
import { ImagePipelineService } from "./pipeline.service";
import { ImageRecordService } from "./record.service";

interface GenerateParams {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  kind?: ImageKind;
  template?: string;
  style?: StyleOptions;
  ai?: AiParam;
  /** Forces regeneration even if an image (og and favicons) already exists for the URL with a different cache key. */
  force?: boolean;
}

interface GenerateByPublicIdParams {
  publicId: string;
  url: string;
  kind?: ImageKind;
  template?: string;
  style?: StyleOptions;
  ai?: AiParam;
}

type PublicProject = Awaited<ReturnType<PublicProjectResolver["resolveAndValidate"]>>;

@singleton()
export class ImageGenerationService {
  /** Single-flight per URL to coalesce concurrent crawler hits. */
  private readonly inflightPublic = new Map<string, Promise<Buffer>>();

  constructor(
    private readonly prisma: PrismaClient,
    private readonly usageService: UsageService,
    private readonly storage: ImageStorageService,
    private readonly records: ImageRecordService,
    private readonly contextBuilder: RenderContextBuilder,
    private readonly pipeline: ImagePipelineService,
    private readonly publicResolver: PublicProjectResolver,
  ) {}

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const { userId, projectId, apiKeyId, url, kind, template, style, ai, force } = params;
    const aiOptions = normalizeAi(ai);

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
      options: flattenRenderOptions(style, aiOptions),
      fullOverride: aiOptions?.override ?? false,
    });

    const cached = await this.records.find(ctx.cacheKey);
    if (cached && !force) {
      await this.usageService.recordUsage(userId, projectId, { cacheHit: true, apiKeyId });
      await this.records.incrementServeCount(cached.id);
      return toGenerateResponse(cached, { fromCache: true });
    }

    // Only ask for a fresh LLM prompt when the user is explicitly re-running the same config (same cacheKey)
    const forceNewPrompt = Boolean(cached && force);
    if (cached && force) {
      await this.records.evict(cached.id, cached.cacheKey, ctx.kind);
    }

    await this.handleDuplicateUrl(projectId, url, ctx.cacheKey, ctx.kind, force ?? false);

    if (ctx.aiModel) {
      await this.usageService.enforceAiImageQuota(userId, ctx.aiModel === FAL_MODELS.flux2Pro);
    }

    const { image, outcome, generationMs } = await this.pipeline.run(ctx, { forceNewPrompt });

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
        kind: ctx.kind,
        generationMs,
        template,
        aiEnabled: outcome.aiEnabled,
        aiProModel: ctx.aiModel === FAL_MODELS.flux2Pro,
      },
      "Image generated",
    );

    return toGenerateResponse(image, { fromCache: false, outcome, generationMs });
  }

  async generateByPublicId(params: GenerateByPublicIdParams): Promise<Buffer> {
    const { publicId, url, kind, template, style, ai } = params;
    const project = await this.publicResolver.resolveAndValidate(publicId, url);
    const resolvedKind = kind ?? "og";

    // One image per (projectId, url, kind) is enforced for OG, so the saved
    // row is canonical - the meta-tag query string need not match cacheKey.
    const existing = await this.findByUrl(project.id, url, resolvedKind);
    if (existing) {
      return this.serveExisting(project, existing);
    }

    const ctx = await this.contextBuilder.build({
      userId: project.user.id,
      projectId: project.id,
      apiKeyId: undefined,
      url,
      kind: resolvedKind,
      template,
      options: flattenRenderOptions(style, normalizeAi(ai)),
      fullOverride: false,
    });

    const flightKey = `${project.id}:${resolvedKind}:${url}`;
    const inflight = this.inflightPublic.get(flightKey);
    if (inflight) {
      return inflight;
    }

    const task = this.renderPublicImage(project, ctx).finally(() => {
      this.inflightPublic.delete(flightKey);
    });
    this.inflightPublic.set(flightKey, task);
    return task;
  }

  private async findByUrl(projectId: string, url: string, kind: ImageKind) {
    return this.prisma.image.findFirst({
      where: { projectId, sourceUrl: url, kind: toPrismaImageKind(kind) },
    });
  }

  private async serveExisting(project: PublicProject, image: Image): Promise<Buffer> {
    if (!isPlanAtLeast(project.user.plan, image.generatedOnPlan)) {
      throw new TierLockedError(
        "This image was generated on a higher tier. Re-subscribe to serve it.",
      );
    }
    const buffer = await this.storage.get(`${image.cacheKey}.png`);

    if (buffer) {
      await this.usageService.recordUsage(project.user.id, project.id, { cacheHit: true });
      await this.records.incrementServeCount(image.id);
      return buffer;
    }

    logger.warn({ cacheKey: image.cacheKey, imageId: image.id }, "Row without blob, evicting");
    await this.records.evict(image.id, image.cacheKey, fromPrismaImageKind(image.kind));
    throw new NotFoundError("Image is being regenerated, retry shortly.");
  }

  private async renderPublicImage(project: PublicProject, ctx: RenderContext): Promise<Buffer> {
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
      {
        cacheKey: ctx.cacheKey,
        generationMs,
        template: ctx.template,
        aiEnabled: outcome.aiEnabled,
      },
      "OG image generated (public)",
    );
    return outcome.pngBuffer;
  }

  /**
   * When an image of the same kind already exists for (projectId, url) but
   * with a different cache key, require `force`. Blog heroes skip the check
   * entirely - multiple covers per URL are allowed since they're standalone
   * assets, not tied to a single meta tag.
   */
  private async handleDuplicateUrl(
    projectId: string,
    url: string,
    newCacheKey: string,
    kind: ImageKind,
    force: boolean,
  ): Promise<void> {
    if (kind === "blog_hero") return;

    const existing = await this.prisma.image.findFirst({
      where: { projectId, sourceUrl: url, kind: toPrismaImageKind(kind) },
    });
    if (!existing) return;
    if (existing.cacheKey === newCacheKey) return;

    if (!force) {
      throw new ImageConflictError(
        kind === "icon_set"
          ? "A favicon set already exists for this URL. Pass force=true to replace it."
          : "An image already exists for this URL with different settings. Pass force=true to replace it.",
        existing.id,
      );
    }

    await this.records.evict(existing.id, existing.cacheKey, kind);
  }
}

function normalizeAi(ai: AiParam | undefined): AiOptions | null {
  if (ai == null) return null;
  return ai === true ? {} : ai;
}

function flattenRenderOptions(
  style: StyleOptions | null | undefined,
  ai: AiOptions | null | undefined,
): RenderOptions {
  return {
    accent: style?.accent,
    dark: style?.dark,
    font: style?.font,
    logoUrl: style?.logo?.url,
    logoPosition: style?.logo?.position,
    aspectRatio: style?.aspectRatio,
    aiGenerated: ai != null,
    aiModel: ai?.model,
    aiPrompt: ai?.prompt,
  };
}
