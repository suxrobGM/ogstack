import { singleton } from "tsyringe";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider";

@singleton()
export class DeepSeekPromptProvider extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "deepseek",
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY ?? null,
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    requireApiKey: true,
  };
}
