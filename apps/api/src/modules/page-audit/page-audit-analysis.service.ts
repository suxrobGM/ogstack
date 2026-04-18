import type { PageAnalysisAi } from "@ogstack/shared/types";
import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import {
  AUDIT_ANALYSIS_SYSTEM_PROMPT,
  parseJsonResponse,
  PromptProviderService,
} from "@/common/services/ai";
import type { UrlMetadata } from "@/common/services/scraper";
import type { PageAuditAiInsights, PageAuditIssue } from "./page-audit.schema";
import { structuredDataTypes } from "./page-audit.scoring";

interface AnalyzeParams {
  metadata: UrlMetadata;
  issues: PageAuditIssue[];
  pageAnalysis?: PageAnalysisAi | null;
}

/** Generates audit-focused AI insights: suggested OG/Twitter rewrites, tone
 *  assessment, content gaps, and CTR tips. Distinct from `PageAnalysisService`,
 *  which is oriented toward image-generation seeding. */
@singleton()
export class PageAuditAnalysisService {
  constructor(private readonly promptProvider: PromptProviderService) {}

  isEnabled(): boolean {
    return this.promptProvider.isEnabled();
  }

  async analyze(params: AnalyzeParams): Promise<PageAuditAiInsights> {
    const raw = await this.promptProvider.chat({
      system: AUDIT_ANALYSIS_SYSTEM_PROMPT,
      user: this.buildUserMessage(params.metadata, params.issues, params.pageAnalysis ?? null),
      json: true,
      temperature: 0.3,
      maxTokens: 6000,
    });

    if (!raw) {
      throw new BadRequestError(
        "AI provider returned no response (timeout, connection error, or provider rejected the request). Check server logs.",
      );
    }

    const parsed = parseJsonResponse<PageAuditAiInsights>(raw);
    if (!parsed) {
      logger.warn({ sample: raw.slice(0, 400) }, "Audit analysis LLM response was not valid JSON");
      const preview = raw.slice(0, 160).replace(/\s+/g, " ").trim();
      throw new BadRequestError(`AI returned non-JSON output. First chars: "${preview}"`);
    }

    return parsed;
  }

  private buildUserMessage(
    metadata: UrlMetadata,
    issues: PageAuditIssue[],
    pageAnalysis: PageAnalysisAi | null,
  ): string {
    const currentTags = {
      url: metadata.url,
      title: metadata.title,
      description: metadata.description,
      canonical: metadata.canonicalUrl,
      robots: metadata.robots,
      lang: metadata.lang,
      favicon: metadata.favicon,
      h1Count: metadata.h1Count,
      imageCount: metadata.imageCount,
      imagesMissingAlt: metadata.imagesMissingAlt,
      structuredDataTypes: structuredDataTypes(metadata),
      hreflangVariants: metadata.hreflangVariants,
      og: {
        title: metadata.ogTitle,
        description: metadata.ogDescription,
        image: metadata.ogImage,
        imageWidth: metadata.ogImageWidth,
        imageHeight: metadata.ogImageHeight,
        type: metadata.ogType,
        url: metadata.ogUrl,
        siteName: metadata.ogSiteName,
      },
      twitter: {
        card: metadata.twitterCard,
        title: metadata.twitterTitle,
        description: metadata.twitterDescription,
        image: metadata.twitterImage,
      },
    };

    const failingIssues = issues
      .filter((i) => !i.pass)
      .map((i) => ({ id: i.id, category: i.category, title: i.title }));

    const parts = [
      `currentTags: ${JSON.stringify(currentTags)}`,
      `existingIssues: ${JSON.stringify(failingIssues)}`,
    ];

    if (pageAnalysis) {
      const pageContext = {
        summary: pageAnalysis.summary,
        topics: pageAnalysis.topics,
        contentType: pageAnalysis.contentType,
        language: pageAnalysis.language,
        pageTheme: pageAnalysis.pageTheme,
        brandHints: pageAnalysis.brandHints,
        contentSignals: pageAnalysis.contentSignals,
      };
      parts.push(`pageAnalysis: ${JSON.stringify(pageContext)}`);
    }

    return parts.join("\n\n");
  }
}
