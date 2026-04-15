import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { buildPromptUserMessage, sanitizePromptOutput } from "./utils";

function meta(partial: Partial<UrlMetadata>): UrlMetadata {
  return { ...createEmptyMetadata("https://example.com"), ...partial };
}

describe("sanitizePromptOutput", () => {
  it("returns a clean single-line keyword string unchanged", () => {
    const raw = "metallic vault doors, encrypted code streams, blue violet palette";
    expect(sanitizePromptOutput(raw)).toBe(raw);
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizePromptOutput("  keywords here  ")).toBe("keywords here");
  });

  it("strips surrounding double quotes", () => {
    expect(sanitizePromptOutput('"keywords here"')).toBe("keywords here");
  });

  it("strips surrounding single quotes and backticks", () => {
    expect(sanitizePromptOutput("`keywords here`")).toBe("keywords here");
    expect(sanitizePromptOutput("'keywords here'")).toBe("keywords here");
  });

  it("strips a 'Keywords:' prefix", () => {
    expect(sanitizePromptOutput("Keywords: a, b, c")).toBe("a, b, c");
    expect(sanitizePromptOutput("keyword: a, b, c")).toBe("a, b, c");
  });

  it("strips 'Visual keywords:' prefix", () => {
    expect(sanitizePromptOutput("Visual keywords: a, b, c")).toBe("a, b, c");
  });

  it("strips 'Output:' and 'Answer:' prefixes", () => {
    expect(sanitizePromptOutput("Output: a, b, c")).toBe("a, b, c");
    expect(sanitizePromptOutput("Answer: a, b, c")).toBe("a, b, c");
  });

  it("strips an 'Assistant:' prefix", () => {
    expect(sanitizePromptOutput("Assistant: a, b, c")).toBe("a, b, c");
  });

  it("removes <think>...</think> reasoning blocks", () => {
    const raw = "<think>Let me analyze this... the site is about X</think>\na, b, c";
    expect(sanitizePromptOutput(raw)).toBe("a, b, c");
  });

  it("removes <thinking>...</thinking> blocks", () => {
    const raw = "<thinking>pondering</thinking>\na, b, c";
    expect(sanitizePromptOutput(raw)).toBe("a, b, c");
  });

  it("removes multiline and nested-style thinking blocks", () => {
    const raw = [
      "<think>",
      "Line one of thinking.",
      "Line two of thinking.",
      "</think>",
      "",
      "final keywords here",
    ].join("\n");
    expect(sanitizePromptOutput(raw)).toBe("final keywords here");
  });

  it("returns the first non-empty line when answer is preceded by blanks", () => {
    const raw = "\n\n   \n\nfirst real content\nsecond line";
    expect(sanitizePromptOutput(raw)).toBe("first real content");
  });

  it("strips a leading markdown code fence", () => {
    const raw = "```\nkeywords here\n```";
    expect(sanitizePromptOutput(raw)).toBe("keywords here");
  });

  it("strips a language-tagged markdown code fence", () => {
    const raw = "```text\nkeywords here\n```";
    expect(sanitizePromptOutput(raw)).toBe("keywords here");
  });

  it("returns empty string when input is only a thinking block", () => {
    expect(sanitizePromptOutput("<think>only reasoning here</think>")).toBe("");
  });

  it("returns empty string when input is only whitespace", () => {
    expect(sanitizePromptOutput("   \n\n  \n")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizePromptOutput("")).toBe("");
  });

  it("is case-insensitive for prefix stripping", () => {
    expect(sanitizePromptOutput("OUTPUT: a, b, c")).toBe("a, b, c");
    expect(sanitizePromptOutput("keywords: a, b, c")).toBe("a, b, c");
  });

  it("combines multiple cleanups in one pass", () => {
    const raw = [
      "<think>reasoning</think>",
      "",
      '  "Keywords: metallic vault doors, encrypted code nodes"  ',
    ].join("\n");
    expect(sanitizePromptOutput(raw)).toBe("metallic vault doors, encrypted code nodes");
  });

  it("preserves commas and punctuation inside the keyword line", () => {
    const raw = "vault doors, code streams, blue/violet palette, high-contrast lighting";
    expect(sanitizePromptOutput(raw)).toBe(raw);
  });
});

describe("buildPromptUserMessage", () => {
  it("includes title, description, and site name when all present", () => {
    const result = buildPromptUserMessage(
      meta({
        title: "Page Title",
        description: "Page description text",
        siteName: "Example Site",
      }),
    );
    expect(result).toBe(
      "Title: Page Title\nDescription: Page description text\nSite: Example Site",
    );
  });

  it("prefers ogTitle over title when both are present", () => {
    const result = buildPromptUserMessage(meta({ title: "Plain Title", ogTitle: "OG Title Wins" }));
    expect(result).toBe("Title: OG Title Wins");
  });

  it("prefers ogDescription over description when both are present", () => {
    const result = buildPromptUserMessage(
      meta({ description: "plain desc", ogDescription: "og desc wins" }),
    );
    expect(result).toBe("Description: og desc wins");
  });

  it("falls back to title when ogTitle is missing", () => {
    const result = buildPromptUserMessage(meta({ title: "Fallback Title" }));
    expect(result).toBe("Title: Fallback Title");
  });

  it("falls back to description when ogDescription is missing", () => {
    const result = buildPromptUserMessage(meta({ description: "fallback desc" }));
    expect(result).toBe("Description: fallback desc");
  });

  it("omits description line when neither description is present", () => {
    const result = buildPromptUserMessage(meta({ title: "Only Title" }));
    expect(result).toBe("Title: Only Title");
    expect(result).not.toContain("Description:");
  });

  it("omits title line when neither title is present", () => {
    const result = buildPromptUserMessage(meta({ description: "Only Desc" }));
    expect(result).toBe("Description: Only Desc");
    expect(result).not.toContain("Title:");
  });

  it("omits site line when siteName is missing", () => {
    const result = buildPromptUserMessage(meta({ title: "T", description: "D" }));
    expect(result).toBe("Title: T\nDescription: D");
    expect(result).not.toContain("Site:");
  });

  it("returns an empty string when metadata has no title, description, or siteName", () => {
    expect(buildPromptUserMessage(meta({}))).toBe("");
  });

  it("includes only the site line when title and description are missing", () => {
    const result = buildPromptUserMessage(meta({ siteName: "Acme Co" }));
    expect(result).toBe("Site: Acme Co");
  });

  it("joins lines with a single newline", () => {
    const result = buildPromptUserMessage(meta({ title: "T", description: "D", siteName: "S" }));
    expect(result.split("\n")).toEqual(["Title: T", "Description: D", "Site: S"]);
  });
});
