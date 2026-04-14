import { singleton } from "tsyringe";
import type { RenderProvider, RenderRequest } from "./render-provider";

@singleton()
export class ScrapingBeeRenderProvider implements RenderProvider {
  public readonly id = "scrapingbee";
  private readonly apiKey = process.env.SCRAPINGBEE_API_KEY ?? "";

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async render(req: RenderRequest): Promise<string> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      url: req.url,
      render_js: "true",
      block_ads: "true",
    });
    const endpoint = `https://app.scrapingbee.com/api/v1/?${params.toString()}`;
    const response = await fetch(endpoint, {
      method: "GET",
      signal: req.signal,
    });
    if (!response.ok) {
      throw new Error(`ScrapingBee render failed: HTTP ${response.status}`);
    }
    return response.text();
  }
}
