import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { applyMetadataFallbacks, applyOEmbed, fetchOEmbed } from "./scraper.fallbacks";
import { createEmptyMetadata } from "./scraper.types";

describe("applyMetadataFallbacks", () => {
  it("fills ogTitle from twitterTitle when missing", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.twitterTitle = "Twitter Title";
    applyMetadataFallbacks(metadata);
    expect(metadata.ogTitle).toBe("Twitter Title");
    expect(metadata.title).toBe("Twitter Title");
  });

  it("falls back to JSON-LD headline when no twitter or title", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.jsonLd = [{ type: "Article", headline: "My Article", raw: {} }];
    applyMetadataFallbacks(metadata);
    expect(metadata.ogTitle).toBe("My Article");
  });

  it("falls back to JSON-LD name when no headline", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.jsonLd = [{ type: "Product", name: "My Product", raw: {} }];
    applyMetadataFallbacks(metadata);
    expect(metadata.ogTitle).toBe("My Product");
  });

  it("falls back to h1 when metadata/json-ld empty", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.h1 = "Heading One";
    applyMetadataFallbacks(metadata);
    expect(metadata.ogTitle).toBe("Heading One");
  });

  it("derives title from domain as last resort", () => {
    const metadata = createEmptyMetadata("https://www.acme.co.uk/");
    applyMetadataFallbacks(metadata);
    expect(metadata.ogTitle).toBe("Acme");
  });

  it("fills ogImage from twitterImage", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.twitterImage = "https://example.com/tw.png";
    applyMetadataFallbacks(metadata);
    expect(metadata.ogImage).toBe("https://example.com/tw.png");
  });

  it("fills author and dates from JSON-LD", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.jsonLd = [
      {
        type: "Article",
        author: "Alice",
        datePublished: "2026-01-01",
        dateModified: "2026-02-01",
        raw: {},
      },
    ];
    applyMetadataFallbacks(metadata);
    expect(metadata.author).toBe("Alice");
    expect(metadata.publishedTime).toBe("2026-01-01");
    expect(metadata.modifiedTime).toBe("2026-02-01");
  });

  it("fills description from bodyText first sentence", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.bodyText = "First sentence. Second sentence.";
    applyMetadataFallbacks(metadata);
    expect(metadata.ogDescription).toBe("First sentence.");
  });

  it("truncates long body-derived descriptions", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.bodyText = "a".repeat(300) + ".";
    applyMetadataFallbacks(metadata);
    expect(metadata.ogDescription?.length).toBeLessThanOrEqual(240);
    expect(metadata.ogDescription?.endsWith("…")).toBe(true);
  });

  it("defaults favicon to /favicon.ico on origin", () => {
    const metadata = createEmptyMetadata("https://example.com/path");
    applyMetadataFallbacks(metadata);
    expect(metadata.favicon).toBe("https://example.com/favicon.ico");
  });

  it("preserves favicon if already set", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.favicon = "https://cdn.example.com/icon.png";
    applyMetadataFallbacks(metadata);
    expect(metadata.favicon).toBe("https://cdn.example.com/icon.png");
  });
});

describe("applyOEmbed", () => {
  it("does nothing when oembed is null", () => {
    const metadata = createEmptyMetadata("https://example.com");
    applyOEmbed(metadata, null);
    expect(metadata.oEmbed).toBeNull();
  });

  it("fills only empty fields from oembed", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.ogTitle = "Existing Title";
    applyOEmbed(metadata, {
      title: "OEmbed Title",
      description: "OEmbed desc",
      thumbnailUrl: "https://example.com/thumb.png",
      authorName: "Bob",
      providerName: "Provider",
    });
    expect(metadata.ogTitle).toBe("Existing Title");
    expect(metadata.ogDescription).toBe("OEmbed desc");
    expect(metadata.ogImage).toBe("https://example.com/thumb.png");
    expect(metadata.author).toBe("Bob");
    expect(metadata.siteName).toBe("Provider");
  });
});

describe("fetchOEmbed", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("returns parsed oembed data on success", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              title: "Title",
              description: "Desc",
              thumbnail_url: "https://example.com/thumb.png",
              author_name: "Author",
              provider_name: "Provider",
            }),
        } as Response),
      ) as unknown as typeof fetch,
    );
    const result = await fetchOEmbed("https://example.com/oembed");
    expect(result?.title).toBe("Title");
    expect(result?.thumbnailUrl).toBe("https://example.com/thumb.png");
  });

  it("returns null on non-ok response", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() =>
        Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) } as Response),
      ) as unknown as typeof fetch,
    );
    expect(await fetchOEmbed("https://example.com/oembed")).toBeNull();
  });

  it("returns null on fetch error", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      mock(() => Promise.reject(new Error("timeout"))) as unknown as typeof fetch,
    );
    expect(await fetchOEmbed("https://example.com/oembed")).toBeNull();
  });
});
