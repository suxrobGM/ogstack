import type { PageAnalysisAi } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { sanitizeUserPrompt } from "@/common/services/ai";
import { type UrlMetadata } from "@/common/services/scraper";
import { hashSha256 } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import { toPublicMetadata } from "./page-analysis.mapper";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface UpsertCacheInput {
  cacheKey: string;
  url: string;
  userId: string | null;
  metadata: UrlMetadata;
  ai: PageAnalysisAi;
  userPrompt: string | undefined;
  provider: { id: string; model: string } | null;
}

@singleton()
export class PageAnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Returns the cached `PageAnalysisAi`, or null if absent or expired.
   * Expired rows are evicted as a side effect.
   */
  async find(cacheKey: string): Promise<PageAnalysisAi | null> {
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

  /**
   * Upserts the cache for a given URL + body + prompt combination
   */
  async upsert(input: UpsertCacheInput): Promise<void> {
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
    const publicMetadata = toPublicMetadata(input.metadata);
    const bodyHash = await hashSha256(input.metadata.bodyText ?? "");
    const sanitizedPrompt = sanitizeUserPrompt(input.userPrompt);
    const promptHash = sanitizedPrompt ? await hashSha256(sanitizedPrompt) : null;
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
          bodyHash,
          promptHash,
          provider: input.provider?.id ?? null,
          model: input.provider?.model ?? null,
          renderedWithJs: input.metadata.renderedWithJs,
          expiresAt,
        },
        update: {
          metadata: publicMetadata as unknown as object,
          ai: input.ai as unknown as object,
          provider: input.provider?.id ?? null,
          model: input.provider?.model ?? null,
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

  /**
   * Cache key is `sha256(url | bodyHash | promptHash)` — re-scrapes hit the
   * same row when the page body hasn't changed, even if crawl timestamps differ.
   */
  static async buildKey(url: string, metadata: UrlMetadata, userPrompt?: string): Promise<string> {
    const bodyHash = await hashSha256(metadata.bodyText ?? "");
    const promptHash = await hashSha256(sanitizeUserPrompt(userPrompt));
    return hashSha256(`${url}|${bodyHash}|${promptHash}`);
  }
}
