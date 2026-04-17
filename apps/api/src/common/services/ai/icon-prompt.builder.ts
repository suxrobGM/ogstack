import type { PageAnalysisAi } from "@ogstack/shared/types";
import type { UrlMetadata } from "@/common/services/scraper.service";

const MAX_PROMPT_CHARS = 900;

/**
 * Builds a Flux prompt tuned for *icons* rather than OG preview images. The
 * single biggest quality win is explicit direction against gradients and thin
 * detail — both destroy legibility at 16-32px after downsampling.
 */
export function buildIconPrompt(
  metadata: UrlMetadata,
  ai: PageAnalysisAi | null,
  override?: string | null,
): string {
  if (override && override.trim()) {
    return override.trim().slice(0, MAX_PROMPT_CHARS);
  }

  const brand =
    ai?.brandHints?.inferredName?.trim() ||
    metadata.siteName ||
    safeHost(metadata.url) ||
    "the brand";

  const industry = ai?.brandHints?.industry?.trim();
  const palette = (ai?.brandHints?.palette ?? []).slice(0, 2).filter(Boolean);
  const accent = ai?.imagePrompt?.suggestedAccent;

  const colorLine =
    palette.length > 0
      ? `Primary palette: ${palette.join(", ")}.`
      : accent
        ? `Primary color: ${accent}.`
        : "Clean, bold color with strong contrast.";

  const industryLine = industry ? ` Industry context: ${industry}.` : "";

  const lines = [
    `A minimal flat vector logo mark for "${brand}".`,
    `${colorLine}${industryLine}`,
    "Single iconic symbol, centered on a transparent or solid square background.",
    "Simple geometric forms — circles, arcs, rectangles — no text, no letters, no wordmark.",
    "No gradients, no thin strokes, no ornamental detail. The mark must remain legible when downsampled to 16×16 pixels.",
    "High contrast, crisp edges, flat-fill design language. Vector-style illustration.",
  ];

  return lines.join(" ").slice(0, MAX_PROMPT_CHARS);
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
