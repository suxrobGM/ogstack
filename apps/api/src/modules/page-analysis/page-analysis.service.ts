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
import { toPublicMetadata } from "./page-analysis.mapper";
import type { PageAnalysisAi, PageAnalysisResult } from "./page-analysis.types";

const BODY_EXCERPT_CHARS = 3000;

interface AnalyzeParams {
  url: string;
  userId: string | null;
  userPrompt?: string;
  fullOverride?: boolean;
  skipAi?: boolean;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h in ms

// Max time to wait for the LLM analysis before falling back to classic metadata.
const ANALYSIS_TIMEOUT = 30_000;

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

    const allowHeadless = plan !== Plan.FREE;
    const metadata = await this.scraper.extractMetadata(url, { allowHeadless });
    const canUseAi = plan !== Plan.FREE && this.promptProvider.isEnabled() && !skipAi;

    // Full override or caller skipAi: user's prompt is the truth, or the caller
    // explicitly opted out — don't spend tokens on AI analysis.
    if (fullOverride || !canUseAi) {
      return {
        mode: "classic",
        metadata: toPublicMetadata(metadata),
        ai: null,
        cached: false,
      };
    }

    const cacheKey = await this.buildCacheKey(url, metadata, userPrompt);
    const cached = await this.findCached(cacheKey);
    if (cached) {
      return {
        mode: "ai",
        metadata: toPublicMetadata(metadata),
        ai: cached,
        cached: true,
      };
    }

    const ai = await this.runAnalysis(metadata, userPrompt);
    if (!ai) {
      return {
        mode: "classic",
        metadata: toPublicMetadata(metadata),
        ai: null,
        cached: false,
      };
    }

    await this.persist({
      cacheKey,
      url,
      userId,
      metadata,
      ai,
      userPrompt: sanitizeUserPrompt(userPrompt),
    });

    return {
      mode: "ai",
      metadata: toPublicMetadata(metadata),
      ai,
      cached: false,
    };
  }

  /** Used by the image-generation pipeline. Returns the cached AI result if
   *  present, otherwise runs a fresh analysis. Keeps the LLM call at most
   *  once per (url, userPrompt) combination within the TTL window. */
  async getForImageGeneration(params: AnalyzeParams): Promise<{
    metadata: UrlMetadata;
    ai: PageAnalysisAi | null;
  }> {
    const { url, userId, userPrompt, fullOverride, skipAi } = params;
    const plan = await this.resolvePlan(userId);
    const metadata = await this.scraper.extractMetadata(url, {
      allowHeadless: plan !== Plan.FREE,
    });

    const canUseAi = plan !== Plan.FREE && this.promptProvider.isEnabled() && !skipAi;

    if (fullOverride || !canUseAi) {
      return { metadata, ai: null };
    }

    const cacheKey = await this.buildCacheKey(url, metadata, userPrompt);
    const cached = await this.findCached(cacheKey);
    if (cached) {
      return { metadata, ai: cached };
    }

    const ai = await this.runAnalysis(metadata, userPrompt);
    if (ai) {
      await this.persist({
        cacheKey,
        url,
        userId,
        metadata,
        ai,
        userPrompt: sanitizeUserPrompt(userPrompt),
      });
    }
    return { metadata, ai };
  }

  private async resolvePlan(userId: string | null): Promise<Plan> {
    if (!userId) return Plan.FREE;
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    return record?.plan ?? Plan.FREE;
  }

  private async runAnalysis(
    metadata: UrlMetadata,
    userPrompt: string | undefined,
  ): Promise<PageAnalysisAi | null> {
    const raw = await this.promptProvider.chat(
      {
        system: PAGE_ANALYSIS_SYSTEM_PROMPT,
        user: this.buildAnalyzeUserMessage(metadata, userPrompt),
        json: true,
        temperature: 0.3,
        maxTokens: 5000,
      },
      { timeoutMs: ANALYSIS_TIMEOUT },
    );
    if (!raw) return null;
    const parsed = parseJsonResponse<PageAnalysisAi>(raw);
    if (!parsed) {
      logger.warn(
        { sample: raw.slice(0, 200) },
        "Page analysis LLM response was not valid JSON — falling back to classic",
      );
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

  private async persist(input: {
    cacheKey: string;
    url: string;
    userId: string | null;
    metadata: UrlMetadata;
    ai: PageAnalysisAi;
    userPrompt: string;
  }): Promise<void> {
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

  private buildAnalyzeUserMessage(metadata: UrlMetadata, userPrompt: string | undefined): string {
    const page = {
      url: metadata.url,
      title: metadata.ogTitle ?? metadata.title,
      description: metadata.ogDescription ?? metadata.description,
      siteName: metadata.siteName,
      lang: metadata.lang,
      h1: metadata.h1,
      h2s: metadata.h2s.slice(0, 4),
      tags: metadata.tags.slice(0, 10),
      publishedTime: metadata.publishedTime,
      author: metadata.author,
      bodyText: metadata.bodyText?.slice(0, BODY_EXCERPT_CHARS) ?? null,
      isThinHtml: metadata.isThinHtml,
    };

    const directive = sanitizeUserPrompt(userPrompt);
    const parts = [`page: ${JSON.stringify(page)}`];
    if (directive) {
      parts.push(
        `userDirective: ${JSON.stringify(directive)} (apply ONLY to imagePrompt.backgroundKeywords, mood, and suggestedAccent)`,
      );
    }
    return parts.join("\n\n");
  }
}
