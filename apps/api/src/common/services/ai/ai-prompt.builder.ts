import type { PageAnalysisMood, PageTheme } from "@ogstack/shared/types";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { Plan } from "@/generated/prisma";
import { FAL_MODELS } from "./image-providers";

/** Typography direction — positive, specific directives work far better than
 *  "no garbled text" negatives on FLUX. */
const TYPOGRAPHY_DIRECTIVE =
  "displayed as large, clean, bold sans-serif typography — crisp kerning, perfect spelling, " +
  "high contrast against the background, centered on a clear reading area with generous negative space";

/** Opening style anchor for the suffix — always first. */
const STYLE_LEAD = "1200x630 landscape social media preview";

/** Trailing style anchor — kept last so the final tokens reinforce craft quality. */
const STYLE_TAIL = "sharp details, professional product design aesthetic";

/** Theme-specific style notes woven into the prompt when page analysis detects
 *  a `pageTheme`. Keep each one short so the headline + background still win
 *  token weight. */
const THEME_STYLE: Record<PageTheme, string> = {
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

/** Mood → lighting/tone modifier. Complements `pageTheme` (visual direction). */
const MOOD_LIGHTING: Record<PageAnalysisMood, string> = {
  editorial: "cinematic editorial lighting",
  playful: "bright diffuse lighting with soft color splashes",
  technical: "cool even studio lighting with crisp edges",
  corporate: "neutral studio lighting with controlled highlights",
  bold: "high-contrast directional lighting with strong shadows",
};

/** Shown to users in the playground as the placeholder / default prompt hint. */
export const DEFAULT_AI_SYSTEM_PROMPT = `${STYLE_LEAD}, ${THEME_STYLE.editorial}, ${STYLE_TAIL}`;

const MAX_PROMPT_CHARS = 1400;
const MAX_SUBJECT_CHARS = 400;
const MAX_HEADLINE_CHARS = 60;
const MAX_TAGLINE_CHARS = 90;
const MAX_PALETTE_ENTRIES = 4;

/** Clips a string to the specified length, adding an ellipsis if it was too long. */
function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/** Derive a short, Flux-friendly headline from the page title. Long prose
 *  fails to render; keep it to ~60 chars, drop trailing site-name segments. */
function extractHeadline(title: string): string {
  const separators = [" — ", " – ", " | ", " · ", " : "];
  let primary = title.trim();
  for (const sep of separators) {
    const idx = primary.indexOf(sep);
    if (idx > 8 && idx < primary.length) {
      primary = primary.slice(0, idx).trim();
      break;
    }
  }
  return clip(primary, MAX_HEADLINE_CHARS);
}

/** Extract a concise tagline from the description for use as a sub-headline.
 *  Drops everything after the first sentence so typography rendering stays
 *  legible. */
function extractTagline(description: string): string | null {
  const firstSentence = description.split(/(?<=[.!?])\s/)[0]?.trim();
  if (!firstSentence) return null;
  return clip(firstSentence, MAX_TAGLINE_CHARS);
}

export interface BuildPromptOptions {
  /** User-supplied prompt that fully replaces the auto-derived subject. */
  override?: string | null;
  /** Visual keywords produced by a `PromptEnricher` (LLM pre-step) — used
   *  strictly as the background layer, not the focal subject. */
  enrichedKeywords?: string | null;
  /** Precomputed headline from AI content extraction — replaces the
   *  `extractHeadline` heuristic when provided. */
  overrideHeadline?: string | null;
  /** Precomputed tagline from AI content extraction — replaces the
   *  `extractTagline` heuristic when provided. */
  overrideTagline?: string | null;
  /** Aesthetic direction inferred from page content — selects a theme-specific
   *  style suffix. */
  pageTheme?: PageTheme | null;
  /** Copy voice inferred from page content — adds a lighting/tone modifier. */
  mood?: PageAnalysisMood | null;
  /** 2–4 hex colors from theme-color / favicon / inferred brand. Rendered as
   *  an explicit palette directive so Flux doesn't drift off-brand. */
  palette?: string[] | null;
  /** Single hex accent color. Used when `palette` is absent but a primary
   *  accent is known (e.g. scraped `theme-color`). */
  accent?: string | null;
  /** Short industry label ("fintech", "developer tools") woven into the
   *  aesthetic framing when present. */
  industry?: string | null;
}

function sanitizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#?[0-9a-fA-F]{3}$/.test(trimmed) || /^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.startsWith("#") ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`;
  }
  return null;
}

