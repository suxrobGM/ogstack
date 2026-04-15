import type { UrlMetadata } from "@/common/services/scraper.service";

export interface ChatRequest {
  system: string;
  user: string;
  /** If true, request a JSON-object response where the provider API supports it. */
  json?: boolean;
  signal?: AbortSignal;
  maxTokens?: number;
  temperature?: number;
}

/** A text completion provider. Implementations only supply a chat endpoint;
 *  higher-level transforms (metadata → prompt, JSON parsing, keyword
 *  sanitization) live in `PromptProviderService` and its callers. */
export interface PromptProvider {
  /** Short identifier for logs (e.g. "anthropic", "openai", "ollama"). */
  readonly id: string;

  /** Model name reported for logging/telemetry. */
  readonly model: string;

  /** True when the provider is configured (API key / base URL present). */
  isEnabled(): boolean;

  /** Generic chat completion. Returns the raw assistant text. Callers are
   *  responsible for parsing (JSON, keywords, etc.). */
  chat(req: ChatRequest): Promise<string>;
}

export const PROMPT_PROVIDER_TOKEN = Symbol("PromptProvider");

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

/** Strips reasoning blocks (Qwen/DeepSeek `<think>...</think>`) and markdown
 *  code fences from raw LLM output. Returned text still needs format-specific
 *  parsing (keywords line, JSON, etc.). */
export function stripReasoningBlocks(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/^```[a-z]*\n?|\n?```$/gi, "");
}

/** Strip reasoning blocks, quotes, and "Keywords:"-style prefixes from LLM
 *  output, then return the first non-empty line. */
export function sanitizePromptOutput(raw: string): string {
  const cleaned = stripReasoningBlocks(raw);
  for (const line of cleaned.split(/\r?\n/)) {
    const trimmed = line
      .replace(/^["'`\s]+|["'`\s]+$/g, "")
      .replace(/^(assistant|keywords?|visual( keywords)?|output|answer)\s*:\s*/i, "")
      .trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Parses a JSON object response from an LLM. Strips reasoning blocks and any
 *  text before the first `{` or after the last `}`. Returns null on any failure
 *  so callers can gracefully fall back. */
export function parseJsonResponse<T>(raw: string): T | null {
  const cleaned = stripReasoningBlocks(raw)
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();
  if (!cleaned) return null;
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as T;
  } catch {
    return null;
  }
}

/** Strips prompt-injection phrases so a user-supplied directive can't flip the
 *  system prompt's role. Keeps it short and tactical — defense in depth on top
 *  of the system prompt's own instructions. Caps at 500 chars. */
export function sanitizeUserPrompt(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<\/?(system|assistant|user)>/gi, "")
    .replace(/\b(ignore (all|previous|prior) (instructions|prompts))\b/gi, "")
    .replace(/\bsystem\s*:/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 500);
}
