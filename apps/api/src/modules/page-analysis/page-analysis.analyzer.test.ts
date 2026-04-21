import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import { PromptProviderService } from "@/common/services/ai";
import { createEmptyMetadata } from "@/common/services/scraper";
import { PageAnalysisAnalyzer } from "./page-analysis.analyzer";

mock.module("./brand-signals", () => ({
  extractBrandSignals: mock(() =>
    Promise.resolve({ themeColor: null, faviconDominant: null, paletteCandidates: [] }),
  ),
}));

function mockAi() {
  return {
    title: "t",
    summary: "s",
    pageTheme: "product" as const,
    topics: ["dev"],
    keyPoints: ["a"],
    imagePrompt: {
      headline: "h",
      tagline: "t",
      backgroundKeywords: ["a", "b"],
      mood: "bold",
      suggestedAccent: "#00ffaa",
    },
    brandHints: { palette: ["#111"], industry: "saas" },
  };
}

function createMockProvider(overrides: Partial<PromptProviderService> = {}) {
  return {
    isEnabled: mock(() => true),
    getActiveProvider: mock(() => ({ id: "anthropic", model: "claude" })),
    chat: mock(() => Promise.resolve(JSON.stringify(mockAi()))),
    generate: mock(() => Promise.resolve("keywords")),
    ...overrides,
  } as unknown as PromptProviderService;
}

describe("PageAnalysisAnalyzer", () => {
  let analyzer: PageAnalysisAnalyzer;
  let provider: PromptProviderService;

  beforeEach(() => {
    container.clearInstances();
    provider = createMockProvider();
    container.registerInstance(PromptProviderService, provider);
    analyzer = container.resolve(PageAnalysisAnalyzer);
  });

  describe("isEnabled", () => {
    it("delegates to prompt provider", () => {
      expect(analyzer.isEnabled()).toBe(true);
    });
  });

  describe("getActiveProvider", () => {
    it("delegates to prompt provider", () => {
      expect(analyzer.getActiveProvider()).toEqual({ id: "anthropic", model: "claude" });
    });
  });

  describe("analyzePage", () => {
    it("returns parsed AI response on success", async () => {
      const metadata = createEmptyMetadata("https://example.com");
      metadata.title = "My Page";
      metadata.description = "desc";

      const result = await analyzer.analyzePage(metadata);
      expect(result).toEqual(mockAi() as unknown as typeof result);
    });

    it("returns null when chat returns null", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue(null);
      const result = await analyzer.analyzePage(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });

    it("returns null when response is not valid JSON", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue("not valid json at all");
      const result = await analyzer.analyzePage(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });

    it("passes user prompt directive through to chat", async () => {
      const metadata = createEmptyMetadata("https://example.com");
      await analyzer.analyzePage(metadata, "make it blue");
      const call = (provider.chat as ReturnType<typeof mock>).mock.calls[0] as unknown[];
      const req = call[0] as { user: string };
      expect(req.user).toContain("userDirective");
      expect(req.user).toContain("make it blue");
    });
  });

  describe("variationPrompt", () => {
    it("returns the generated prompt on success", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue(
        JSON.stringify({ prompt: "new vibrant prompt" }),
      );
      const result = await analyzer.variationPrompt({
        kind: "og",
        ai: mockAi() as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: "old",
      });
      expect(result).toBe("new vibrant prompt");
    });

    it("returns null when chat returns null", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue(null);
      const result = await analyzer.variationPrompt({
        kind: "og",
        ai: mockAi() as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: null,
      });
      expect(result).toBeNull();
    });

    it("returns null when prompt is empty after parsing", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue(
        JSON.stringify({ prompt: "   " }),
      );
      const result = await analyzer.variationPrompt({
        kind: "og",
        ai: mockAi() as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: null,
      });
      expect(result).toBeNull();
    });

    it("returns null on malformed JSON", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue("not json");
      const result = await analyzer.variationPrompt({
        kind: "og",
        ai: mockAi() as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: null,
      });
      expect(result).toBeNull();
    });

    it("passes user directive through to chat", async () => {
      (provider.chat as ReturnType<typeof mock>).mockResolvedValue(
        JSON.stringify({ prompt: "ok" }),
      );
      await analyzer.variationPrompt({
        kind: "og",
        ai: mockAi() as never,
        metadata: createEmptyMetadata("https://example.com"),
        previousPrompt: null,
        userPrompt: "cyberpunk",
      });
      const call = (provider.chat as ReturnType<typeof mock>).mock.calls[0] as unknown[];
      const req = call[0] as { user: string };
      expect(req.user).toContain("userDirective");
      expect(req.user).toContain("cyberpunk");
    });
  });
});
