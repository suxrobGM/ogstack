import { singleton } from "tsyringe";
import type { RenderProvider, RenderRequest } from "./render-provider";

@singleton()
export class BrowserlessRenderProvider implements RenderProvider {
  public readonly id = "browserless";
  private readonly baseUrl = process.env.BROWSERLESS_URL ?? "";
  private readonly token = process.env.BROWSERLESS_TOKEN ?? "";

  isEnabled(): boolean {
    return Boolean(this.baseUrl && this.token);
  }

  async render(req: RenderRequest): Promise<string> {
    const endpoint = `${this.baseUrl.replace(/\/$/, "")}/content?token=${encodeURIComponent(this.token)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: req.signal,
      body: JSON.stringify({
        url: req.url,
        waitForTimeout: 1500,
        gotoOptions: { waitUntil: "networkidle2", timeout: 10000 },
      }),
    });
    if (!response.ok) {
      throw new Error(`Browserless render failed: HTTP ${response.status}`);
    }
    return response.text();
  }
}
