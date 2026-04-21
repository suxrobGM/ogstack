import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { OllamaPromptProvider } from "./ollama.provider";

describe("OllamaPromptProvider", () => {
  let provider: OllamaPromptProvider;
  let fetchSpy: ReturnType<typeof spyOn>;
  const originalBase = process.env.OLLAMA_BASE_URL;

  beforeEach(() => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    provider = new OllamaPromptProvider();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    process.env.OLLAMA_BASE_URL = originalBase;
  });

  describe("isEnabled", () => {
    it("returns true when base URL is configured", () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it("returns false when base URL is missing", () => {
      delete process.env.OLLAMA_BASE_URL;
      const noBase = new OllamaPromptProvider();
      expect(noBase.isEnabled()).toBe(false);
    });
  });

  describe("chat", () => {
    it("calls the /api/chat endpoint and returns message content", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: { content: "reply" } }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      const result = await provider.chat({ system: "s", user: "u" });
      expect(result).toBe("reply");
      const call = fetchSpy.mock.calls[0];
      expect(call?.[0]).toContain("/api/chat");
    });

    it("throws when no base URL and chat called", () => {
      delete process.env.OLLAMA_BASE_URL;
      const noBase = new OllamaPromptProvider();
      expect(noBase.chat({ system: "s", user: "u" })).rejects.toThrow(
        "Ollama base URL is not configured",
      );
    });

    it("throws when response is not ok", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );
      expect(provider.chat({ system: "s", user: "u" })).rejects.toThrow("HTTP 503");
    });

    it("returns empty string when no message content", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );
      const result = await provider.chat({ system: "s", user: "u" });
      expect(result).toBe("");
    });

    it("passes JSON format when req.json is true", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: { content: "{}" } }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      await provider.chat({ system: "s", user: "u", json: true });
      const call = fetchSpy.mock.calls[0];
      const body = JSON.parse((call?.[1] as RequestInit).body as string);
      expect(body.format).toBe("json");
    });
  });
});
