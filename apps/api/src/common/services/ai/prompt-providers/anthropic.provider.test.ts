import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { AnthropicPromptProvider } from "./anthropic.provider";

describe("AnthropicPromptProvider", () => {
  let provider: AnthropicPromptProvider;
  let fetchSpy: ReturnType<typeof spyOn>;
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
    provider = new AnthropicPromptProvider();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    process.env.ANTHROPIC_API_KEY = originalApiKey;
  });

  describe("isEnabled", () => {
    it("returns true when API key is configured", () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it("returns false when API key is missing", () => {
      delete process.env.ANTHROPIC_API_KEY;
      const noKey = new AnthropicPromptProvider();
      expect(noKey.isEnabled()).toBe(false);
    });
  });

  describe("chat", () => {
    it("calls the messages endpoint and returns extracted text", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                content: [{ type: "text", text: "hello" }],
              }),
          } as Response),
        ) as unknown as typeof fetch,
      );
      fetchSpy.mockClear();

      const result = await provider.chat({ system: "s", user: "u" });
      expect(result).toBe("hello");
      expect(fetchSpy).toHaveBeenCalled();
      const call = fetchSpy.mock.calls.at(-1);
      expect(String(call?.[0])).toContain("/v1/messages");
    });

    it("throws when no API key and chat called", () => {
      delete process.env.ANTHROPIC_API_KEY;
      const noKey = new AnthropicPromptProvider();
      expect(noKey.chat({ system: "s", user: "u" })).rejects.toThrow(
        "Anthropic API key is not configured",
      );
    });

    it("throws when response is not ok", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );

      expect(provider.chat({ system: "s", user: "u" })).rejects.toThrow("HTTP 500");
    });

    it("returns empty string when no text block present", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: [{ type: "tool_use" }] }),
          } as Response),
        ) as unknown as typeof fetch,
      );
      const result = await provider.chat({ system: "s", user: "u" });
      expect(result).toBe("");
    });
  });
});
