import { singleton } from "tsyringe";
import {
  buildPromptUserMessage,
  PROMPT_PROVIDER_SYSTEM_PROMPT,
  sanitizePromptOutput,
  type PromptGenerateContext,
  type PromptProvider,
} from "./prompt-provider";

interface AnthropicMessagesResponse {
  content?: { type: string; text?: string }[];
}

@singleton()
export class AnthropicPromptProvider implements PromptProvider {
  readonly id = "anthropic";
  private readonly apiKey = process.env.ANTHROPIC_API_KEY ?? null;
  private readonly model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  private readonly baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async generate(ctx: PromptGenerateContext): Promise<string> {
    if (!this.apiKey) throw new Error("Anthropic API key is not configured");

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      signal: ctx.signal,
      body: JSON.stringify({
        model: this.model,
        max_tokens: 512,
        temperature: 0.4,
        system: PROMPT_PROVIDER_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPromptUserMessage(ctx.metadata) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic messages failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as AnthropicMessagesResponse;
    const raw = data.content?.find((b) => b.type === "text")?.text ?? "";
    return sanitizePromptOutput(raw);
  }
}
