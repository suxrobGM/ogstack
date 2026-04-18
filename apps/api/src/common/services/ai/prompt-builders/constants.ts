import type { PageAnalysisMood, PageTheme } from "@ogstack/shared/types";

/**
 * Asset kinds the prompt builders produce. Distinct from `ImageKind` because
 * this also covers `hero` which maps to the DB `BLOG_HERO` kind.
 */
export type PromptAssetKind = "og" | "hero" | "icon";

/**
 * Typography direction — positive, specific directives work far better than
 * "no garbled text" negatives on FLUX. Used by the OG fallback.
 */
export const TYPOGRAPHY_DIRECTIVE =
  "displayed as large, clean, bold sans-serif typography — crisp kerning, perfect spelling, " +
  "high contrast against the background, centered on a clear reading area with generous negative space";

/** Opening style anchor for the OG suffix — always first. */
export const STYLE_LEAD = "1200x630 landscape social media preview";

/** Trailing style anchor — kept last so the final tokens reinforce craft quality. */
export const STYLE_TAIL = "sharp details, professional product design aesthetic";

export const THEME_STYLE: Record<PageTheme, string> = {
  editorial: "modern editorial illustration, cinematic lighting, refined color palette",
  technical: "clean technical schematic aesthetic, precise geometry, cool muted palette",
  minimal: "minimal composition, abundant negative space, restrained palette, soft even light",
  vibrant: "vivid saturated palette, energetic composition, punchy contrast",
  muted: "muted desaturated palette, subtle texture, quiet contemplative mood",
  playful: "playful illustration style, rounded forms, friendly bright palette",
  corporate: "corporate editorial photography feel, clean composition, trustworthy tone",
  dark: "rich dark palette, dramatic rim lighting, cinematic contrast",
  luxury: "luxury editorial feel, refined materials, gold and deep tone accents, elegant light",
};

export const MOOD_LIGHTING: Record<PageAnalysisMood, string> = {
  editorial: "cinematic editorial lighting",
  playful: "bright diffuse lighting with soft color splashes",
  technical: "cool even studio lighting with crisp edges",
  corporate: "neutral studio lighting with controlled highlights",
  bold: "high-contrast directional lighting with strong shadows",
};

/** Size anchor appended to the deterministic tail per asset kind. */
export const SIZE_ANCHOR: Record<PromptAssetKind, string> = {
  og: "1200x630 landscape composition",
  hero: "1600x900 wide cinematic composition",
  icon: "512x512 square, transparent-friendly background, legible at 16x16",
};

export const MAX_PROMPT_CHARS = 1400;
export const MAX_ICON_PROMPT_CHARS = 900;
export const MAX_SUBJECT_CHARS = 400;
export const MAX_HEADLINE_CHARS = 60;
export const MAX_TAGLINE_CHARS = 90;
export const MAX_PALETTE_ENTRIES = 4;

/** Shown to users in the playground as the placeholder / default prompt hint. */
export const DEFAULT_AI_SYSTEM_PROMPT = `${STYLE_LEAD}, ${THEME_STYLE.editorial}, ${STYLE_TAIL}`;
