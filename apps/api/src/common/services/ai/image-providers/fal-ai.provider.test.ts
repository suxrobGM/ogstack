import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { FAL_MODELS, FalAiProvider } from "./fal-ai.provider";

describe("FalAiProvider", () => {
  let provider: FalAiProvider;
  let fetchSpy: ReturnType<typeof spyOn>;
  const origKey = process.env.FAL_API_KEY;

  beforeEach(() => {
    process.env.FAL_API_KEY = "test-fal-key";
    provider = new FalAiProvider();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    process.env.FAL_API_KEY = origKey;
  });

  describe("isEnabled", () => {
    it("is true when FAL_API_KEY is present", () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it("is false when FAL_API_KEY is missing", () => {
      delete process.env.FAL_API_KEY;
      expect(new FalAiProvider().isEnabled()).toBe(false);
    });
  });

  describe("supportsModel", () => {
    it("accepts registered FAL model ids", () => {
      expect(provider.supportsModel(FAL_MODELS.flux2)).toBe(true);
      expect(provider.supportsModel(FAL_MODELS.flux2Pro)).toBe(true);
      expect(provider.supportsModel(FAL_MODELS.schnell)).toBe(true);
    });

    it("rejects unknown models", () => {
      expect(provider.supportsModel("other/model")).toBe(false);
    });
  });

  describe("generate", () => {
    it("throws BadRequestError when key is not configured", () => {
      delete process.env.FAL_API_KEY;
      const p = new FalAiProvider();
      expect(p.generate({ model: FAL_MODELS.flux2, prompt: "x" })).rejects.toThrow(
        "FAL.ai is not configured on this server.",
      );
    });

    it("throws BadRequestError when prompt is empty", () => {
      expect(provider.generate({ model: FAL_MODELS.flux2, prompt: "   " })).rejects.toThrow(
        "AI prompt is empty.",
      );
    });

    it("throws BadRequestError for an unsupported model", () => {
      expect(provider.generate({ model: "unknown", prompt: "x" })).rejects.toThrow(
        'FAL provider does not support model "unknown".',
      );
    });

    it("submits, polls until COMPLETED, fetches result, and downloads the image", async () => {
      const calls: { url: string; init?: RequestInit }[] = [];
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock((url: string, init?: RequestInit) => {
          calls.push({ url, init });

          if (url.startsWith("https://queue.fal.run/fal-ai/flux-2") && !url.includes("/status")) {
            if (init?.method === "POST") {
              return Promise.resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    request_id: "req-1",
                    status_url: "https://queue.fal.run/fal-ai/flux-2/requests/req-1/status",
                    response_url: "https://queue.fal.run/fal-ai/flux-2/requests/req-1",
                  }),
              } as Response);
            }
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  images: [{ url: "https://cdn.fal.ai/image.png", content_type: "image/png" }],
                }),
            } as Response);
          }

          if (url.includes("/status")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "COMPLETED" }),
            } as Response);
          }

          if (url === "https://cdn.fal.ai/image.png") {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
            } as unknown as Response);
          }

          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({}),
          } as Response);
        }) as unknown as typeof fetch,
      );

      const buf = await provider.generate({ model: FAL_MODELS.flux2, prompt: "cat" });
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.byteLength).toBe(3);
    });

    it("throws when submit fails", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );
      expect(provider.generate({ model: FAL_MODELS.flux2, prompt: "cat" })).rejects.toThrow(
        "FAL submit failed",
      );
    });

    it("throws when result has no image url", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock((url: string, init?: RequestInit) => {
          if (init?.method === "POST") {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  request_id: "r",
                  status_url: "https://queue.fal.run/fal-ai/flux-2/requests/r/status",
                  response_url: "https://queue.fal.run/fal-ai/flux-2/requests/r",
                }),
            } as Response);
          }
          if (url.includes("/status")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "COMPLETED" }),
            } as Response);
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ images: [] }),
          } as Response);
        }) as unknown as typeof fetch,
      );

      expect(provider.generate({ model: FAL_MODELS.flux2, prompt: "cat" })).rejects.toThrow(
        "FAL response contained no image",
      );
    });

    it("throws when status reports FAILED", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock((url: string, init?: RequestInit) => {
          if (init?.method === "POST") {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  request_id: "r",
                  status_url: "https://queue.fal.run/fal-ai/flux-2/requests/r/status",
                  response_url: "https://queue.fal.run/fal-ai/flux-2/requests/r",
                }),
            } as Response);
          }
          if (url.includes("/status")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "FAILED" }),
            } as Response);
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
        }) as unknown as typeof fetch,
      );

      expect(provider.generate({ model: FAL_MODELS.flux2, prompt: "cat" })).rejects.toThrow(
        "FAL job failed",
      );
    });
  });
});
