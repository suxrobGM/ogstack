import type { PageAnalysisAi, PageAnalysisResult } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import {
  PAGE_ANALYSIS_SYSTEM_PROMPT,
  parseJsonResponse,
  PromptProviderService,
  sanitizeUserPrompt,
} from "@/common/services/ai";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper";
import { hashSha256 } from "@/common/utils/crypto";
import { Plan, PrismaClient } from "@/generated/prisma";
import { extractBrandSignals, type BrandSignals } from "./brand-signals";
import { toPublicMetadata } from "./page-analysis.mapper";

const BODY_EXCERPT_CHARS = 4500;
const MAX_JSON_LD_ENTITIES = 3;

interface AnalyzeParams {
  url: string;
  userId: string | null;
  userPrompt?: string;
  fullOverride?: boolean;
  skipAi?: boolean;
}

interface PageContextParams extends AnalyzeParams {
  /** Return cached AI context if present, but never spend tokens on a fresh LLM call. */
  cacheOnly?: boolean;
}

interface ResolveAiParams extends PageContextParams {
  plan: Plan;
  metadata: UrlMetadata;
}

interface PersistAnalysisParams {
  cacheKey: string;
  url: string;
  userId: string | null;
  metadata: UrlMetadata;
  ai: PageAnalysisAi;
  userPrompt: string;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h in ms

/**
 * Analyzes a page for its title, description, summary, key points, topics,
 * and image-prompt seeds. Free-tier users get classic scrape only; Pro+ users
 * get an LLM pass that also produces image prompt seeds consumable by the
 * image generation pipeline (so image gen doesn't need a second LLM round-trip).
 * Results are cached for 24h.
 */
@singleton()
export class PageAnalysisService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scraper: ScraperService,
    private readonly promptProvider: PromptProviderService,
  ) {}

  async analyze(params: AnalyzeParams): Promise<PageAnalysisResult> {
    const { url, userId, userPrompt, fullOverride, skipAi } = params;
    const plan = await this.resolvePlan(userId);
    const metadata = await this.scraper.extractMetadata(url, {
      allowHeadless: plan !== Plan.FREE,
    });

    const { ai, cached } = await this.resolveAi({
      plan,
      metadata,
      url,
      userId,
      userPrompt,
      fullOverride,
      skipAi,
    });

    return {
      mode: ai ? "ai" : "classic",
      metadata: toPublicMetadata(metadata),
      ai,
      cached,
    };
  }

  /**
   * Page context for downstream consumers (image generation, audit). Scrapes
   * metadata and returns the cached AI summary when available. Pass
   * `cacheOnly: true` to skip a fresh LLM call on cache miss — use this when
   * the caller can usefully continue without AI context.
   */
  async getPageContext(params: PageContextParams): Promise<{
    metadata: UrlMetadata;
    ai: PageAnalysisAi | null;
  }> {
    const { url, userId, userPrompt, fullOverride, skipAi, cacheOnly } = params;
    const plan = await this.resolvePlan(userId);
    const metadata = await this.scraper.extractMetadata(url, {
      allowHeadless: plan !== Plan.FREE,
    });

    const { ai } = await this.resolveAi({
      plan,
      metadata,
      url,
      userId,
      userPrompt,
      fullOverride,
      skipAi,
      cacheOnly,
    });
    return { metadata, ai };
  }

  private async resolveAi(
    params: ResolveAiParams,
  ): Promise<{ ai: PageAnalysisAi | null; cached: boolean }> {
    const { plan, metadata, url, userId, userPrompt, fullOverride, skipAi, cacheOnly } = params;

    const canUseAi = plan !== Plan.FREE && this.promptProvider.isEnabled() && !skipAi;
    if (fullOverride || !canUseAi) {
      return { ai: null, cached: false };
    }

    const cacheKey = await this.buildCacheKey(url, metadata, userPrompt);
    const cached = await this.findCached(cacheKey);
    if (cached) {
      return { ai: cached, cached: true };
    }

    if (cacheOnly) {
      return { ai: null, cached: false };
    }

    const ai = await this.runAnalysis(metadata, userPrompt);
    if (!ai) {
      return { ai: null, cached: false };
    }

    await this.persist({
      cacheKey,
      url,
      userId,
      metadata,
      ai,
      userPrompt: sanitizeUserPrompt(userPrompt),
    });

    return { ai, cached: false };
  }

  private async resolvePlan(userId: string | null): Promise<Plan> {
    if (!userId) {
      return Plan.FREE;
    }
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    return record?.plan ?? Plan.FREE;
  }

  private async runAnalysis(
    metadata: UrlMetadata,
    userPrompt?: string,
  ): Promise<PageAnalysisAi | null> {
    const brandSignals = await extractBrandSignals(metadata);
    const raw = await this.promptProvider.chat({
      system: PAGE_ANALYSIS_SYSTEM_PROMPT,
      user: this.buildAnalyzeUserMessage(metadata, brandSignals, userPrompt),
      json: true,
      temperature: 0.3,
      maxTokens: 6000,
    });
    if (!raw) return null;
    const parsed = parseJsonResponse<PageAnalysisAi>(raw);
    if (!parsed) {
      logger.warn(
        { sample: raw.slice(0, 200) },
        "Page analysis LLM response was not valid JSON — falling back to classic",
      );
      return null;
    }

    return parsed;
  }

  private async findCached(cacheKey: string): Promise<PageAnalysisAi | null> {
    try {
      const row = await this.prisma.pageAnalysis.findUnique({ where: { cacheKey } });
      if (!row) return null;
      if (row.expiresAt.getTime() < Date.now()) {
        await this.prisma.pageAnalysis.delete({ where: { id: row.id } }).catch(() => undefined);
        return null;
      }
      return row.ai as PageAnalysisAi | null;
    } catch {
      return null;
    }
  }

  private async persist(input: PersistAnalysisParams): Promise<void> {
    const provider = this.promptProvider.getActiveProvider();
    const expiresAt = new Date(Date.now() + CACHE_TTL);
    const publicMetadata = toPublicMetadata(input.metadata);
    try {
      await this.prisma.pageAnalysis.upsert({
        where: { cacheKey: input.cacheKey },
        create: {
          cacheKey: input.cacheKey,
          url: input.url,
          userId: input.userId,
          mode: "ai",
          metadata: publicMetadata as unknown as object,
          ai: input.ai as unknown as object,
          bodyHash: await hashSha256(input.metadata.bodyText ?? ""),
          promptHash: input.userPrompt ? await hashSha256(input.userPrompt) : null,
          provider: provider?.id ?? null,
          model: provider?.model ?? null,
          renderedWithJs: input.metadata.renderedWithJs,
          expiresAt,
        },
        update: {
          metadata: publicMetadata as unknown as object,
          ai: input.ai as unknown as object,
          provider: provider?.id ?? null,
          model: provider?.model ?? null,
          renderedWithJs: input.metadata.renderedWithJs,
          expiresAt,
        },
      });
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        "Failed to persist page analysis cache",
      );
    }
  }

  private async buildCacheKey(
    url: string,
    metadata: UrlMetadata,
    userPrompt?: string,
  ): Promise<string> {
    const bodyHash = await hashSha256(metadata.bodyText ?? "");
    const promptHash = await hashSha256(sanitizeUserPrompt(userPrompt));
    return hashSha256(`${url}|${bodyHash}|${promptHash}`);
  }

  private buildAnalyzeUserMessage(
    metadata: UrlMetadata,
    brandSignals: BrandSignals,
    userPrompt?: string,
  ): string {
    const page = {
      url: metadata.url,
      title: metadata.ogTitle ?? metadata.title,
      description: metadata.ogDescription ?? metadata.description,
      siteName: metadata.siteName,
      lang: metadata.lang,
      locale: metadata.locale,
      canonicalUrl: metadata.canonicalUrl,
      h1: metadata.h1,
      h2s: metadata.h2s.slice(0, 4),
      tags: metadata.tags.slice(0, 10),
      publishedTime: metadata.publishedTime,
      modifiedTime: metadata.modifiedTime,
      section: metadata.section,
      author: metadata.author,
      twitter: {
        card: metadata.twitterCard,
        title: metadata.twitterTitle,
        description: metadata.twitterDescription,
        image: metadata.twitterImage,
      },
      jsonLd: metadata.jsonLd.slice(0, MAX_JSON_LD_ENTITIES).map((entity) => ({
        type: entity.type,
        headline: entity.headline,
        name: entity.name,
        description: entity.description,
        image: entity.image,
        author: entity.author,
        datePublished: entity.datePublished,
        dateModified: entity.dateModified,
      })),
      faviconUrl: metadata.favicon,
      bodyText: metadata.bodyText?.slice(0, BODY_EXCERPT_CHARS) ?? null,
      isThinHtml: metadata.isThinHtml,
    };

    const directive = sanitizeUserPrompt(userPrompt);
    const parts = [
      `page: ${JSON.stringify(page)}`,
      `brandSignals: ${JSON.stringify(brandSignals)}`,
    ];
    if (directive) {
      parts.push(
        `userDirective: ${JSON.stringify(directive)} (apply ONLY to imagePrompt.backgroundKeywords, mood, and suggestedAccent)`,
      );
    }
    return parts.join("\n\n");
  }
}
