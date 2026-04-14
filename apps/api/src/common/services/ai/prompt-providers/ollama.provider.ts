import { singleton } from "tsyringe";
import type { ChatRequest, PromptProvider } from "./prompt-provider";

interface OllamaChatResponse {
  message?: { content?: string };
}

/** Talks to a locally running Ollama server (default: http://localhost:11434).
 *  Uses Ollama's native `/api/chat` endpoint rather than the OpenAI-compat
 *  shim so we don't depend on Ollama being started with OpenAI compatibility. */
@singleton()
export class OllamaPromptProvider implements PromptProvider {
  readonly id = "ollama";
  readonly model: string = process.env.OLLAMA_MODEL || "llama3.2";
  private readonly baseUrl: string = process.env.OLLAMA_BASE_URL || "";

  isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.baseUrl) throw new Error("Ollama base URL is not configured");

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: req.signal,
      body: JSON.stringify({
        model: this.model,
        stream: false,
        ...(req.json ? { format: "json" } : {}),
        options: {
          temperature: req.temperature ?? 0.3,
          num_predict: req.maxTokens ?? 1500,
        },
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.user },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message?.content ?? "";
  }
}
