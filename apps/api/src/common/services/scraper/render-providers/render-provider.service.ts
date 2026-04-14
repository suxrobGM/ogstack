import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { BrowserlessRenderProvider } from "./browserless.provider";
import { type RenderProvider } from "./render-provider";
import { ScrapingBeeRenderProvider } from "./scrapingbee.provider";

const RENDER_TIMEOUT = 15000;

/** Resolves a headless-render provider for JS-heavy SPA pages. Providers are
 *  external services (Browserless / ScrapingBee) selected via `RENDER_PROVIDER`
 *  env var. When no provider is configured, the service is disabled and the
 *  scraper falls back to static HTML. */
@singleton()
export class RenderProviderService {
  constructor(
    private readonly browserless: BrowserlessRenderProvider,
    private readonly scrapingBee: ScrapingBeeRenderProvider,
  ) {}

  private pick(): RenderProvider | null {
    const preferred = process.env.RENDER_PROVIDER?.trim().toLowerCase();
    const providers: RenderProvider[] = [this.browserless, this.scrapingBee];
    if (preferred && preferred !== "none") {
      const match = providers.find((p) => p.id === preferred);
      if (match?.isEnabled()) return match;
    }
    return providers.find((p) => p.isEnabled()) ?? null;
  }

  isEnabled(): boolean {
    if (process.env.RENDER_PROVIDER?.trim().toLowerCase() === "none") return false;
    return this.pick() !== null;
  }

  /** Renders a URL through the configured provider. Returns the rendered HTML
   *  or null on failure — callers decide whether to escalate further. */
  async render(url: string): Promise<string | null> {
    const provider = this.pick();
    if (!provider) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RENDER_TIMEOUT);
    const startMs = performance.now();
    try {
      const html = await provider.render({ url, signal: controller.signal });
      const elapsedMs = Math.round(performance.now() - startMs);
      logger.info({ provider: provider.id, elapsedMs, url }, "Headless render succeeded");
      return html;
    } catch (error) {
      logger.warn(
        {
          provider: provider.id,
          url,
          error: error instanceof Error ? error.message : String(error),
        },
        "Headless render failed",
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
