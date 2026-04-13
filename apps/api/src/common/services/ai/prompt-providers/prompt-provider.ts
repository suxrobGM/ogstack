import type { UrlMetadata } from "@/common/services/scraper.service";

/** Context passed to a prompt provider. */
export interface PromptGenerateContext {
  metadata: UrlMetadata;
  /** Optional abort signal so the provider can be cancelled when the overall
   *  generation budget is exhausted. */
  signal?: AbortSignal;
}

/** Turns page metadata into a short, comma-separated list of concrete visual
 *  keywords suitable for a text-to-image model. Implementations should NOT
 *  add style / negative-prompt suffixes — the caller composes those. */
export interface PromptProvider {
  /** Short identifier for logs (e.g. "anthropic", "openai", "ollama"). */
  readonly id: string;

  /** True when the provider is configured (API key / base URL present). */
  isEnabled(): boolean;

  /** Returns a single-line keywords string, e.g.
   *  `"metallic vault doors, encrypted code nodes, glowing package cubes, blue violet palette"` */
  generate(ctx: PromptGenerateContext): Promise<string>;
}

export const PROMPT_PROVIDER_TOKEN = Symbol("PromptProvider");

export const PROMPT_PROVIDER_SYSTEM_PROMPT =
  "You are a visual prompt writer for text-to-image models. Given a web page's metadata, " +
  "respond with ONLY a single line of 6 to 12 concrete visual keywords describing the " +
  "BACKGROUND and atmosphere of an editorial illustration — objects, materials, shapes, " +
  "colors, lighting. These keywords will render behind a legible headline, so favor " +
  "low-clutter compositions with negative space and strong color harmony. Do NOT mention " +
  "the page title, text, typography, letters, or words — those are handled separately. " +
  "No sentences, no explanations, no quotes, no brand names. " +
  "Example output: 'metallic vault doors slightly defocused, encrypted code streams in the " +
  "background, glowing package cubes, digital locks, deep blue violet gradient palette, " +
  "soft studio lighting, cinematic negative space on the left'.";

export function buildPromptUserMessage(metadata: UrlMetadata): string {
  const parts: string[] = [];
  if (metadata.ogTitle ?? metadata.title) {
    parts.push(`Title: ${metadata.ogTitle ?? metadata.title}`);
  }
  if (metadata.ogDescription ?? metadata.description) {
    parts.push(`Description: ${metadata.ogDescription ?? metadata.description}`);
  }
  if (metadata.siteName) parts.push(`Site: ${metadata.siteName}`);
  return parts.join("\n");
}

/** Strip reasoning blocks, quotes, and "Keywords:"-style prefixes from LLM
 *  output, then return the first non-empty line. Handles Qwen/DeepSeek-style
 *  `<think>...</think>` reasoning, markdown fences, and role prefixes. */
export function sanitizePromptOutput(raw: string): string {
  const withoutThinking = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/^```[a-z]*\n?|\n?```$/gi, "");

  for (const line of withoutThinking.split(/\r?\n/)) {
    const cleaned = line
      .replace(/^["'`\s]+|["'`\s]+$/g, "")
      .replace(/^(assistant|keywords?|visual( keywords)?|output|answer)\s*:\s*/i, "")
      .trim();
    if (cleaned) return cleaned;
  }
  return "";
}
