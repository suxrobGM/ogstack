import type { Image } from "@/generated/prisma";
import type { GenerateResponse } from "./image.schema";

export interface AiRenderOutcome {
  pngBuffer: Buffer;
  aiEnabled: boolean;
  aiFellBack: boolean;
  aiModel: string | null;
  aiPrompt: string | null;
}

type GenerateResponseExtras =
  | { fromCache: true }
  | { fromCache: false; outcome: AiRenderOutcome; generationMs: number };

export function toGenerateResponse(image: Image, extras: GenerateResponseExtras): GenerateResponse {
  const metadata = {
    title: image.title,
    description: image.description,
    favicon: image.faviconUrl,
  };

  if (extras.fromCache) {
    return {
      imageUrl: image.cdnUrl ?? image.imageUrl,
      cached: true,
      aiEnabled: image.aiEnabled,
      aiModel: image.aiModel,
      aiPrompt: image.aiPrompt,
      metadata,
    };
  }

  return {
    imageUrl: image.imageUrl,
    cached: false,
    generationMs: extras.generationMs,
    aiEnabled: extras.outcome.aiEnabled,
    aiFellBack: extras.outcome.aiFellBack,
    aiModel: extras.outcome.aiModel,
    aiPrompt: extras.outcome.aiPrompt,
    metadata,
  };
}
