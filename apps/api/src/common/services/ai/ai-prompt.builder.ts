import type { UrlMetadata } from "@/common/services/scraper.service";
import { Plan } from "@/generated/prisma";
import { FAL_MODELS } from "./image-providers";

/** Typography direction — positive, specific directives work far better than
 *  "no garbled text" negatives on FLUX. */
const TYPOGRAPHY_DIRECTIVE =
  "displayed as large, clean, bold sans-serif typography — crisp kerning, perfect spelling, " +
  "high contrast against the background, centered on a clear reading area with generous negative space";

/** Style modifiers appended after the headline + background. Kept short so the
 *  model weights the leading text-rendering instruction most heavily. */
const STYLE_SUFFIX =
  "1200x630 landscape social media preview, modern editorial illustration, cinematic lighting, " +
  "refined color palette, sharp details, professional product design aesthetic";

/** Shown to users in the playground as the placeholder / default prompt hint. */
export const DEFAULT_AI_SYSTEM_PROMPT = STYLE_SUFFIX;

const MAX_PROMPT_CHARS = 1400;
const MAX_SUBJECT_CHARS = 400;
const MAX_HEADLINE_CHARS = 60;
const MAX_TAGLINE_CHARS = 90;

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

interface BuildPromptOptions {
  /** User-supplied prompt that fully replaces the auto-derived subject. */
  override?: string | null;
  /** Visual keywords produced by a `PromptEnricher` (LLM pre-step) — used
   *  strictly as the background layer, not the focal subject. */
  enrichedKeywords?: string | null;
}

/** Builds a Flux prompt that leads with the exact headline text and typography
 *  direction (Flux weights early tokens heavily), then describes the
 *  background. This produces images where the page title is rendered legibly
 *  instead of being ignored or garbled. */
export function buildAiImagePrompt(
  metadata: UrlMetadata,
  options: BuildPromptOptions = {},
): string {
  const { override, enrichedKeywords } = options;

  if (override && override.trim()) {
    return clip(override, MAX_SUBJECT_CHARS).slice(0, MAX_PROMPT_CHARS);
  }

  const title = metadata.ogTitle ?? metadata.title;
  const description = metadata.ogDescription ?? metadata.description;
  const background = enrichedKeywords?.trim()
    ? clip(enrichedKeywords, MAX_SUBJECT_CHARS)
    : "abstract modern tech composition, soft gradient backdrop, subtle geometric motifs";

  if (!title) {
    return `${background}. ${STYLE_SUFFIX}`.slice(0, MAX_PROMPT_CHARS);
  }

  const headline = extractHeadline(title);
  const tagline = description ? extractTagline(description) : null;

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
  lines.push(STYLE_SUFFIX);

  return lines.join(" ").slice(0, MAX_PROMPT_CHARS);
}

/** Maps a user plan to the FAL model they're allowed to use. Returns null when
 *  the plan is not entitled to AI generation. */
export function resolveFalModelForPlan(plan: Plan): string | null {
  switch (plan) {
    case Plan.FREE:
      return null;
    case Plan.PRO:
      return FAL_MODELS.flux2;
    case Plan.BUSINESS:
    case Plan.ENTERPRISE:
      return FAL_MODELS.flux2Pro;
    default:
      return null;
  }
}
