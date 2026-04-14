import { singleton } from "tsyringe";
import type { ChatRequest, PromptProvider } from "./prompt-provider";

interface AnthropicMessagesResponse {
  content?: { type: string; text?: string }[];
}

@singleton()
export class AnthropicPromptProvider implements PromptProvider {
  readonly id = "anthropic";
  readonly model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  private readonly apiKey = process.env.ANTHROPIC_API_KEY ?? null;
  private readonly baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.apiKey) throw new Error("Anthropic API key is not configured");

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      signal: req.signal,
      body: JSON.stringify({
        model: this.model,
        max_tokens: req.maxTokens ?? 1500,
        temperature: req.temperature ?? 0.3,
        system: req.system,
        messages: [{ role: "user", content: req.user }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic messages failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as AnthropicMessagesResponse;
    return data.content?.find((b) => b.type === "text")?.text ?? "";
  }
}
