import type { ImageKind as WireImageKind } from "@ogstack/shared/constants";
import { ImageKind, type Image } from "@/generated/prisma";
import type { GenerateResponse, ImageAsset } from "./image.schema";

/** Convert the wire-level ImageKind literal to the Prisma enum. */
export function toPrismaImageKind(kind: WireImageKind): ImageKind {
  switch (kind) {
    case "og":
      return ImageKind.OG;
    case "blog_hero":
      return ImageKind.BLOG_HERO;
    case "icon_set":
      return ImageKind.ICON_SET;
  }
}

/** Convert the Prisma enum back to the wire-level literal. */
export function fromPrismaImageKind(kind: ImageKind): WireImageKind {
  switch (kind) {
    case ImageKind.OG:
      return "og";
    case ImageKind.BLOG_HERO:
      return "blog_hero";
    case ImageKind.ICON_SET:
      return "icon_set";
  }
}

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

function assetsFrom(image: Image): ImageAsset[] | null {
  if (!image.assets || !Array.isArray(image.assets)) return null;
  return image.assets as unknown as ImageAsset[];
}

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
    assets: assetsFrom(image),
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
