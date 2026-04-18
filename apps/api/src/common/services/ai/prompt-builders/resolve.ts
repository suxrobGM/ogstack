import type { PageAnalysisAi } from "@ogstack/shared/types";
import type { UrlMetadata } from "@/common/services/scraper.service";
import {
  MAX_ICON_PROMPT_CHARS,
  MAX_PROMPT_CHARS,
  MAX_SUBJECT_CHARS,
  type PromptAssetKind,
} from "./constants";
import { buildDeterministicTail } from "./deterministic-tail";
import { buildIconFallback } from "./fallbacks/icon-fallback";
import { buildOgFallback, type BuildPromptOptions } from "./fallbacks/og-fallback";
import { clip } from "./helpers";

export interface ResolvePromptArgs {
  kind: PromptAssetKind;
  metadata: UrlMetadata;
  ai: PageAnalysisAi | null;
  /** OG/hero render options. For icon generation, only `.override` is read. */
  options?: BuildPromptOptions;
}

/**
 * Single entry point for FLUX prompt construction across asset kinds.
 *
 * Short-circuits in this order:
 * 1.`options.override` — user-supplied prompt from the playground. Used
 *    verbatim + deterministic tail (size + palette). Never reaches the LLM.
 * 2.`ai.imagePrompts[kind]` — LLM-authored prompt from page analysis. Used
 *    verbatim + deterministic tail.
 * 3. Deterministic fallback — `buildOgFallback` / `buildIconFallback`. Runs
 *    when the analysis didn't produce a prompt (skipAi, stale cache, or
 *    malformed JSON). The fallback already embeds its own style suffix, so
 *    no deterministic tail is appended here.
 */
export function resolvePrompt(args: ResolvePromptArgs): string {
  const { kind, metadata, ai, options = {} } = args;
  const palette = options.palette ?? ai?.brandHints?.palette ?? null;
  const accent = options.accent ?? ai?.imagePrompt?.suggestedAccent ?? null;

  if (options.override && options.override.trim()) {
    const body = clip(options.override, MAX_SUBJECT_CHARS);
    return compose(body, buildDeterministicTail(kind, palette, accent), kind);
  }

  const llmBody = ai?.imagePrompts?.[kind]?.trim();
  if (llmBody) {
    return compose(llmBody, buildDeterministicTail(kind, palette, accent), kind);
  }

  if (kind === "icon") {
    return buildIconFallback(metadata, ai);
  }
  return buildOgFallback(metadata, options);
}

function compose(body: string, tail: string, kind: PromptAssetKind): string {
  const cap = kind === "icon" ? MAX_ICON_PROMPT_CHARS : MAX_PROMPT_CHARS;
  const joined = tail ? `${body.replace(/\.\s*$/, "")}. ${tail}` : body;
  return joined.slice(0, cap);
}