function formatPalette(
  palette: string[] | null | undefined,
  accent: string | null | undefined,
): string | null {
  const hexes = (palette ?? [])
    .map(sanitizeHex)
    .filter((v): v is string => v !== null)
    .slice(0, MAX_PALETTE_ENTRIES);

  if (hexes.length > 0) {
    return `palette of ${hexes.join(", ")}`;
  }
  const cleanAccent = accent ? sanitizeHex(accent) : null;
  return cleanAccent ? `primary accent ${cleanAccent}` : null;
}

function buildStyleSuffix(options: BuildPromptOptions): string {
  const parts = [STYLE_LEAD];
  const themeLine = options.pageTheme ? THEME_STYLE[options.pageTheme] : THEME_STYLE.editorial;
  parts.push(themeLine);

  const moodLine = options.mood ? MOOD_LIGHTING[options.mood] : null;
  if (moodLine) {
    parts.push(moodLine);
  }

  const paletteLine = formatPalette(options.palette, options.accent);
  if (paletteLine) {
    parts.push(paletteLine);
  }
  if (options.industry && options.industry.trim()) {
    parts.push(`${options.industry.trim()} sector aesthetic`);
  }
  parts.push(STYLE_TAIL);
  return parts.join(", ");
}

/** Builds a Flux prompt that leads with the exact headline text and typography
 *  direction (Flux weights early tokens heavily), then describes the
 *  background. This produces images where the page title is rendered legibly
 *  instead of being ignored or garbled. */
export function buildAiImagePrompt(
  metadata: UrlMetadata,
  options: BuildPromptOptions = {},
): string {
  const { override, enrichedKeywords, overrideHeadline, overrideTagline } = options;

  if (override && override.trim()) {
    return clip(override, MAX_SUBJECT_CHARS).slice(0, MAX_PROMPT_CHARS);
  }

  const title = metadata.ogTitle ?? metadata.title;
  const description = metadata.ogDescription ?? metadata.description;
  const styleSuffix = buildStyleSuffix(options);

  const background = enrichedKeywords?.trim()
    ? clip(enrichedKeywords, MAX_SUBJECT_CHARS)
    : "abstract modern tech composition, soft gradient backdrop, subtle geometric motifs";

  const headlineSource = overrideHeadline?.trim() || title;

  if (!headlineSource) {
    return `${background}. ${styleSuffix}`.slice(0, MAX_PROMPT_CHARS);
  }

  const headline = overrideHeadline?.trim()
    ? clip(overrideHeadline, MAX_HEADLINE_CHARS)
    : extractHeadline(headlineSource);

  const tagline = overrideTagline?.trim()
    ? clip(overrideTagline, MAX_TAGLINE_CHARS)
    : description
      ? extractTagline(description)
      : null;

  const lines: string[] = [];
  lines.push(
    `A social media preview card with the headline "${headline}" ${TYPOGRAPHY_DIRECTIVE}.`,
  );
  if (tagline) {
    lines.push(
      `Below the headline, a smaller sub-headline reads "${tagline}" in a thinner weight of the same sans-serif typeface.`,
    );
  }
  lines.push(`Background: ${background}.`);
  lines.push(styleSuffix);

  return lines.join(" ").slice(0, MAX_PROMPT_CHARS);
}

/** Maps a user plan to the FAL model they're allowed to use. Free and Plus use
 *  Flux 2; Pro uses Flux 2 Pro (capped separately by aiImageProLimit). */
export function resolveFalModelForPlan(plan: Plan): string {
  switch (plan) {
    case Plan.PRO:
      return FAL_MODELS.flux2Pro;
    case Plan.PLUS:
    case Plan.FREE:
    default:
      return FAL_MODELS.flux2;
  }
}
