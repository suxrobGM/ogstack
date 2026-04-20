import type { PageAnalysisAi, PageAnalysisResult } from "@ogstack/shared";
import { singleton } from "tsyringe";
import type { PromptAssetKind } from "@/common/services/ai/prompt-builders";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper";
import { Plan, PrismaClient } from "@/generated/prisma";
import { PageAnalysisAnalyzer } from "./page-analysis.analyzer";
import { toPublicMetadata } from "./page-analysis.mapper";
import { PageAnalysisRepository } from "./page-analysis.repository";

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
  metadata: UrlMetadata;
}

interface RefreshImagePromptParams {
  kind: PromptAssetKind;
  ai: PageAnalysisAi;
  metadata: UrlMetadata;
  previousPrompt: string | null;
  userPrompt?: string;
}

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
    private readonly analyzer: PageAnalysisAnalyzer,
    private readonly repository: PageAnalysisRepository,
  ) {}

  async analyze(params: AnalyzeParams): Promise<PageAnalysisResult> {
    const metadata = await this.scraper.extractMetadata(params.url);
    const { ai, cached } = await this.resolveAi({ ...params, metadata });

    return {
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
    const metadata = await this.scraper.extractMetadata(params.url);
    const { ai } = await this.resolveAi({ ...params, metadata });
    return { metadata, ai };
  }

  /**
   * Re-runs ONLY the image-prompt LLM step for a single asset kind, using the
   * already-cached page analysis as grounding. Used by the regenerate flow so
   * the user gets a visibly different image without re-scraping the page or
   * re-running full analysis. The new prompt is NOT persisted back to the
   * page-analysis cache — each regenerate should produce a fresh variant.
   * Returns null on any failure so callers can fall back to the cached prompt.
   */
  async refreshImagePrompt(params: RefreshImagePromptParams): Promise<string | null> {
    if (!this.analyzer.isEnabled()) return null;
    return this.analyzer.variationPrompt(params);
  }

  private async resolveAi(
    params: ResolveAiParams,
  ): Promise<{ ai: PageAnalysisAi | null; cached: boolean }> {
    const { metadata, url, userId, userPrompt, fullOverride, skipAi, cacheOnly } = params;

    const canUseAi = this.analyzer.isEnabled() && !skipAi;
    if (fullOverride || !canUseAi) {
      return { ai: null, cached: false };
    }

    const cacheKey = await PageAnalysisRepository.buildKey(url, metadata, userPrompt);
    const hit = await this.repository.find(cacheKey);
    if (hit) {
      return { ai: hit, cached: true };
    }
    if (cacheOnly) {
      return { ai: null, cached: false };
    }

    const ai = await this.analyzer.analyzePage(metadata, userPrompt);
    if (!ai) {
      return { ai: null, cached: false };
    }

    await this.repository.upsert({
      cacheKey,
      url,
      userId,
      metadata,
      ai,
      userPrompt: userPrompt,
      provider: this.analyzer.getActiveProvider(),
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
}
