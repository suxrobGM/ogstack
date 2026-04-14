import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { ScraperService } from "./scraper.service";

mock.module("node:dns/promises", () => ({
  lookup: mock(() => Promise.resolve({ address: "93.184.216.34", family: 4 })),
}));

const mockFetch = mock<typeof fetch>();
globalThis.fetch = mockFetch as unknown as typeof fetch;

function htmlResponse(html: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
}

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Example Page</title>
  <meta name="description" content="A sample page description">
  <meta name="author" content="John Doe">
  <meta property="og:title" content="OG Title">
  <meta property="og:description" content="OG Description">
  <meta property="og:image" content="https://example.com/image.png">
  <meta property="og:site_name" content="Example Site">
  <link rel="icon" href="/favicon.png">
</head>
<body><h1>Hello</h1></body>
</html>
`;

describe("ScraperService", () => {
  let service: ScraperService;

  beforeEach(() => {
    container.clearInstances();
    service = container.resolve(ScraperService);
    mockFetch.mockReset();
  });

  describe("parseMetadata", () => {
    it("should extract all OG meta tags from valid HTML", async () => {
      const result = await service.parseMetadata("https://example.com", SAMPLE_HTML);

      expect(result.url).toBe("https://example.com");
      expect(result.title).toBe("Example Page");
      expect(result.description).toBe("A sample page description");
      expect(result.ogTitle).toBe("OG Title");
      expect(result.ogDescription).toBe("OG Description");
      expect(result.ogImage).toBe("https://example.com/image.png");
      expect(result.siteName).toBe("Example Site");
      expect(result.author).toBe("John Doe");
    });

    it("should extract favicon from link[rel=icon]", async () => {
      const result = await service.parseMetadata("https://example.com", SAMPLE_HTML);
      expect(result.favicon).toBe("https://example.com/favicon.png");
    });

    it("should resolve relative og:image URLs", async () => {
      const html = `<html><head>
        <meta property="og:image" content="/images/og.png">
      </head></html>`;

      const result = await service.parseMetadata("https://example.com/page", html);
      expect(result.ogImage).toBe("https://example.com/images/og.png");
    });

    it("should fall back to /favicon.ico when no link[rel=icon] exists", async () => {
      const html = `<html><head><title>No Favicon</title></head></html>`;

      const result = await service.parseMetadata("https://example.com", html);
      expect(result.favicon).toBe("https://example.com/favicon.ico");
    });

    it("should handle HTML with no meta tags", async () => {
      const html = `<html><head></head><body></body></html>`;

      const result = await service.parseMetadata("https://example.com", html);
      // Domain-derived title fallback kicks in when no meta/og title exists.
      expect(result.title).toBe("Example");
      expect(result.ogTitle).toBe("Example");
      expect(result.ogDescription).toBeNull();
      expect(result.ogImage).toBeNull();
      expect(result.author).toBeNull();
    });

    it("should handle malformed HTML gracefully", async () => {
      const html = `<html><head><title>Broken</title><meta property="og:title" content="Still Works">`;

      const result = await service.parseMetadata("https://example.com", html);
      expect(result.title).toBe("Broken");
      expect(result.ogTitle).toBe("Still Works");
    });

    it("should handle empty HTML", async () => {
      const result = await service.parseMetadata("https://example.com", "");
      expect(result.url).toBe("https://example.com");
      // No <title>, so the domain-derived fallback fills it in.
      expect(result.title).toBe("Example");
    });

    it("should trim whitespace from meta tag content", async () => {
      const html = `<html><head>
        <meta property="og:title" content="  Spaced Title  ">
      </head></html>`;

      const result = await service.parseMetadata("https://example.com", html);
      expect(result.ogTitle).toBe("Spaced Title");
    });

    it("should skip meta tags with empty content", async () => {
      const html = `<html><head>
        <meta property="og:title" content="">
        <meta name="description" content="   ">
      </head></html>`;

      const result = await service.parseMetadata("https://example.com", html);
      // Empty og:title content is ignored; fallback derives from domain.
      expect(result.ogTitle).toBe("Example");
      expect(result.description).toBeNull();
    });
  });

  describe("extractMetadata", () => {
    it("should fetch URL and return parsed metadata", async () => {
      mockFetch.mockResolvedValue(htmlResponse(SAMPLE_HTML));

      const result = await service.extractMetadata("https://example.com");

      expect(result.ogTitle).toBe("OG Title");
      expect(result.title).toBe("Example Page");
    });

    it("should reject private IPs via SSRF validation", async () => {
      await expect(service.extractMetadata("http://10.0.0.1")).rejects.toThrow(
        "Private IP addresses",
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should reject non-HTML responses", async () => {
      mockFetch.mockResolvedValue(
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      await expect(service.extractMetadata("https://example.com/api")).rejects.toThrow(
        "doesn't return an HTML page",
      );
    });

    it("should reject HTTP error responses", async () => {
      mockFetch.mockResolvedValue(htmlResponse("Not Found", 404));

      await expect(service.extractMetadata("https://example.com/missing")).rejects.toThrow("(404)");
    });

    it("should follow redirects and validate each hop", async () => {
      mockFetch
        .mockResolvedValueOnce(
          new Response(null, {
            status: 301,
            headers: { location: "https://example.com/final" },
          }),
        )
        .mockResolvedValueOnce(htmlResponse(SAMPLE_HTML));

      const result = await service.extractMetadata("https://example.com/old");
      expect(result.ogTitle).toBe("OG Title");
    });

    it("should reject after too many redirects", async () => {
      const redirect = new Response(null, {
        status: 301,
        headers: { location: "https://example.com/loop" },
      });
      mockFetch.mockResolvedValue(redirect);

      await expect(service.extractMetadata("https://example.com/loop")).rejects.toThrow(
        "redirects too many times",
      );
    });

    it("should reject responses that are too large via content-length", async () => {
      mockFetch.mockResolvedValue(htmlResponse("x", 200, { "content-length": "10000000" }));

      await expect(service.extractMetadata("https://example.com")).rejects.toThrow("too large");
    });
  });
});
