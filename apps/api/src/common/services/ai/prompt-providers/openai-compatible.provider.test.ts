import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider";

class TestOpenAiProvider extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "test-provider",
    baseUrl: "https://api.test.com",
    apiKey: "test-key",
    model: "gpt-test",
    requireApiKey: true,
  };
}

class TestOpenAiProviderNoKey extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "test-no-key",
    baseUrl: "https://api.test.com",
    apiKey: null,
    model: "gpt-test",
    requireApiKey: true,
  };
}

class TestOpenAiProviderOptionalKey extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "test-optional",
    baseUrl: "http://localhost:11434",
    apiKey: null,
    model: "local-model",
    requireApiKey: false,
  };
}

describe("OpenAiCompatibleProvider", () => {
  let fetchSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  describe("isEnabled", () => {
    it("is true when baseUrl + apiKey present", () => {
      expect(new TestOpenAiProvider().isEnabled()).toBe(true);
    });

    it("is false when requireApiKey and no key", () => {
      expect(new TestOpenAiProviderNoKey().isEnabled()).toBe(false);
    });

    it("is true when not requiring an apiKey", () => {
      expect(new TestOpenAiProviderOptionalKey().isEnabled()).toBe(true);
    });

    it("is false when baseUrl empty", () => {
      class Empty extends OpenAiCompatibleProvider {
        protected readonly config = {
          id: "empty",
          baseUrl: "",
          apiKey: "k",
          model: "m",
          requireApiKey: true,
        };
      }
      expect(new Empty().isEnabled()).toBe(false);
    });
  });

  describe("chat", () => {
    it("returns completion content on success", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                choices: [{ message: { content: "result text" } }],
                usage: {
                  prompt_tokens: 10,
                  completion_tokens: 5,
                },
              }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      const provider = new TestOpenAiProvider();
      const result = await provider.chat({ system: "s", user: "u" });
      expect(result).toBe("result text");
    });

    it("sends Authorization header when apiKey present", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "ok" } }] }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      await new TestOpenAiProvider().chat({ system: "s", user: "u" });
      const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    });

    it("does not send Authorization header when no apiKey", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "ok" } }] }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      await new TestOpenAiProviderOptionalKey().chat({ system: "s", user: "u" });
      const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
      expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
    });

    it("includes json response_format when req.json is true", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "{}" } }] }),
          } as Response),
        ) as unknown as typeof fetch,
      );

      await new TestOpenAiProvider().chat({ system: "s", user: "u", json: true });
      const body = JSON.parse((fetchSpy.mock.calls[0]?.[1] as RequestInit).body as string);
      expect(body.response_format).toEqual({ type: "json_object" });
    });

    it("throws on non-ok response", () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: false, status: 429, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );
      expect(new TestOpenAiProvider().chat({ system: "s", user: "u" })).rejects.toThrow("HTTP 429");
    });

    it("returns empty string when no content", async () => {
      fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
        mock(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response),
        ) as unknown as typeof fetch,
      );
      const result = await new TestOpenAiProvider().chat({ system: "s", user: "u" });
      expect(result).toBe("");
    });
  });
});
