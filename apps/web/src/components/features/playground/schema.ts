import {
  BLOG_HERO_ASPECTS,
  IMAGE_KINDS,
  isValidHttpUrl,
  type BlogHeroAspect,
  type ImageKind,
} from "@ogstack/shared";
import { z } from "zod/v4";

export const FONT_FAMILIES = [
  "inter",
  "plus-jakarta-sans",
  "space-grotesk",
  "jetbrains-mono",
  "noto-sans",
  "instrument-serif",
] as const;

export const LOGO_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
export const AI_MODEL_TIERS = ["standard", "pro"] as const;
export const AI_PROMPT_MAX_CHARS = 500;

export type FontFamily = (typeof FONT_FAMILIES)[number];
export type LogoPosition = (typeof LOGO_POSITIONS)[number];
export type AiModelTier = (typeof AI_MODEL_TIERS)[number];

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

export const playgroundFormSchema = z.object({
  url: z.string().refine(isValidHttpUrl, {
    message: "Enter a valid URL (including https://, no spaces).",
  }),
  kind: z.enum(IMAGE_KINDS),
  template: z.string().min(1, "Pick a template."),
  aspectRatio: z.enum(BLOG_HERO_ASPECTS),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color (e.g. #3B82F6)."),
  dark: z.boolean(),
  font: z.enum(FONT_FAMILIES),
  logoUrl: z.union([z.literal(""), z.url("Enter a valid URL.")]),
  logoPosition: z.enum(LOGO_POSITIONS),
  aiGenerated: z.boolean(),
  aiModel: z.enum(AI_MODEL_TIERS),
  aiPrompt: z
    .string()
    .max(AI_PROMPT_MAX_CHARS, `Prompt must be ${AI_PROMPT_MAX_CHARS} characters or fewer.`),
  fullOverride: z.boolean(),
});

export type PlaygroundFormValues = z.infer<typeof playgroundFormSchema>;
