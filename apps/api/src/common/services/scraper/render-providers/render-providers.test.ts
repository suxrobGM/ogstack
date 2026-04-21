import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { container } from "tsyringe";
import { BrowserlessRenderProvider } from "./browserless.provider";
import { RenderProviderService } from "./render-provider.service";
import { ScrapingBeeRenderProvider } from "./scrapingbee.provider";

describe("BrowserlessRenderProvider", () => {
  let fetchSpy: ReturnType<typeof spyOn>;
  const origUrl = process.env.BROWSERLESS_URL;
  const origToken = process.env.BROWSERLESS_TOKEN;

  afterEach(() => {
    fetchSpy?.mockRestore();
    process.env.BROWSERLESS_URL = origUrl;
    process.env.BROWSERLESS_TOKEN = origToken;
  });

  it("is enabled when both URL and token are set", () => {
    process.env.BROWSERLESS_URL = "https://chrome.browserless.io";
    process.env.BROWSERLESS_TOKEN = "t";
    expect(new BrowserlessRenderProvider().isEnabled()).toBe(true);
  });

  it("is disabled when either URL or token missing", () => {
    process.env.BROWSERLESS_URL = "";
    process.env.BROWSERLESS_TOKEN = "t";
    expect(new BrowserlessRenderProvider().isEnabled()).toBe(false);
    process.env.BROWSERLESS_URL = "https://x";
    process.env.BROWSERLESS_TOKEN = "";
    expect(new BrowserlessRenderProvider().isEnabled()).toBe(false);
  });

  it("renders via /content endpoint", async () => {
    process.env.BROWSERLESS_URL = "https://chrome.browserless.io";
    process.env.BROWSERLESS_TOKEN = "t";
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({ ok: true, text: () => Promise.resolve("<html>ok</html>") } as Response),
      ) as unknown as typeof fetch,
    );

    fetchSpy.mockClear();
    const html = await new BrowserlessRenderProvider().render({
      url: "https://example.com",
      signal: new AbortController().signal,
    });
    expect(html).toBe("<html>ok</html>");
    expect(String(fetchSpy.mock.calls.at(-1)?.[0])).toContain("/content?token=t");
  });

  it("throws on non-ok response", () => {
    process.env.BROWSERLESS_URL = "https://chrome.browserless.io";
    process.env.BROWSERLESS_TOKEN = "t";
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve("") } as Response),
      ) as unknown as typeof fetch,
    );

    expect(
      new BrowserlessRenderProvider().render({
        url: "https://example.com",
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("HTTP 500");
  });
});

describe("ScrapingBeeRenderProvider", () => {
  let fetchSpy: ReturnType<typeof spyOn>;
  const orig = process.env.SCRAPINGBEE_API_KEY;

  afterEach(() => {
    fetchSpy?.mockRestore();
    process.env.SCRAPINGBEE_API_KEY = orig;
  });

  it("is enabled when apiKey is set", () => {
    process.env.SCRAPINGBEE_API_KEY = "key";
    expect(new ScrapingBeeRenderProvider().isEnabled()).toBe(true);
  });

  it("is disabled when apiKey missing", () => {
    process.env.SCRAPINGBEE_API_KEY = "";
    expect(new ScrapingBeeRenderProvider().isEnabled()).toBe(false);
  });

  it("renders via app.scrapingbee.com", async () => {
    process.env.SCRAPINGBEE_API_KEY = "key";
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({ ok: true, text: () => Promise.resolve("<html>ok</html>") } as Response),
      ) as unknown as typeof fetch,
    );

    fetchSpy.mockClear();
    const html = await new ScrapingBeeRenderProvider().render({
      url: "https://example.com",
      signal: new AbortController().signal,
    });
    expect(html).toBe("<html>ok</html>");
    expect(String(fetchSpy.mock.calls.at(-1)?.[0])).toContain("app.scrapingbee.com");
  });

  it("throws on non-ok response", () => {
    process.env.SCRAPINGBEE_API_KEY = "key";
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({ ok: false, status: 402, text: () => Promise.resolve("") } as Response),
      ) as unknown as typeof fetch,
    );
    expect(
      new ScrapingBeeRenderProvider().render({
        url: "https://example.com",
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("HTTP 402");
  });
});

describe("RenderProviderService", () => {
  let service: RenderProviderService;
  let browserless: BrowserlessRenderProvider;
  let scrapingBee: ScrapingBeeRenderProvider;

  const origRender = process.env.RENDER_PROVIDER;

  beforeEach(() => {
    container.clearInstances();
    process.env.BROWSERLESS_URL = "https://chrome.browserless.io";
    process.env.BROWSERLESS_TOKEN = "t";
    process.env.SCRAPINGBEE_API_KEY = "k";
    delete process.env.RENDER_PROVIDER;
    browserless = new BrowserlessRenderProvider();
    scrapingBee = new ScrapingBeeRenderProvider();
    container.registerInstance(BrowserlessRenderProvider, browserless);
    container.registerInstance(ScrapingBeeRenderProvider, scrapingBee);
    service = container.resolve(RenderProviderService);
  });

  afterEach(() => {
    process.env.RENDER_PROVIDER = origRender;
  });

  it("isEnabled returns true when any provider is configured", () => {
    expect(service.isEnabled()).toBe(true);
  });

  it("isEnabled returns false when RENDER_PROVIDER=none", () => {
    process.env.RENDER_PROVIDER = "none";
    expect(service.isEnabled()).toBe(false);
  });

  it("isEnabled returns false when no provider is enabled", () => {
    process.env.BROWSERLESS_URL = "";
    process.env.BROWSERLESS_TOKEN = "";
    process.env.SCRAPINGBEE_API_KEY = "";
    container.clearInstances();
    container.registerInstance(BrowserlessRenderProvider, new BrowserlessRenderProvider());
    container.registerInstance(ScrapingBeeRenderProvider, new ScrapingBeeRenderProvider());
    service = container.resolve(RenderProviderService);
    expect(service.isEnabled()).toBe(false);
  });

  it("render returns html on success via browserless", async () => {
    const spy = spyOn(browserless, "render").mockResolvedValue("<html>br</html>");
    const result = await service.render("https://example.com");
    expect(result).toBe("<html>br</html>");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("render returns null on provider error", async () => {
    spyOn(browserless, "render").mockRejectedValue(new Error("down"));
    const result = await service.render("https://example.com");
    expect(result).toBeNull();
  });

  it("render returns null when no provider picked", async () => {
    process.env.RENDER_PROVIDER = "none";
    const result = await service.render("https://example.com");
    expect(result).toBeNull();
  });

  it("honors RENDER_PROVIDER=scrapingbee preference", async () => {
    process.env.RENDER_PROVIDER = "scrapingbee";
    const spy = spyOn(scrapingBee, "render").mockResolvedValue("<html>sb</html>");
    const result = await service.render("https://example.com");
    expect(result).toBe("<html>sb</html>");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
