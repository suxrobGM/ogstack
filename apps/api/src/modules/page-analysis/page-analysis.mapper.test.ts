import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { toPublicMetadata } from "./page-analysis.mapper";

function createUrlMetadata(overrides: Partial<UrlMetadata> = {}): UrlMetadata {
  return { ...createEmptyMetadata("https://example.com/post"), ...overrides };
}

describe("toPublicMetadata", () => {
  it("prefers og fields over generic ones", () => {
    const result = toPublicMetadata(
      createUrlMetadata({
        title: "Plain",
        description: "Plain desc",
        ogTitle: "OG Title",
        ogDescription: "OG Desc",
        ogImage: "https://example.com/og.png",
      }),
    );

    expect(result.title).toBe("OG Title");
    expect(result.description).toBe("OG Desc");
    expect(result.image).toBe("https://example.com/og.png");
  });

  it("falls back to title/description/twitterImage when og fields missing", () => {
    const result = toPublicMetadata(
      createUrlMetadata({
        title: "Plain",
        description: "Plain desc",
        twitterImage: "https://example.com/tw.png",
      }),
    );

    expect(result.title).toBe("Plain");
    expect(result.description).toBe("Plain desc");
    expect(result.image).toBe("https://example.com/tw.png");
  });

  it("preserves metadata flags and misc fields", () => {
    const result = toPublicMetadata(
      createUrlMetadata({
        lang: "en",
        siteName: "Acme",
        favicon: "https://acme.com/favicon.ico",
        tags: ["a", "b"],
        isThinHtml: true,
        renderedWithJs: true,
        publishedTime: "2026-01-01",
      }),
    );

    expect(result.lang).toBe("en");
    expect(result.siteName).toBe("Acme");
    expect(result.favicon).toBe("https://acme.com/favicon.ico");
    expect(result.tags).toEqual(["a", "b"]);
    expect(result.isThinHtml).toBe(true);
    expect(result.renderedWithJs).toBe(true);
    expect(result.publishedTime).toBe("2026-01-01");
  });
});
