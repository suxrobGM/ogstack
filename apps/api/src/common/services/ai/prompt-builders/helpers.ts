import { MAX_HEADLINE_CHARS, MAX_PALETTE_ENTRIES, MAX_TAGLINE_CHARS } from "./constants";

export function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export function sanitizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#?[0-9a-fA-F]{3}$/.test(trimmed) || /^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.startsWith("#") ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`;
  }
  return null;
}

/**
 * Builds a palette directive — prefers a multi-color palette, falls back to a
 * single accent, returns null when neither is usable.
 */
export function formatPalette(
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

/**
 * Derive a short, Flux-friendly headline from the page title. Long prose
 * fails to render; keep it to ~60 chars, drop trailing site-name segments.
 */
export function extractHeadline(title: string): string {
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

/**
 * Extract a concise tagline from the description for use as a sub-headline.
 * Drops everything after the first sentence so typography rendering stays legible.
 */
export function extractTagline(description: string): string | null {
  const firstSentence = description.split(/(?<=[.!?])\s/)[0]?.trim();
  if (!firstSentence) return null;
  return clip(firstSentence, MAX_TAGLINE_CHARS);
}

export function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
