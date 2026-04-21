import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { container } from "tsyringe";
import { type ImageProvider } from "./image-provider";
import { ImageProviderService } from "./image-provider.service";

function createImageProvider(overrides: {
  id: string;
  supports?: string[];
  enabled?: boolean;
  generate?: ImageProvider["generate"];
}): ImageProvider {
  return {
    id: overrides.id,
    supportsModel: (model: string) => (overrides.supports ?? []).includes(model),
    isEnabled: () => overrides.enabled ?? true,
    generate: overrides.generate ?? mock(() => Promise.resolve(Buffer.from("png"))),
  };
}

describe("ImageProviderService", () => {
  let service: ImageProviderService;
  let resolveAllSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    service = new ImageProviderService();
    resolveAllSpy = spyOn(container, "resolveAll");
  });

  afterEach(() => {
    resolveAllSpy.mockRestore();
  });

  function withProviders(providers: ImageProvider[]): void {
    resolveAllSpy.mockReturnValue(providers);
  }

  describe("isEnabledForModel", () => {
    it("returns true when a provider supports and is enabled for the model", () => {
      withProviders([
        createImageProvider({ id: "fal", supports: ["fal-ai/flux-2"], enabled: true }),
      ]);
      expect(service.isEnabledForModel("fal-ai/flux-2")).toBe(true);
    });

    it("returns false when provider supports but not enabled", () => {
      withProviders([
        createImageProvider({ id: "fal", supports: ["fal-ai/flux-2"], enabled: false }),
      ]);
      expect(service.isEnabledForModel("fal-ai/flux-2")).toBe(false);
    });

    it("returns false when no provider matches model", () => {
      withProviders([]);
      expect(service.isEnabledForModel("unknown-model")).toBe(false);
    });

    it("returns false when resolveAll throws", () => {
      resolveAllSpy.mockImplementation(() => {
        throw new Error("no registrations");
      });
      expect(service.isEnabledForModel("fal-ai/flux-2")).toBe(false);
    });
  });

  describe("generate", () => {
    it("dispatches to the matching provider", async () => {
      const generate = mock(() => Promise.resolve(Buffer.from("result")));
      withProviders([
        createImageProvider({
          id: "fal",
          supports: ["fal-ai/flux-2"],
          enabled: true,
          generate,
        }),
      ]);

      const out = await service.generate({ model: "fal-ai/flux-2", prompt: "a cat" });
      expect(out.toString()).toBe("result");
      expect(generate).toHaveBeenCalled();
    });

    it("throws when no provider supports the model", () => {
      withProviders([]);
      expect(service.generate({ model: "unknown", prompt: "x" })).rejects.toThrow(
        'No image provider registered for model "unknown"',
      );
    });

    it("throws when provider is configured but disabled", () => {
      withProviders([
        createImageProvider({ id: "fal", supports: ["fal-ai/flux-2"], enabled: false }),
      ]);
      expect(service.generate({ model: "fal-ai/flux-2", prompt: "x" })).rejects.toThrow(
        'Image provider "fal" is not configured',
      );
    });
  });
});
