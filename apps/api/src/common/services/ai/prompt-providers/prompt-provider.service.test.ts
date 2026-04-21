import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { container } from "tsyringe";
import { createEmptyMetadata } from "@/common/services/scraper";
import { PromptProviderService } from "./prompt-provider.service";
import { type PromptProvider } from "./utils";

function createProvider(overrides: {
  id: string;
  model?: string;
  enabled?: boolean;
  chat?: PromptProvider["chat"];
}): PromptProvider {
  const enabled = overrides.enabled ?? true;
  return {
    id: overrides.id,
    model: overrides.model ?? "test-model",
    isEnabled: mock(() => enabled),
    chat: overrides.chat ?? mock(() => Promise.resolve("response")),
  };
}

describe("PromptProviderService", () => {
  let service: PromptProviderService;
  let resolveAllSpy: ReturnType<typeof spyOn>;
  const origPreference = process.env.PROMPT_PROVIDER;

  beforeEach(() => {
    delete process.env.PROMPT_PROVIDER;
    service = new PromptProviderService();
    resolveAllSpy = spyOn(container, "resolveAll");
  });

  afterEach(() => {
    resolveAllSpy.mockRestore();
    process.env.PROMPT_PROVIDER = origPreference;
  });

  function withProviders(providers: PromptProvider[]): void {
    resolveAllSpy.mockReturnValue(providers);
  }

  describe("isEnabled", () => {
    it("returns true when at least one provider is enabled", () => {
      withProviders([createProvider({ id: "anthropic", enabled: true })]);
      expect(service.isEnabled()).toBe(true);
    });

    it("returns false when no providers are enabled", () => {
      withProviders([createProvider({ id: "anthropic", enabled: false })]);
      expect(service.isEnabled()).toBe(false);
    });

    it("returns false when no providers registered", () => {
      withProviders([]);
      expect(service.isEnabled()).toBe(false);
    });

    it("returns false when resolveAll throws (no registrations)", () => {
      resolveAllSpy.mockImplementation(() => {
        throw new Error("no registrations");
      });
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe("getActiveProvider", () => {
    it("returns the first enabled provider", () => {
      withProviders([createProvider({ id: "anthropic", model: "m1", enabled: true })]);
      expect(service.getActiveProvider()).toEqual({ id: "anthropic", model: "m1" });
    });

    it("returns the preferred provider when PROMPT_PROVIDER matches", () => {
      withProviders([
        createProvider({ id: "anthropic", enabled: true }),
        createProvider({ id: "openai", enabled: true, model: "o-m" }),
      ]);
      process.env.PROMPT_PROVIDER = "openai";
      expect(service.getActiveProvider()?.id).toBe("openai");
    });

    it("falls back to first enabled when preferred provider not found", () => {
      withProviders([createProvider({ id: "anthropic", enabled: true })]);
      process.env.PROMPT_PROVIDER = "ghost";
      expect(service.getActiveProvider()?.id).toBe("anthropic");
    });

    it("returns null when nothing enabled", () => {
      withProviders([]);
      expect(service.getActiveProvider()).toBeNull();
    });
  });

  describe("chat", () => {
    it("returns provider text on success", async () => {
      withProviders([
        createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("hello world")),
        }),
      ]);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBe("hello world");
    });

    it("returns null when no provider is enabled", async () => {
      withProviders([]);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBeNull();
    });

    it("returns null when provider chat throws", async () => {
      withProviders([
        createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.reject(new Error("boom"))),
        }),
      ]);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBeNull();
    });
  });

  describe("generate", () => {
    it("returns sanitized keywords on success", async () => {
      withProviders([
        createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("Keywords: neon, grid, cyber")),
        }),
      ]);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBe("neon, grid, cyber");
    });

    it("returns null when chat returns null", async () => {
      withProviders([]);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });

    it("returns null when sanitization produces empty string", async () => {
      withProviders([
        createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("   \n  \n  ")),
        }),
      ]);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });
  });
});
