import type { Image } from "@/generated/prisma";
import { assetsFromImage, fromPrismaImageKind } from "@/modules/image/image.mapper";
import type { GenerateResponse } from "./generation.schema";

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

  const base = {
    kind: fromPrismaImageKind(image.kind),
    width: image.width,
    height: image.height,
    assets: assetsFromImage(image),
    metadata,
  };

  if (extras.fromCache) {
    return {
      ...base,
      imageUrl: image.cdnUrl ?? image.imageUrl,
      cached: true,
      aiEnabled: image.aiEnabled,
      aiModel: image.aiModel,
      aiPrompt: image.aiPrompt,
    };
  }

  return {
    ...base,
    imageUrl: image.imageUrl,
    cached: false,
    generationMs: extras.generationMs,
    aiEnabled: extras.outcome.aiEnabled,
    aiFellBack: extras.outcome.aiFellBack,
    aiModel: extras.outcome.aiModel,
    aiPrompt: extras.outcome.aiPrompt,
  };
}
