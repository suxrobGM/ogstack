import type { ImageKind } from "./image-kinds";

export interface ImageDimensions {
  width: number;
  height: number;
}

export const OG_DIMENSIONS: ImageDimensions = { width: 1200, height: 630 };

export const BLOG_HERO_ASPECTS = ["16:9", "16:10"] as const;
export type BlogHeroAspect = (typeof BLOG_HERO_ASPECTS)[number];

export const BLOG_HERO_DIMENSIONS: Record<BlogHeroAspect, ImageDimensions> = {
  "16:9": { width: 1600, height: 900 },
  "16:10": { width: 1920, height: 1080 },
};

export const DEFAULT_BLOG_HERO_ASPECT: BlogHeroAspect = "16:9";

export const ICON_SIZES = [16, 32, 48, 180, 192, 512] as const;
export type IconSize = (typeof ICON_SIZES)[number];

/** Master resolution requested from Flux before post-processing. */
export const ICON_MASTER_SIZE = 1024;

export function resolveDimensions(
  kind: ImageKind,
  aspect?: BlogHeroAspect | null,
): ImageDimensions {
  if (kind === "blog_hero") {
    return BLOG_HERO_DIMENSIONS[aspect ?? DEFAULT_BLOG_HERO_ASPECT];
  }
  return OG_DIMENSIONS;
}
