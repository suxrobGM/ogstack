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
  const base = {
    id: image.id,
    kind: fromPrismaImageKind(image.kind),
    width: image.width,
    height: image.height,
    assets: assetsFromImage(image) ?? null,
    source: {
      title: image.title,
      description: image.description,
      favicon: image.faviconUrl,
    },
  };

  if (extras.fromCache) {
    return {
      ...base,
      imageUrl: image.cdnUrl ?? image.imageUrl,
      cached: true,
      generationMs: null,
      // aiFellBack isn't persisted on the Image row, so cache hits report false.
      ai: image.aiEnabled
        ? { enabled: true, model: image.aiModel, prompt: image.aiPrompt, fellBack: false }
        : null,
    };
  }

  const { outcome } = extras;
  const aiAttempted = outcome.aiEnabled || outcome.aiFellBack;
  return {
    ...base,
    imageUrl: image.imageUrl,
    cached: false,
    generationMs: extras.generationMs,
    ai: aiAttempted
      ? {
          enabled: outcome.aiEnabled,
          model: outcome.aiModel,
          prompt: outcome.aiPrompt,
          fellBack: outcome.aiFellBack,
        }
      : null,
  };
}
