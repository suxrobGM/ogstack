import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { resolveFalModelForPlan, type BuildPromptOptions } from "@/common/services/ai";
import { shouldWatermark } from "@/common/services/watermark";
import { PrismaClient, type Plan } from "@/generated/prisma";
import type { PageAnalysisAi } from "@/modules/page-analysis";
import type { RenderOptions, TemplateSlug } from "@/modules/template";
import { ImageCacheService } from "./image-cache.service";

export interface RenderContextInput {
  userId: string;
  projectId: string;
  apiKeyId: string | undefined;
  url: string;
  template: TemplateSlug;
  options: RenderOptions | undefined;
  fullOverride: boolean;
}

export interface RenderContext extends RenderContextInput {
  plan: Plan;
  aiModel: string | null;
  watermark: boolean;
  cacheKey: string;
}

@singleton()
export class RenderContextBuilder {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: ImageCacheService,
  ) {}

  async build(input: RenderContextInput): Promise<RenderContext> {
    const { plan, aiModel } = await this.resolveUser(input.userId, input.options);
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

  /**
   * When `fullOverride` is true, the user's raw prompt is used as the complete
   * Flux prompt. Otherwise, blend the AI-extracted headline/tagline/keywords
   * with the template render for a coherent output.
   */
  resolveHeadlineOptions(
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

  private async resolveUser(
    userId: string,
    options?: RenderOptions,
  ): Promise<{ plan: Plan; aiModel: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) throw new NotFoundError("User not found");

    if (!options?.aiGenerated) {
      return { plan: user.plan, aiModel: null };
    }

    return { plan: user.plan, aiModel: resolveFalModelForPlan(user.plan) };
  }
}
