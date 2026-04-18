import type { PageAnalysisAi } from "@ogstack/shared/types";
import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { resolvePrompt } from "./resolve";

function meta(partial: Partial<UrlMetadata> = {}): UrlMetadata {
  return { ...createEmptyMetadata("https://example.com"), ...partial };
}

function ai(partial: Partial<PageAnalysisAi>): PageAnalysisAi {
  return {
    title: "",
    description: "",
    summary: "",
    keyPoints: [],
    topics: [],
    contentType: "other",
    language: "en",
    confidence: "medium",
    pageTheme: "editorial",
    brandHints: { inferredName: null, palette: [], industry: null },
    contentSignals: {
      structuredDataTypes: [],
      hasAuthor: false,
      hasPublishedDate: false,
      freshnessDays: null,
      authority: "unknown",
    },
    imagePrompt: {
      headline: "",
      tagline: null,
      backgroundKeywords: "",
      suggestedAccent: "#000000",
      mood: "editorial",
    },
    ...partial,
  };
}

describe("resolvePrompt", () => {
  describe("override bypass", () => {
    it("uses the override verbatim and appends a deterministic tail", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({ title: "Ignored" }),
        ai: ai({
          imagePrompts: { og: "LLM prompt", hero: "LLM hero", icon: "LLM icon" },
          brandHints: { inferredName: "X", palette: ["#10b981"], industry: null },
        }),
        options: { override: "  user wins  ", palette: ["#10b981"] },
      });
      expect(result.startsWith("user wins")).toBe(true);
      expect(result).toContain("1200x630 landscape composition");
      expect(result).toContain("palette of #10b981");
      expect(result).not.toContain("LLM prompt");
    });

    it("appends the icon size anchor when kind is icon", () => {
      const result = resolvePrompt({
        kind: "icon",
        metadata: meta({}),
        ai: null,
        options: { override: "abstract rune" },
      });
      expect(result).toContain("512x512 square, transparent-friendly background, legible at 16x16");
    });

    it("appends the hero size anchor when kind is hero", () => {
      const result = resolvePrompt({
        kind: "hero",
        metadata: meta({}),
        ai: null,
        options: { override: "sunrise over peaks" },
      });
      expect(result).toContain("1600x900 wide cinematic composition");
    });

    it("treats a whitespace-only override as absent and falls through", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({ title: "Real Title" }),
        ai: null,
        options: { override: "   " },
      });
      expect(result).toContain('headline "Real Title"');
    });
  });

  describe("LLM-authored prompt path", () => {
    it("uses ai.imagePrompts[kind] as the body and appends the deterministic tail", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({ title: "Ignored when LLM prompt present" }),
        ai: ai({
          imagePrompts: {
            og: "A social card with 'Acme' in bold sans-serif, forest palette",
            hero: "Wide cinematic hero",
            icon: "Flat triangle symbol",
          },
          brandHints: { inferredName: "Acme", palette: ["#0a7c3a", "#f3f1eb"], industry: null },
        }),
      });
      expect(result).toContain("A social card with 'Acme' in bold sans-serif");
      expect(result).toContain("1200x630 landscape composition");
      expect(result).toContain("palette of #0a7c3a, #f3f1eb");
    });

    it("picks the icon prompt when kind is icon", () => {
      const result = resolvePrompt({
        kind: "icon",
        metadata: meta({}),
        ai: ai({
          imagePrompts: {
            og: "og body",
            hero: "hero body",
            icon: "flat vector hexagon",
          },
          brandHints: { inferredName: "Acme", palette: ["#ff0000"], industry: null },
        }),
      });
      expect(result).toContain("flat vector hexagon");
      expect(result).toContain("512x512 square");
      expect(result).toContain("palette of #ff0000");
      expect(result).not.toContain("og body");
    });

    it("picks the hero prompt when kind is hero", () => {
      const result = resolvePrompt({
        kind: "hero",
        metadata: meta({}),
        ai: ai({
          imagePrompts: { og: "og body", hero: "wide vista", icon: "icon body" },
        }),
      });
      expect(result).toContain("wide vista");
      expect(result).toContain("1600x900 wide cinematic composition");
    });

    it("treats an empty imagePrompts[kind] string as absent and falls back", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({ title: "Fallback Title" }),
        ai: ai({ imagePrompts: { og: "   ", hero: "", icon: "" } }),
      });
      expect(result).toContain('headline "Fallback Title"');
    });
  });

  describe("fallback path", () => {
    it("routes og kind through the OG fallback when ai.imagePrompts is absent", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({ title: "Page Title" }),
        ai: null,
      });
      expect(result).toContain('headline "Page Title"');
      expect(result).toContain("1200x630 landscape social media preview");
    });

    it("routes icon kind through the icon fallback when ai.imagePrompts is absent", () => {
      const result = resolvePrompt({
        kind: "icon",
        metadata: meta({ siteName: "Demo" }),
        ai: null,
      });
      expect(result).toContain('for "Demo"');
      expect(result).toContain("legible when downsampled to 16×16 pixels");
    });
  });

  describe("deterministic tail composition", () => {
    it("omits the palette line when neither palette nor accent is available", () => {
      const result = resolvePrompt({
        kind: "og",
        metadata: meta({}),
        ai: null,
        options: { override: "just a body" },
      });
      expect(result).toBe("just a body. 1200x630 landscape composition");
    });

    it("uses ai.brandHints.palette as a fallback for palette when options.palette is absent", () => {
      const result = resolvePrompt({
        kind: "icon",
        metadata: meta({}),
        ai: ai({
          imagePrompts: { og: "og", hero: "hero", icon: "icon body" },
          brandHints: { inferredName: null, palette: ["#abcdef"], industry: null },
        }),
      });
      expect(result).toContain("palette of #abcdef");
    });
  });
});
