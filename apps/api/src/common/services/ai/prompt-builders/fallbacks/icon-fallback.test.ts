import type { PageAnalysisAi } from "@ogstack/shared/types";
import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { buildIconFallback } from "./icon-fallback";

function meta(partial: Partial<UrlMetadata>): UrlMetadata {
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

describe("buildIconFallback", () => {
  it("returns the trimmed override as-is when set, clipped to 900 chars", () => {
    const result = buildIconFallback(meta({}), null, "  custom icon prompt  ");
    expect(result).toBe("custom icon prompt");
  });

  it("clips a very long override to 900 chars", () => {
    const long = "x".repeat(1500);
    const result = buildIconFallback(meta({}), null, long);
    expect(result.length).toBe(900);
  });

  it("uses brandHints.inferredName as the brand when present", () => {
    const result = buildIconFallback(
      meta({}),
      ai({ brandHints: { inferredName: "Acme Corp", palette: [], industry: null } }),
    );
    expect(result).toContain('for "Acme Corp"');
  });

  it("falls back to metadata.siteName when no inferred brand name", () => {
    const result = buildIconFallback(meta({ siteName: "Demo Site" }), null);
    expect(result).toContain('for "Demo Site"');
  });

  it("falls back to the URL hostname when neither brand nor siteName are available", () => {
    const result = buildIconFallback(
      { ...createEmptyMetadata("https://www.example.com/path"), siteName: null },
      null,
    );
    expect(result).toContain('for "example.com"');
  });

  it("prefers palette over accent when both are present", () => {
    const result = buildIconFallback(
      meta({}),
      ai({
        brandHints: { inferredName: "Brand", palette: ["#ff0000", "#00ff00"], industry: null },
        imagePrompt: {
          headline: "",
          tagline: null,
          backgroundKeywords: "",
          suggestedAccent: "#0000ff",
          mood: "editorial",
        },
      }),
    );
    expect(result).toContain("Primary palette: #ff0000, #00ff00");
    expect(result).not.toContain("Primary color: #0000ff");
  });

  it("uses accent when palette is empty", () => {
    const result = buildIconFallback(
      meta({}),
      ai({
        brandHints: { inferredName: "Brand", palette: [], industry: null },
        imagePrompt: {
          headline: "",
          tagline: null,
          backgroundKeywords: "",
          suggestedAccent: "#0000ff",
          mood: "editorial",
        },
      }),
    );
    expect(result).toContain("Primary color: #0000ff");
  });

  it("always embeds the legibility constraint for 16x16 downsampling", () => {
    const result = buildIconFallback(meta({}), null);
    expect(result).toContain("legible when downsampled to 16×16 pixels");
  });

  it("explicitly forbids text / wordmarks", () => {
    const result = buildIconFallback(meta({}), null);
    expect(result).toContain("no text, no letters, no wordmark");
  });

  it("embeds industry context when present", () => {
    const result = buildIconFallback(
      meta({}),
      ai({ brandHints: { inferredName: "Brand", palette: [], industry: "fintech" } }),
    );
    expect(result).toContain("Industry context: fintech");
  });
});
