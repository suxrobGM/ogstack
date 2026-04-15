import type { ChatRequest, PromptProvider } from "./utils";

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

interface OpenAiCompatConfig {
  id: string;
  baseUrl: string;
  apiKey: string | null;
  model: string;
  /** Some deployments (Ollama, llama.cpp) don't require an API key. */
  requireApiKey: boolean;
}

/**
 * Shared implementation for any chat API that speaks the OpenAI
 * `/v1/chat/completions` schema: OpenAI, DeepSeek, llama.cpp server, and
 * Ollama's OpenAI-compat endpoint. Concrete providers supply their base URL,
 * API-key env var, and default model.
 */
export abstract class OpenAiCompatibleProvider implements PromptProvider {
  protected abstract readonly config: OpenAiCompatConfig;

  get id(): string {
    return this.config.id;
  }

  get model(): string {
    return this.config.model;
  }

  isEnabled(): boolean {
    if (!this.config.baseUrl) return false;
    return this.config.requireApiKey ? Boolean(this.config.apiKey) : true;
  }

  async chat(req: ChatRequest): Promise<string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.config.apiKey) headers.Authorization = `Bearer ${this.config.apiKey}`;

    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers,
      signal: req.signal,
      body: JSON.stringify({
        model: this.config.model,
        temperature: req.temperature ?? 0.3,
        // Reasoning models (Qwen 3, DeepSeek R1) emit <think>...</think> blocks
        // before the answer — leave headroom so the output isn't truncated.
        max_tokens: req.maxTokens ?? 1500,
        ...(req.json ? { response_format: { type: "json_object" } } : {}),
        // Qwen 3 / DeepSeek recognize these to disable reasoning. OpenAI and
        // other vendors ignore unknown fields.
        chat_template_kwargs: { enable_thinking: false },
        enable_thinking: false,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.user },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`${this.config.id} chat completion failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    return data.choices?.[0]?.message?.content ?? "";
  }
}
