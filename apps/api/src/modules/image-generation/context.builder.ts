import {
  DEFAULT_TEMPLATE_SLUG_BY_KIND,
  resolveDimensions,
  type BlogHeroAspect,
  type ImageDimensions,
  type ImageKind,
  type PageAnalysisAi,
} from "@ogstack/shared";
import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { resolveFalModelForPlan, type BuildPromptOptions } from "@/common/services/ai";
import { FAL_MODELS } from "@/common/services/ai/image-providers/fal-ai.provider";
import { shouldWatermark } from "@/common/services/watermark";
import { Plan, PrismaClient } from "@/generated/prisma";
import type { RenderOptions } from "@/modules/template";
import { hasTemplate } from "@/modules/template/template.registry";
import { ImageRecordService } from "./record.service";

export interface RenderContextInput {
  userId: string;
  projectId: string;
  apiKeyId?: string;
  url: string;
  kind: ImageKind;
  /** Defaults to the kind-appropriate default slug. */
  template?: string;
  options?: RenderOptions;
  fullOverride: boolean;
}

export interface RenderContext extends Omit<RenderContextInput, "template"> {
  template: string;
  plan: Plan;
  aiModel: string | null;
  watermark: boolean;
  cacheKey: string;
  dimensions: ImageDimensions;
}

@singleton()
export class RenderContextBuilder {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly records: ImageRecordService,
  ) {}

  async build(input: RenderContextInput): Promise<RenderContext> {
    const template = this.resolveTemplate(input.kind, input.template);
    const dimensions = resolveDimensions(
      input.kind,
      input.options?.aspectRatio as BlogHeroAspect | undefined,
    );
    // Icon-set generation is always AI — the pipeline requires a Flux model
    // regardless of whether the caller opted into `aiGenerated`.
    const effectiveOptions =
      input.kind === "icon_set" ? { ...(input.options ?? {}), aiGenerated: true } : input.options;
    const { plan, aiModel } = await this.resolveUser(input.userId, effectiveOptions);
    const watermark = shouldWatermark(plan);
    const cacheKey = await this.records.buildKey({
      projectId: input.projectId,
      url: input.url,
      kind: input.kind,
      template,
      options: input.options,
      aiModel,
      watermark,
    });
    return { ...input, template, plan, aiModel, watermark, cacheKey, dimensions };
  }

  private resolveTemplate(kind: ImageKind, requested: string | undefined): string {
    if (kind === "icon_set") {
      // Icon-set generation doesn't use a template; the value is stored for
      // cache-key stability but the pipeline ignores it.
      return requested ?? "icon_default";
    }
    const slug = requested ?? DEFAULT_TEMPLATE_SLUG_BY_KIND[kind];
    if (!hasTemplate(slug)) {
      throw new NotFoundError(`Template "${slug}" not found`);
    }
    return slug;
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
      pageTheme: ai?.pageTheme ?? null,
      mood: ai?.imagePrompt.mood ?? null,
      palette: ai?.brandHints?.palette ?? null,
      accent: ai?.imagePrompt.suggestedAccent ?? null,
      industry: ai?.brandHints?.industry ?? null,
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

    const aiModel = this.resolveAiModel(user.plan, options.aiModel);
    return { plan: user.plan, aiModel };
  }

  private resolveAiModel(plan: Plan, requested?: "standard" | "pro"): string {
    if (requested === "pro" && plan === Plan.PRO) {
      return FAL_MODELS.flux2Pro;
    }
    if (requested === "standard") {
      return FAL_MODELS.flux2;
    }
    return resolveFalModelForPlan(plan);
  }
}
