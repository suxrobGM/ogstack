import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import { createEmptyMetadata } from "@/common/services/scraper";
import { PromptProviderService } from "./prompt-provider.service";
import { PROMPT_PROVIDER_TOKEN, type PromptProvider } from "./utils";

function createProvider(
  overrides: Partial<PromptProvider> & { id: string; model?: string; enabled?: boolean },
): PromptProvider {
  const enabled = overrides.enabled ?? true;
  return {
    id: overrides.id,
    model: overrides.model ?? "test-model",
    isEnabled: mock(() => enabled),
    chat: overrides.chat ?? mock(() => Promise.resolve("response")),
  } as PromptProvider;
}

describe("PromptProviderService", () => {
  let service: PromptProviderService;

  beforeEach(() => {
    container.reset();
    delete process.env.PROMPT_PROVIDER;
  });

  describe("isEnabled", () => {
    it("returns true when at least one provider is enabled", () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "anthropic", enabled: true }),
      });
      service = container.resolve(PromptProviderService);
      expect(service.isEnabled()).toBe(true);
    });

    it("returns false when no providers are enabled", () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "anthropic", enabled: false }),
      });
      service = container.resolve(PromptProviderService);
      expect(service.isEnabled()).toBe(false);
    });

    it("returns false when no providers registered", () => {
      service = container.resolve(PromptProviderService);
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe("getActiveProvider", () => {
    it("returns the first enabled provider", () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "anthropic", model: "m1", enabled: true }),
      });
      service = container.resolve(PromptProviderService);
      expect(service.getActiveProvider()).toEqual({ id: "anthropic", model: "m1" });
    });

    it("returns the preferred provider when PROMPT_PROVIDER matches", () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "anthropic", enabled: true }),
      });
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "openai", enabled: true, model: "o-m" }),
      });
      process.env.PROMPT_PROVIDER = "openai";
      service = container.resolve(PromptProviderService);
      expect(service.getActiveProvider()?.id).toBe("openai");
    });

    it("falls back to first enabled when preferred provider not found", () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({ id: "anthropic", enabled: true }),
      });
      process.env.PROMPT_PROVIDER = "ghost";
      service = container.resolve(PromptProviderService);
      expect(service.getActiveProvider()?.id).toBe("anthropic");
    });

    it("returns null when nothing enabled", () => {
      service = container.resolve(PromptProviderService);
      expect(service.getActiveProvider()).toBeNull();
    });
  });

  describe("chat", () => {
    it("returns provider text on success", async () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("hello world")),
        }),
      });
      service = container.resolve(PromptProviderService);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBe("hello world");
    });

    it("returns null when no provider is enabled", async () => {
      service = container.resolve(PromptProviderService);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBeNull();
    });

    it("returns null when provider chat throws", async () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.reject(new Error("boom"))),
        }),
      });
      service = container.resolve(PromptProviderService);
      const result = await service.chat({ system: "s", user: "u" });
      expect(result).toBeNull();
    });
  });

  describe("generate", () => {
    it("returns sanitized keywords on success", async () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("Keywords: neon, grid, cyber")),
        }),
      });
      service = container.resolve(PromptProviderService);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBe("neon, grid, cyber");
    });

    it("returns null when chat returns null", async () => {
      service = container.resolve(PromptProviderService);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });

    it("returns null when sanitization produces empty string", async () => {
      container.register(PROMPT_PROVIDER_TOKEN, {
        useValue: createProvider({
          id: "anthropic",
          enabled: true,
          chat: mock(() => Promise.resolve("   \n  \n  ")),
        }),
      });
      service = container.resolve(PromptProviderService);
      const result = await service.generate(createEmptyMetadata("https://example.com"));
      expect(result).toBeNull();
    });
  });
});
