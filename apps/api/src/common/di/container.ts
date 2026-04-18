import "reflect-metadata";
import { container } from "tsyringe";
import { prisma } from "@/common/database";
import {
  AnthropicPromptProvider,
  ClaudeCodePromptProvider,
  DeepSeekPromptProvider,
  FalAiProvider,
  IMAGE_PROVIDER_TOKEN,
  LlamaCppPromptProvider,
  OllamaPromptProvider,
  OpenAiPromptProvider,
  PROMPT_PROVIDER_TOKEN,
} from "@/common/services/ai";
import { PrismaClient } from "@/generated/prisma";

// Register the Prisma singleton so tsyringe resolves PrismaClient by class reference
container.registerInstance(PrismaClient, prisma);

// Register image providers (text-to-image). Add more providers here
// (Replicate, Stability, OpenAI image, etc.) — `ImageProviderService`
// dispatches to the one that advertises support for the requested model.
container.register(IMAGE_PROVIDER_TOKEN, { useToken: FalAiProvider });

// Register prompt providers (LLMs that translate page metadata into visual
// keywords). `PromptProviderService` picks the first enabled one, or the
// provider whose id matches the `PROMPT_PROVIDER` env var.
container.register(PROMPT_PROVIDER_TOKEN, { useToken: AnthropicPromptProvider });
container.register(PROMPT_PROVIDER_TOKEN, { useToken: OpenAiPromptProvider });
container.register(PROMPT_PROVIDER_TOKEN, { useToken: DeepSeekPromptProvider });
container.register(PROMPT_PROVIDER_TOKEN, { useToken: OllamaPromptProvider });
container.register(PROMPT_PROVIDER_TOKEN, { useToken: LlamaCppPromptProvider });
container.register(PROMPT_PROVIDER_TOKEN, { useToken: ClaudeCodePromptProvider });

export { container };
