import type { PageAnalysisMood, PageTheme } from "@ogstack/shared/types";
import type { UrlMetadata } from "@/common/services/scraper.service";
import {
  MAX_HEADLINE_CHARS,
  MAX_PROMPT_CHARS,
  MAX_SUBJECT_CHARS,
  MAX_TAGLINE_CHARS,
  MOOD_LIGHTING,
  STYLE_LEAD,
  STYLE_TAIL,
  THEME_STYLE,
  TYPOGRAPHY_DIRECTIVE,
} from "../constants";
import { clip, extractHeadline, extractTagline, formatPalette } from "../helpers";

export interface BuildPromptOptions {
  /** User-supplied prompt that fully replaces the auto-derived subject. */
  override?: string | null;
  /**
   * Visual keywords produced by a `PromptEnricher` (LLM pre-step) — used
   * strictly as the background layer, not the focal subject.
   */
  enrichedKeywords?: string | null;
  /**
   * Precomputed headline from AI content extraction — replaces the
   * `extractHeadline` heuristic when provided.
   */
  overrideHeadline?: string | null;
  /**
   * Precomputed tagline from AI content extraction — replaces the
   * `extractTagline` heuristic when provided.
   */
  overrideTagline?: string | null;
  pageTheme?: PageTheme | null;
  mood?: PageAnalysisMood | null;
  palette?: string[] | null;
  accent?: string | null;
  industry?: string | null;
}

function buildStyleSuffix(options: BuildPromptOptions): string {
  const parts = [STYLE_LEAD];
  const themeLine = options.pageTheme ? THEME_STYLE[options.pageTheme] : THEME_STYLE.editorial;
  parts.push(themeLine);

  const moodLine = options.mood ? MOOD_LIGHTING[options.mood] : null;
  if (moodLine) {
    parts.push(moodLine);
  }

  const paletteLine = formatPalette(options.palette, options.accent);
  if (paletteLine) {
    parts.push(paletteLine);
  }
  if (options.industry && options.industry.trim()) {
    parts.push(`${options.industry.trim()} sector aesthetic`);
  }
  parts.push(STYLE_TAIL);
  return parts.join(", ");
}

/**
 * Deterministic fallback for OG / hero prompts when the LLM didn't produce a
 * per-asset prompt. Leads with the headline + typography directive (FLUX
 * weights early tokens heavily), then describes background + style.
 */
export function buildOgFallback(metadata: UrlMetadata, options: BuildPromptOptions = {}): string {
  const { override, enrichedKeywords, overrideHeadline, overrideTagline } = options;

  if (override && override.trim()) {
    return clip(override, MAX_SUBJECT_CHARS).slice(0, MAX_PROMPT_CHARS);
  }

  const title = metadata.ogTitle ?? metadata.title;
  const description = metadata.ogDescription ?? metadata.description;
  const styleSuffix = buildStyleSuffix(options);

  const background = enrichedKeywords?.trim()
    ? clip(enrichedKeywords, MAX_SUBJECT_CHARS)
    : "abstract modern tech composition, soft gradient backdrop, subtle geometric motifs";

  const headlineSource = overrideHeadline?.trim() || title;

  if (!headlineSource) {
    return `${background}. ${styleSuffix}`.slice(0, MAX_PROMPT_CHARS);
  }

  const headline = overrideHeadline?.trim()
    ? clip(overrideHeadline, MAX_HEADLINE_CHARS)
    : extractHeadline(headlineSource);

  const tagline = overrideTagline?.trim()
    ? clip(overrideTagline, MAX_TAGLINE_CHARS)
    : description
      ? extractTagline(description)
      : null;

  const lines: string[] = [];
  lines.push(
    `A social media preview card with the headline "${headline}" ${TYPOGRAPHY_DIRECTIVE}.`,
  );
  if (tagline) {
    lines.push(
      `Below the headline, a smaller sub-headline reads "${tagline}" in a thinner weight of the same sans-serif typeface.`,
    );
  }
  lines.push(`Background: ${background}.`);
  lines.push(styleSuffix);

  return lines.join(" ").slice(0, MAX_PROMPT_CHARS);
}
