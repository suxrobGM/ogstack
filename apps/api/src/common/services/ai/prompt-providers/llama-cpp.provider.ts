import { singleton } from "tsyringe";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider";

/** Works with `llama-server` (from llama.cpp) run with `--host 0.0.0.0 --port 8080`.
 *  The OpenAI-compat endpoint is available at `/v1/chat/completions` by default.
 *  Set `LLAMACPP_API_KEY` if the server was launched with `--api-key`. */
@singleton()
export class LlamaCppPromptProvider extends OpenAiCompatibleProvider {
  protected readonly config = {
    id: "llamacpp",
    baseUrl: process.env.LLAMACPP_BASE_URL || "",
    apiKey: null,
    model: process.env.LLAMACPP_MODEL || "local-model",
    requireApiKey: false,
  };
}
