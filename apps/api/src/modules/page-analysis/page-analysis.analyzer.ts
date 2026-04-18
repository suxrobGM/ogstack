import type { PageAnalysisAi } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import {
  IMAGE_PROMPT_VARIATION_SYSTEM_PROMPT,
  PAGE_ANALYSIS_SYSTEM_PROMPT,
  parseJsonResponse,
  PromptProviderService,
  sanitizeUserPrompt,
} from "@/common/services/ai";
import type { PromptAssetKind } from "@/common/services/ai/prompt-builders";
import { type UrlMetadata } from "@/common/services/scraper";
import { extractBrandSignals, type BrandSignals } from "./brand-signals";

const BODY_EXCERPT_CHARS = 4500;
const MAX_JSON_LD_ENTITIES = 3;

interface VariationPromptParams {
  kind: PromptAssetKind;
  ai: PageAnalysisAi;
  metadata: UrlMetadata;
  previousPrompt: string | null;
  userPrompt?: string;
}

/**
 * LLM-facing layer of the page-analysis module. Owns the two chat calls the
 * module makes (full analysis, single-kind prompt variation) and the user-
 * message builders that shape each call. Kept separate from the service so
 * caching/orchestration concerns don't tangle with prompt engineering.
 */
@singleton()
export class PageAnalysisAnalyzer {
  constructor(private readonly promptProvider: PromptProviderService) {}

  isEnabled(): boolean {
    return this.promptProvider.isEnabled();
  }

  getActiveProvider(): { id: string; model: string } | null {
    return this.promptProvider.getActiveProvider();
  }

  /**
   * Full page analysis — structured summary + brand + image-prompt seeds.
   * Returns null on transport failure or malformed JSON so callers can
   * degrade to classic-scrape mode.
   */
  async analyzePage(metadata: UrlMetadata, userPrompt?: string): Promise<PageAnalysisAi | null> {
    const brandSignals = await extractBrandSignals(metadata);
    const raw = await this.promptProvider.chat({
      system: PAGE_ANALYSIS_SYSTEM_PROMPT,
      user: buildAnalyzeUserMessage(metadata, brandSignals, userPrompt),
      json: true,
      temperature: 0.3,
      maxTokens: 6000,
    });

    if (!raw) {
      return null;
    }

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

  /**
   * Single-asset prompt variation for the regenerate flow. Uses the cached
   * analysis as grounding but asks for a visibly different composition.
   * Higher temperature than `analyzePage` so successive regenerates explore
   * distinct answers.
   */
  async variationPrompt(params: VariationPromptParams): Promise<string | null> {
    const raw = await this.promptProvider.chat({
      system: IMAGE_PROMPT_VARIATION_SYSTEM_PROMPT,
      user: buildVariationUserMessage(params),
      json: true,
      temperature: 0.9,
      maxTokens: 1200,
    });
    if (!raw) return null;

    const parsed = parseJsonResponse<{ prompt?: string }>(raw);
    const next = parsed?.prompt?.trim();
    if (!next) {
      logger.warn(
        { kind: params.kind, sample: raw.slice(0, 200) },
        "Image prompt variation returned invalid JSON — keeping cached prompt",
      );
      return null;
    }
    return next;
  }
}

function buildAnalyzeUserMessage(
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
  const parts = [`page: ${JSON.stringify(page)}`, `brandSignals: ${JSON.stringify(brandSignals)}`];
  if (directive) {
    parts.push(
      `userDirective: ${JSON.stringify(directive)} (apply ONLY to imagePrompt.backgroundKeywords, mood, and suggestedAccent)`,
    );
  }
  return parts.join("\n\n");
}

function buildVariationUserMessage(params: VariationPromptParams): string {
  const { kind, ai, metadata, previousPrompt, userPrompt } = params;
  const context = {
    kind,
    pageTheme: ai.pageTheme,
    mood: ai.imagePrompt.mood,
    headline: ai.imagePrompt.headline,
    tagline: ai.imagePrompt.tagline,
    backgroundKeywords: ai.imagePrompt.backgroundKeywords,
    suggestedAccent: ai.imagePrompt.suggestedAccent,
    brandHints: ai.brandHints,
    topics: ai.topics.slice(0, 5),
    title: ai.title,
    summary: ai.summary,
    siteName: metadata.siteName,
  };
  const directive = sanitizeUserPrompt(userPrompt);
  const parts = [
    `context: ${JSON.stringify(context)}`,
    `previousPrompt: ${JSON.stringify(previousPrompt ?? "")}`,
  ];
  if (directive) {
    parts.push(`userDirective: ${JSON.stringify(directive)}`);
  }
  return parts.join("\n\n");
}
