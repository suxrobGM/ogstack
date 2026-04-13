import { singleton } from "tsyringe";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider";

@singleton()
export class OpenAiPromptProvider extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "openai",
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com",
    apiKey: process.env.OPENAI_API_KEY ?? null,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    requireApiKey: true,
  };
}
