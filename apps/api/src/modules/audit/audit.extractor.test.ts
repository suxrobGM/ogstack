import { describe, expect, it } from "bun:test";
import { extractAuditMetadata } from "./audit.extractor";

const URL_BASE = "https://example.com/page";

function html(body: string): string {
  return `<!doctype html><html>${body}</html>`;
}

describe("extractAuditMetadata", () => {
  it("returns an empty-shaped result for a bare document", async () => {
    const meta = await extractAuditMetadata(URL_BASE, html("<head></head><body></body>"));
    expect(meta.url).toBe(URL_BASE);
    expect(meta.isHttps).toBe(true);
    expect(meta.title).toBeNull();
    expect(meta.ogTitle).toBeNull();
    expect(meta.ogImage).toBeNull();
    expect(meta.h1Count).toBe(0);
    expect(meta.imageCount).toBe(0);
    expect(meta.hasStructuredData).toBe(false);
    expect(meta.hasViewport).toBe(false);
    expect(meta.favicon).toBe("https://example.com/favicon.ico");
  });

  it("marks http URLs as not HTTPS", async () => {
    const meta = await extractAuditMetadata("http://example.com", html(""));
    expect(meta.isHttps).toBe(false);
  });

  it("captures <title> and length", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html("<head><title>Hello World</title></head>"),
    );
    expect(meta.title).toBe("Hello World");
    expect(meta.titleLength).toBe(11);
  });

  it("decodes HTML entities in title", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html("<head><title>A &amp; B</title></head>"),
    );
    expect(meta.title).toBe("A & B");
  });

  it("reads <html lang> attribute", async () => {
    const meta = await extractAuditMetadata(
      "https://example.com",
      '<!doctype html><html lang="es"><head></head></html>',
    );
    expect(meta.lang).toBe("es");
  });

  it("extracts OG meta tags", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta property="og:title" content="OG Title">
        <meta property="og:description" content="OG Desc">
        <meta property="og:image" content="/og.png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:type" content="article">
        <meta property="og:url" content="https://example.com/page">
        <meta property="og:site_name" content="Example">
      </head>`),
    );
    expect(meta.ogTitle).toBe("OG Title");
    expect(meta.ogDescription).toBe("OG Desc");
    expect(meta.ogImage).toBe("https://example.com/og.png");
    expect(meta.ogImageWidth).toBe(1200);
    expect(meta.ogImageHeight).toBe(630);
    expect(meta.ogType).toBe("article");
    expect(meta.ogUrl).toBe("https://example.com/page");
    expect(meta.ogSiteName).toBe("Example");
  });

  it("resolves relative og:image against the page URL", async () => {
    const meta = await extractAuditMetadata(
      "https://example.com/blog/post",
      html('<head><meta property="og:image" content="../img/og.png"></head>'),
    );
    expect(meta.ogImage).toBe("https://example.com/img/og.png");
  });

  it("extracts twitter meta tags", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="T Title">
        <meta name="twitter:description" content="T Desc">
        <meta name="twitter:image" content="https://example.com/tw.png">
      </head>`),
    );
    expect(meta.twitterCard).toBe("summary_large_image");
    expect(meta.twitterTitle).toBe("T Title");
    expect(meta.twitterDescription).toBe("T Desc");
    expect(meta.twitterImage).toBe("https://example.com/tw.png");
  });

  it("captures description and its length", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html('<head><meta name="description" content="A concise summary."></head>'),
    );
    expect(meta.description).toBe("A concise summary.");
    expect(meta.descriptionLength).toBe("A concise summary.".length);
  });

  it("flags viewport, charset, and robots", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, nofollow">
      </head>`),
    );
    expect(meta.hasCharset).toBe(true);
    expect(meta.hasViewport).toBe(true);
    expect(meta.robots).toBe("noindex, nofollow");
  });

  it("resolves canonical against the page URL", async () => {
    const meta = await extractAuditMetadata(
      "https://example.com/posts/1",
      html('<head><link rel="canonical" href="/posts/1/"></head>'),
    );
    expect(meta.canonical).toBe("https://example.com/posts/1/");
  });

  it("detects hreflang alternates", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html('<head><link rel="alternate" hreflang="es" href="/es"></head>'),
    );
    expect(meta.hasHreflang).toBe(true);
  });

  it("picks the first favicon-ish link and resolves it", async () => {
    const meta = await extractAuditMetadata(
      "https://example.com/",
      html('<head><link rel="icon" href="/assets/fav.png"></head>'),
    );
    expect(meta.favicon).toBe("https://example.com/assets/fav.png");
  });

  it("falls back to /favicon.ico when no link present", async () => {
    const meta = await extractAuditMetadata("https://example.com/page", html("<head></head>"));
    expect(meta.favicon).toBe("https://example.com/favicon.ico");
  });

  it("counts h1 elements", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html("<body><h1>A</h1><h1>B</h1><h2>C</h2></body>"),
    );
    expect(meta.h1Count).toBe(2);
  });

  it("counts images and flags those missing alt", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<body>
        <img src="/a.png" alt="alpha">
        <img src="/b.png" alt="">
        <img src="/c.png">
      </body>`),
    );
    expect(meta.imageCount).toBe(3);
    expect(meta.imagesMissingAlt).toBe(2);
  });

  it("detects JSON-LD structured data", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html('<head><script type="application/ld+json">{"@type":"Article"}</script></head>'),
    );
    expect(meta.hasStructuredData).toBe(true);
  });

  it("ignores meta tags with empty content", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta property="og:title" content="">
        <meta property="og:title" content="Real Title">
      </head>`),
    );
    expect(meta.ogTitle).toBe("Real Title");
  });

  it("keeps the first value when the same meta appears twice", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta property="og:title" content="First">
        <meta property="og:title" content="Second">
      </head>`),
    );
    expect(meta.ogTitle).toBe("First");
  });

  it("ignores non-numeric og:image dimensions gracefully", async () => {
    const meta = await extractAuditMetadata(
      URL_BASE,
      html(`<head>
        <meta property="og:image" content="/og.png">
        <meta property="og:image:width" content="not-a-number">
      </head>`),
    );
    expect(meta.ogImageWidth).toBeNull();
  });
});
