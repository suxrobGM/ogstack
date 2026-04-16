import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import {
  AUDIT_ANALYSIS_SYSTEM_PROMPT,
  parseJsonResponse,
  PromptProviderService,
} from "@/common/services/ai";
import type { AuditMetadata } from "./audit.extractor";
import type { AuditAiInsights, AuditIssue } from "./audit.schema";

const ANALYSIS_TIMEOUT_MS = 30_000;

interface AnalyzeParams {
  metadata: AuditMetadata;
  issues: AuditIssue[];
}

/** Generates audit-focused AI insights: suggested OG/Twitter rewrites, tone
 *  assessment, content gaps, and CTR tips. Distinct from `PageAnalysisService`,
 *  which is oriented toward image-generation seeding. */
@singleton()
export class AuditAnalysisService {
  constructor(private readonly promptProvider: PromptProviderService) {}

  isEnabled(): boolean {
    return this.promptProvider.isEnabled();
  }

  async analyze(params: AnalyzeParams): Promise<AuditAiInsights> {
    const raw = await this.promptProvider.chat({
      system: AUDIT_ANALYSIS_SYSTEM_PROMPT,
      user: this.buildUserMessage(params.metadata, params.issues),
      json: true,
      temperature: 0.3,
      maxTokens: 5000,
    });

    if (!raw) {
      throw new BadRequestError(
        "AI provider returned no response (timeout, connection error, or provider rejected the request). Check server logs.",
      );
    }

    const parsed = parseJsonResponse<AuditAiInsights>(raw);
    if (!parsed) {
      logger.warn({ sample: raw.slice(0, 400) }, "Audit analysis LLM response was not valid JSON");
      const preview = raw.slice(0, 160).replace(/\s+/g, " ").trim();
      throw new BadRequestError(`AI returned non-JSON output. First chars: "${preview}"`);
    }

    return parsed;
  }

  private buildUserMessage(metadata: AuditMetadata, issues: AuditIssue[]): string {
    const currentTags = {
      url: metadata.url,
      title: metadata.title,
      description: metadata.description,
      h1Count: metadata.h1Count,
      lang: metadata.lang,
      og: {
        title: metadata.ogTitle,
        description: metadata.ogDescription,
        image: metadata.ogImage,
        type: metadata.ogType,
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

    return [
      `currentTags: ${JSON.stringify(currentTags)}`,
      `existingIssues: ${JSON.stringify(failingIssues)}`,
    ].join("\n\n");
  }
}
