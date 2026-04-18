import { describe, expect, it } from "bun:test";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { computeScore, runChecks, toLetterGrade } from "./page-audit.scoring";

function baseMeta(overrides: Partial<UrlMetadata> = {}): UrlMetadata {
  return {
    ...createEmptyMetadata("https://example.com"),
    ...overrides,
  };
}

describe("audit scoring", () => {
  describe("runChecks", () => {
    it("flags a bare page as mostly failing with concrete fixes", () => {
      const issues = runChecks(baseMeta());
      const failing = issues.filter((i) => !i.pass);
      expect(failing.length).toBeGreaterThan(10);
      for (const issue of failing) {
        expect(issue.fix.length).toBeGreaterThan(0);
      }
    });

    it("passes core OG checks when tags are set", () => {
      const issues = runChecks(
        baseMeta({
          ogTitle: "Hello",
          ogDescription: "World",
          ogImage: "https://example.com/og.png",
          ogImageWidth: 1200,
          ogImageHeight: 630,
        }),
      );
      expect(issues.find((i) => i.id === "og.title")?.pass).toBe(true);
      expect(issues.find((i) => i.id === "og.description")?.pass).toBe(true);
      expect(issues.find((i) => i.id === "og.image")?.pass).toBe(true);
      expect(issues.find((i) => i.id === "og.image.dimensions")?.pass).toBe(true);
    });

    it("fails og:image dimensions when image exists but is too small", () => {
      const issues = runChecks(
        baseMeta({ ogImage: "https://example.com/og.png", ogImageWidth: 600, ogImageHeight: 400 }),
      );
      expect(issues.find((i) => i.id === "og.image.dimensions")?.pass).toBe(false);
    });

    it("fails robots check when noindex is set", () => {
      const issues = runChecks(baseMeta({ robots: "noindex, nofollow" }));
      expect(issues.find((i) => i.id === "seo.robots")?.pass).toBe(false);
    });
  });

  describe("computeScore", () => {
    it("returns 0 for the empty page", () => {
      const issues = runChecks(baseMeta());
      const scores = computeScore(issues);
      expect(scores.overall).toBeLessThan(20);
      expect(scores.letterGrade).toBe("F");
    });

    it("returns ~100 for a fully-populated page", () => {
      const fullyPopulated = baseMeta({
        title: "A great page title",
        description:
          "A good description that sits comfortably in the 50-160 range for SEO SERP snippets.",
        canonicalUrl: "https://example.com",
        lang: "en",
        hasViewport: true,
        hasCharset: true,
        favicon: "https://example.com/favicon.ico",
        h1Count: 1,
        jsonLd: [{ type: "Article", raw: {} }],
        imageCount: 0,
        ogTitle: "A great page title",
        ogDescription: "A good description.",
        ogImage: "https://example.com/og.png",
        ogImageWidth: 1200,
        ogImageHeight: 630,
        ogType: "website",
        ogUrl: "https://example.com",
        ogSiteName: "Example",
        twitterCard: "summary_large_image",
        twitterTitle: "A great page title",
        twitterDescription: "A good description.",
        twitterImage: "https://example.com/og.png",
      });
      const issues = runChecks(fullyPopulated);
      const scores = computeScore(issues);
      expect(scores.overall).toBe(100);
      expect(scores.letterGrade).toBe("A");
    });
  });

  describe("toLetterGrade", () => {
    it.each([
      [100, "A"],
      [90, "A"],
      [85, "B"],
      [75, "C"],
      [65, "D"],
      [50, "F"],
    ])("maps %d -> %s", (score, grade) => {
      expect(toLetterGrade(score)).toBe(grade);
    });
  });
});
