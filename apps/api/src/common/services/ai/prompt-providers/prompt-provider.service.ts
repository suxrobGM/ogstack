import { container, singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { IMAGE_KEYWORDS_SYSTEM_PROMPT } from "./prompts";
import {
  buildPromptUserMessage,
  PROMPT_PROVIDER_TOKEN,
  sanitizePromptOutput,
  type ChatRequest,
  type PromptProvider,
} from "./utils";

const PROMPT_TIMEOUT = 30_000;

/**
 * Facade that picks an enabled `PromptProvider` and dispatches chat calls.
 * Preference order:
 *   1. Provider whose `id` matches `PROMPT_PROVIDER` env var.
 *   2. First provider that reports `isEnabled()`.
 * On timeout or error the caller receives `null` and should fall back.
 */
@singleton()
export class PromptProviderService {
  private resolveAll(): PromptProvider[] {
    try {
      return container.resolveAll<PromptProvider>(PROMPT_PROVIDER_TOKEN);
    } catch {
      return [];
    }
  }

  private pick(): PromptProvider | null {
    const preferred = process.env.PROMPT_PROVIDER?.trim().toLowerCase();
    const enabled = this.resolveAll().filter((p) => p.isEnabled());
    if (!enabled.length) {
      return null;
    }

    if (preferred) {
      const match = enabled.find((p) => p.id === preferred);
      if (match) return match;
    }
    return enabled[0]!;
  }

  isEnabled(): boolean {
    return this.pick() !== null;
  }

  getActiveProvider(): { id: string; model: string } | null {
    const picked = this.pick();
    return picked ? { id: picked.id, model: picked.model } : null;
  }

  /**
   * Generic chat call with caller-supplied timeout. Returns the raw assistant
   * text or null on timeout/error. Callers handle parsing (JSON, keywords).
   */
  async chat(req: Omit<ChatRequest, "signal">): Promise<string | null> {
    const provider = this.pick();
    if (!provider) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROMPT_TIMEOUT);
    const startMs = performance.now();

    try {
      const text = await provider.chat({ ...req, signal: controller.signal });
      const elapsedMs = Math.round(performance.now() - startMs);
      logger.info(
        { provider: provider.id, model: provider.model, elapsedMs },
        "Prompt provider chat succeeded",
      );
      return text;
    } catch (error) {
      logger.warn(
        {
          provider: provider.id,
          error: error instanceof Error ? error.message : String(error),
        },
        "Prompt provider chat failed",
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Turns page metadata into a short line of visual keywords for the image
   * prompt builder. Returns null on error; callers fall back to a static
   * background prompt.
   */
  async generate(metadata: UrlMetadata): Promise<string | null> {
    const raw = await this.chat({
      system: IMAGE_KEYWORDS_SYSTEM_PROMPT,
      user: buildPromptUserMessage(metadata),
      maxTokens: 512,
      temperature: 0.4,
    });

    if (!raw) {
      return null;
    }

    const keywords = sanitizePromptOutput(raw);

    if (!keywords) {
      logger.warn("Prompt provider returned empty keywords output");
      return null;
    }

    return keywords;
  }
}
