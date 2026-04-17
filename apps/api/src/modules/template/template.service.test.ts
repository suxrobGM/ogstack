import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { TemplateService } from "./template.service";

const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"></svg>';
const MOCK_PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const satoriSpy = mock(() => Promise.resolve(MOCK_SVG));

mock.module("satori", () => ({
  default: satoriSpy,
}));

mock.module("@resvg/resvg-js", () => ({
  Resvg: class MockResvg {
    render() {
      return { asPng: () => MOCK_PNG };
    }
  },
}));

function createMockMetadata(overrides: Partial<UrlMetadata> = {}): UrlMetadata {
  return {
    ...createEmptyMetadata("https://example.com"),
    title: "Example Page",
    description: "A sample page",
    ogTitle: "OG Title",
    ogDescription: "OG Description",
    ogImage: "https://example.com/image.png",
    favicon: "https://example.com/favicon.ico",
    author: "John Doe",
    siteName: "Example Site",
    ...overrides,
  };
}

describe("TemplateService", () => {
  let service: TemplateService;

  beforeEach(() => {
    container.clearInstances();
    service = container.resolve(TemplateService);
  });

  describe("list", () => {
    it("should return all available templates when no kind is given", () => {
      const templates = service.list();
      expect(templates).toHaveLength(15);
      expect(templates[0]).toHaveProperty("slug");
      expect(templates[0]).toHaveProperty("name");
      expect(templates[0]).toHaveProperty("description");
      expect(templates[0]).toHaveProperty("category");
      expect(templates[0]).toHaveProperty("supportedKinds");
    });

    it("should return only OG templates when kind=og", () => {
      const templates = service.list("og");
      expect(templates).toHaveLength(10);
    });

    it("should return only hero templates when kind=blog_hero", () => {
      const templates = service.list("blog_hero");
      expect(templates).toHaveLength(5);
    });
  });

  describe("render", () => {
    it("should render a template to a PNG buffer", async () => {
      // Mock font fetching
      const mockFontCss =
        'src: url(https://fonts.gstatic.com/s/inter/v18/abc.woff2) format("woff2");';
      const mockFontData = new ArrayBuffer(100);

      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock((url: string | URL | Request) => {
        const urlStr =
          typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
        if (urlStr.includes("googleapis.com/css2")) {
          return Promise.resolve(new Response(mockFontCss));
        }
        return Promise.resolve(new Response(mockFontData));
      }) as unknown as typeof fetch;

      try {
        const result = await service.render("gradient_dark", createMockMetadata());
        expect(result).toBeInstanceOf(Buffer);
        expect(result[0]).toBe(0x89); // PNG magic byte
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should throw NotFoundError for unknown template", () => {
      expect(service.render("nonexistent" as never, createMockMetadata())).rejects.toThrow(
        "not found",
      );
    });

    it("should use default options when none provided", async () => {
      const originalFetch = globalThis.fetch;
      const mockFontCss =
        'src: url(https://fonts.gstatic.com/s/inter/v18/abc.woff2) format("woff2");';
      globalThis.fetch = mock((url: string | URL | Request) => {
        const urlStr =
          typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
        if (urlStr.includes("googleapis.com/css2")) {
          return Promise.resolve(new Response(mockFontCss));
        }
        return Promise.resolve(new Response(new ArrayBuffer(100)));
      }) as unknown as typeof fetch;

      try {
        const result = await service.render("minimal", createMockMetadata());
        expect(result).toBeInstanceOf(Buffer);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should accept custom render options", async () => {
      const originalFetch = globalThis.fetch;
      const mockFontCss =
        'src: url(https://fonts.gstatic.com/s/inter/v18/abc.woff2) format("woff2");';
      globalThis.fetch = mock((url: string | URL | Request) => {
        const urlStr =
          typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
        if (urlStr.includes("googleapis.com/css2")) {
          return Promise.resolve(new Response(mockFontCss));
        }
        return Promise.resolve(new Response(new ArrayBuffer(100)));
      }) as unknown as typeof fetch;

      try {
        const result = await service.render("blog_card", createMockMetadata(), {
          accent: "#FF5733",
          dark: false,
          font: "space-grotesk",
          logoPosition: "top-right",
        });
        expect(result).toBeInstanceOf(Buffer);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should default to 1200x630 when no dimensions are provided", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(new ArrayBuffer(100))),
      ) as unknown as typeof fetch;
      satoriSpy.mockClear();

      try {
        await service.render("minimal", createMockMetadata());
        const calls = satoriSpy.mock.calls as unknown as unknown[][];
        const config = calls[0]?.[1] as { width: number; height: number };
        expect(config.width).toBe(1200);
        expect(config.height).toBe(630);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should honor a custom dimensions argument", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(new ArrayBuffer(100))),
      ) as unknown as typeof fetch;
      satoriSpy.mockClear();

      try {
        await service.render("minimal", createMockMetadata(), {}, { width: 1920, height: 1080 });
        const calls = satoriSpy.mock.calls as unknown as unknown[][];
        const config = calls[0]?.[1] as { width: number; height: number };
        expect(config.width).toBe(1920);
        expect(config.height).toBe(1080);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("should render all template slugs without errors", async () => {
      const originalFetch = globalThis.fetch;
      const mockFontCss =
        'src: url(https://fonts.gstatic.com/s/inter/v18/abc.woff2) format("woff2");';
      globalThis.fetch = mock((url: string | URL | Request) => {
        const urlStr =
          typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
        if (urlStr.includes("googleapis.com/css2")) {
          return Promise.resolve(new Response(mockFontCss));
        }
        return Promise.resolve(new Response(new ArrayBuffer(100)));
      }) as unknown as typeof fetch;

      try {
        const slugs = [
          "gradient_dark",
          "gradient_light",
          "split_hero",
          "centered_bold",
          "blog_card",
          "docs_page",
          "product_launch",
          "changelog",
          "github_repo",
          "minimal",
          "hero_editorial",
          "hero_spotlight",
          "hero_panorama",
          "hero_minimal",
          "hero_brand_card",
        ] as const;

        for (const slug of slugs) {
          const result = await service.render(slug, createMockMetadata());
          expect(result).toBeInstanceOf(Buffer);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
