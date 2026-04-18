import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { buildOgFallback } from "./og-fallback";

function meta(partial: Partial<UrlMetadata>): UrlMetadata {
  return { ...createEmptyMetadata("https://example.com"), ...partial };
}

const STYLE_SUFFIX_FRAGMENT = "1200x630 landscape social media preview";
const TYPOGRAPHY_FRAGMENT = "clean, bold sans-serif typography";
const DEFAULT_BACKGROUND_FRAGMENT = "abstract modern tech composition";

describe("buildOgFallback", () => {
  describe("override path", () => {
    it("returns the trimmed override as-is with no other decoration", () => {
      const result = buildOgFallback(meta({ title: "Ignored" }), {
        override: "  a cyberpunk vault door, deep blue neon lighting  ",
      });
      expect(result).toBe("a cyberpunk vault door, deep blue neon lighting");
    });

    it("override takes precedence over enriched keywords and metadata", () => {
      const result = buildOgFallback(meta({ title: "Page Title", description: "A description" }), {
        override: "custom prompt wins",
        enrichedKeywords: "ignored keywords",
      });
      expect(result).toBe("custom prompt wins");
      expect(result).not.toContain("Page Title");
      expect(result).not.toContain("ignored keywords");
    });

    it("clips an override longer than 400 chars with an ellipsis", () => {
      const long = "x".repeat(500);
      const result = buildOgFallback(meta({}), { override: long });
      expect(result.length).toBe(400);
      expect(result.endsWith("…")).toBe(true);
    });

    it("an empty or whitespace-only override is ignored", () => {
      const result = buildOgFallback(meta({ title: "Real Title" }), { override: "   " });
      expect(result).toContain('headline "Real Title"');
    });
  });

  describe("headline extraction", () => {
    it("quotes the title verbatim when short enough and free of separators", () => {
      const result = buildOgFallback(meta({ title: "DepVault" }));
      expect(result).toContain('headline "DepVault"');
    });

    it("strips an em-dash site-name suffix", () => {
      const result = buildOgFallback(
        meta({ title: "Dependency Analysis — Environment Vault Service" }),
      );
      expect(result).toContain('headline "Dependency Analysis"');
      expect(result).not.toContain("Environment Vault");
    });

    it("strips an en-dash site-name suffix", () => {
      const result = buildOgFallback(meta({ title: "Product Name – The fastest tool" }));
      expect(result).toContain('headline "Product Name"');
    });

    it("strips a pipe-separated site-name suffix", () => {
      const result = buildOgFallback(meta({ title: "Article Name | Site Name" }));
      expect(result).toContain('headline "Article Name"');
    });

    it("does not strip when the separator appears too early (≤8 chars)", () => {
      const result = buildOgFallback(meta({ title: "Short — Rest of title here" }));
      expect(result).toContain('headline "Short — Rest of title here"');
    });

    it("clips a very long headline to 60 chars with ellipsis", () => {
      const longTitle = "a".repeat(100);
      const result = buildOgFallback(meta({ title: longTitle }));
      const match = result.match(/headline "([^"]+)"/);
      expect(match).not.toBeNull();
      const headline = match![1]!;
      expect(headline.length).toBe(60);
      expect(headline.endsWith("…")).toBe(true);
    });

    it("prefers ogTitle over title when both are present", () => {
      const result = buildOgFallback(meta({ title: "Plain", ogTitle: "OG Wins" }));
      expect(result).toContain('headline "OG Wins"');
      expect(result).not.toContain('"Plain"');
    });
  });

  describe("tagline extraction", () => {
    it("adds a sub-headline block when description is present", () => {
      const result = buildOgFallback(
        meta({ title: "T", description: "A concise single-sentence pitch." }),
      );
      expect(result).toContain('sub-headline reads "A concise single-sentence pitch."');
    });

    it("takes only the first sentence from a multi-sentence description", () => {
      const result = buildOgFallback(
        meta({
          title: "T",
          description: "First sentence here. Second sentence here. Third sentence.",
        }),
      );
      expect(result).toContain('"First sentence here."');
      expect(result).not.toContain("Second sentence");
    });

    it("clips a very long first sentence to 90 chars", () => {
      const longDesc = `${"x".repeat(200)}.`;
      const result = buildOgFallback(meta({ title: "T", description: longDesc }));
      const match = result.match(/sub-headline reads "([^"]+)"/);
      expect(match).not.toBeNull();
      const tagline = match![1]!;
      expect(tagline.length).toBe(90);
      expect(tagline.endsWith("…")).toBe(true);
    });

    it("omits the sub-headline line when description is absent", () => {
      const result = buildOgFallback(meta({ title: "Only title" }));
      expect(result).not.toContain("sub-headline");
    });

    it("prefers ogDescription over description when both are present", () => {
      const result = buildOgFallback(
        meta({ title: "T", description: "plain.", ogDescription: "og wins." }),
      );
      expect(result).toContain('"og wins."');
      expect(result).not.toContain('"plain."');
    });
  });

  describe("background layer", () => {
    it("uses enriched keywords verbatim when provided", () => {
      const result = buildOgFallback(meta({ title: "T" }), {
        enrichedKeywords: "metallic vault doors, encrypted code nodes, blue violet palette",
      });
      expect(result).toContain(
        "Background: metallic vault doors, encrypted code nodes, blue violet palette.",
      );
    });

    it("falls back to a generic tech background when no enriched keywords are supplied", () => {
      const result = buildOgFallback(meta({ title: "T" }));
      expect(result).toContain(`Background: ${DEFAULT_BACKGROUND_FRAGMENT}`);
    });

    it("trims whitespace on enriched keywords before using them", () => {
      const result = buildOgFallback(meta({ title: "T" }), {
        enrichedKeywords: "   a, b, c   ",
      });
      expect(result).toContain("Background: a, b, c.");
    });

    it("treats whitespace-only enriched keywords as absent", () => {
      const result = buildOgFallback(meta({ title: "T" }), { enrichedKeywords: "   " });
      expect(result).toContain(`Background: ${DEFAULT_BACKGROUND_FRAGMENT}`);
    });

    it("clips enriched keywords longer than 400 chars", () => {
      const long = "keyword, ".repeat(100);
      const result = buildOgFallback(meta({ title: "T" }), { enrichedKeywords: long });
      const match = result.match(/Background: (.+?)\./);
      expect(match).not.toBeNull();
      expect(match![1]!.length).toBe(400);
    });
  });

  describe("titleless fallback", () => {
    it("emits only background + style when title is missing", () => {
      const result = buildOgFallback(meta({}));
      expect(result).not.toContain("headline");
      expect(result).toContain(DEFAULT_BACKGROUND_FRAGMENT);
      expect(result).toContain(STYLE_SUFFIX_FRAGMENT);
    });

    it("uses provided enriched keywords for the background even without a title", () => {
      const result = buildOgFallback(meta({}), { enrichedKeywords: "custom bg" });
      expect(result).toMatch(/^custom bg\. /);
      expect(result).toContain(STYLE_SUFFIX_FRAGMENT);
    });
  });

  describe("final prompt shape", () => {
    it("always ends with the style suffix when metadata drives the prompt", () => {
      const result = buildOgFallback(meta({ title: "T", description: "D." }));
      expect(result.endsWith("professional product design aesthetic")).toBe(true);
    });

    it("always includes the typography directive when a headline is rendered", () => {
      const result = buildOgFallback(meta({ title: "Headline Test" }));
      expect(result).toContain(TYPOGRAPHY_FRAGMENT);
    });

    it("never exceeds 1400 chars even with all inputs maxed out", () => {
      const result = buildOgFallback(
        meta({
          title: "A".repeat(500),
          description: "B".repeat(500),
        }),
        { enrichedKeywords: "C".repeat(2000) },
      );
      expect(result.length).toBeLessThanOrEqual(1400);
    });
  });
});
