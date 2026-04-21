import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import { IMAGE_PROVIDER_TOKEN, type ImageProvider } from "./image-provider";
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

  beforeEach(() => {
    container.reset();
  });

  describe("isEnabledForModel", () => {
    it("returns true when a provider supports and is enabled for the model", () => {
      container.register(IMAGE_PROVIDER_TOKEN, {
        useValue: createImageProvider({
          id: "fal",
          supports: ["fal-ai/flux-2"],
          enabled: true,
        }),
      });
      service = container.resolve(ImageProviderService);
      expect(service.isEnabledForModel("fal-ai/flux-2")).toBe(true);
    });

    it("returns false when provider supports but not enabled", () => {
      container.register(IMAGE_PROVIDER_TOKEN, {
        useValue: createImageProvider({
          id: "fal",
          supports: ["fal-ai/flux-2"],
          enabled: false,
        }),
      });
      service = container.resolve(ImageProviderService);
      expect(service.isEnabledForModel("fal-ai/flux-2")).toBe(false);
    });

    it("returns false when no provider matches model", () => {
      service = container.resolve(ImageProviderService);
      expect(service.isEnabledForModel("unknown-model")).toBe(false);
    });
  });

  describe("generate", () => {
    it("dispatches to the matching provider", async () => {
      const generate = mock(() => Promise.resolve(Buffer.from("result")));
      container.register(IMAGE_PROVIDER_TOKEN, {
        useValue: createImageProvider({
          id: "fal",
          supports: ["fal-ai/flux-2"],
          enabled: true,
          generate,
        }),
      });
      service = container.resolve(ImageProviderService);

      const out = await service.generate({ model: "fal-ai/flux-2", prompt: "a cat" });
      expect(out.toString()).toBe("result");
      expect(generate).toHaveBeenCalled();
    });

    it("throws when no provider supports the model", () => {
      service = container.resolve(ImageProviderService);
      expect(service.generate({ model: "unknown", prompt: "x" })).rejects.toThrow(
        'No image provider registered for model "unknown"',
      );
    });

    it("throws when provider is configured but disabled", () => {
      container.register(IMAGE_PROVIDER_TOKEN, {
        useValue: createImageProvider({
          id: "fal",
          supports: ["fal-ai/flux-2"],
          enabled: false,
        }),
      });
      service = container.resolve(ImageProviderService);
      expect(service.generate({ model: "fal-ai/flux-2", prompt: "x" })).rejects.toThrow(
        'Image provider "fal" is not configured',
      );
    });
  });
});
