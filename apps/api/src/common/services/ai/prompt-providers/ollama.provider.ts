import { singleton } from "tsyringe";
import {
  buildPromptUserMessage,
  PROMPT_PROVIDER_SYSTEM_PROMPT,
  sanitizePromptOutput,
  type PromptGenerateContext,
  type PromptProvider,
} from "./prompt-provider";

interface OllamaChatResponse {
  message?: { content?: string };
}

/** Talks to a locally running Ollama server (default: http://localhost:11434).
 *  Uses Ollama's native `/api/chat` endpoint rather than the OpenAI-compat
 *  shim so we don't depend on Ollama being started with OpenAI compatibility. */
@singleton()
export class OllamaPromptProvider implements PromptProvider {
  readonly id = "ollama";
  private readonly baseUrl: string = process.env.OLLAMA_BASE_URL || "";
  private readonly model: string = process.env.OLLAMA_MODEL || "llama3.2";

  isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  async generate(ctx: PromptGenerateContext): Promise<string> {
    if (!this.baseUrl) throw new Error("Ollama base URL is not configured");

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctx.signal,
      body: JSON.stringify({
        model: this.model,
        stream: false,
        options: { temperature: 0.4, num_predict: 512 },
        messages: [
          { role: "system", content: PROMPT_PROVIDER_SYSTEM_PROMPT },
          { role: "user", content: buildPromptUserMessage(ctx.metadata) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    return sanitizePromptOutput(data.message?.content ?? "");
  }
}
