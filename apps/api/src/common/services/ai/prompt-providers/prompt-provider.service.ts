import { container, singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { PROMPT_PROVIDER_TOKEN, type PromptProvider } from "./prompt-provider";

const PROMPT_TIMEOUT_MS = Number.parseInt(process.env.PROMPT_PROVIDER_TIMEOUT_MS ?? "2500") || 2500;

/** Facade that picks an enabled `PromptProvider` and returns its keyword
 *  output. Preference order:
 *   1. Provider whose `id` matches `PROMPT_PROVIDER` env var.
 *   2. First provider that reports `isEnabled()`.
 *  On timeout or error the caller receives `null` and should fall back. */
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
    if (!enabled.length) return null;
    if (preferred) {
      const match = enabled.find((p) => p.id === preferred);
      if (match) return match;
    }
    return enabled[0]!;
  }

  isEnabled(): boolean {
    return this.pick() !== null;
  }

  async generate(metadata: UrlMetadata): Promise<string | null> {
    const provider = this.pick();
    if (!provider) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROMPT_TIMEOUT_MS);
    const startMs = performance.now();

    try {
      const keywords = await provider.generate({ metadata, signal: controller.signal });
      const elapsedMs = Math.round(performance.now() - startMs);
      if (!keywords) {
        logger.warn(
          { provider: provider.id, elapsedMs },
          "Prompt provider returned empty output — falling back to title-only prompt",
        );
        return null;
      }

      logger.info(
        { provider: provider.id, elapsedMs, keywordsLength: keywords.length, keywords },
        "Prompt provider produced keywords",
      );
      return keywords;
    } catch (error) {
      logger.warn(
        {
          provider: provider.id,
          error: error instanceof Error ? error.message : String(error),
        },
        "Prompt provider failed, falling back to title-only prompt",
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
