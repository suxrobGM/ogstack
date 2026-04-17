import type { BlogHeroAspect, ImageKind } from "@ogstack/shared";

export const FONT_FAMILIES = [
  "inter",
  "plus-jakarta-sans",
  "space-grotesk",
  "jetbrains-mono",
  "noto-sans",
  "instrument-serif",
] as const;

export const LOGO_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

export const AI_PROMPT_MAX_CHARS = 500;

export type FontFamily = (typeof FONT_FAMILIES)[number];
export type LogoPosition = (typeof LOGO_POSITIONS)[number];

export const FONT_LABELS: Record<FontFamily, string> = {
  inter: "Inter",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  "space-grotesk": "Space Grotesk",
  "jetbrains-mono": "JetBrains Mono",
  "noto-sans": "Noto Sans",
  "instrument-serif": "Instrument Serif",
};

export const LOGO_POSITION_LABELS: Record<LogoPosition, string> = {
  "top-left": "Top Left",
  "top-right": "Top Right",
  "bottom-left": "Bottom Left",
  "bottom-right": "Bottom Right",
};

export const IMAGE_KIND_LABELS: Record<ImageKind, string> = {
  og: "OG Image",
  blog_hero: "Blog Hero",
  icon_set: "Favicon Set",
};

export const BLOG_HERO_ASPECT_LABELS: Record<BlogHeroAspect, string> = {
  "16:9": "16:9 · 1600×900",
  "16:10": "16:10 · 1920×1080",
};

export type AiModelTier = "standard" | "pro";

export interface PlaygroundFormValues {
  url: string;
  kind: ImageKind;
  template: string;
  aspectRatio: BlogHeroAspect;
  accent: string;
  dark: boolean;
  font: FontFamily;
  logoUrl: string;
  logoPosition: LogoPosition;
  aiGenerated: boolean;
  aiModel: AiModelTier;
  aiPrompt: string;
  fullOverride: boolean;
}
