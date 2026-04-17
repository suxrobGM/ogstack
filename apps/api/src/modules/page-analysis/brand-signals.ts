import { isValidHttpUrl } from "@ogstack/shared/utils";
import sharp from "sharp";
import { logger } from "@/common/logger";
import type { UrlMetadata } from "@/common/services/scraper";

const FAVICON_FETCH_TIMEOUT_MS = 3_000;
const MAX_FAVICON_BYTES = 512 * 1024;

const SUPPORTED_FAVICON_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/vnd.microsoft.icon",
  "image/x-icon",
]);

export interface BrandSignals {
  /** `<meta name="theme-color">` if present. */
  themeColor: string | null;
  /** Dominant hex color of the favicon, or null if fetch/decode failed. */
  faviconDominant: string | null;
  /** 2-4 hex strings combining themeColor + faviconDominant, deduped. */
  paletteCandidates: string[];
}

/**
 * Extracts brand color signals from a scraped page. The LLM uses these as
 * grounded hints; `suggestedAccent` is expected to prefer these over
 * LLM-inferred colors.
 *
 * Favicon fetch is time-capped and format-gated. `.ico` files still decode in
 * sharp via the bundled libvips on recent versions; decode failures fall
 * through silently.
 */
export async function extractBrandSignals(metadata: UrlMetadata): Promise<BrandSignals> {
  const themeColor = normalizeHex(metadata.themeColor);
  const faviconDominant = metadata.favicon ? await extractFaviconDominant(metadata.favicon) : null;

  const paletteCandidates = dedupeHex([themeColor, faviconDominant].filter(isString));

  return { themeColor, faviconDominant, paletteCandidates };
}

async function extractFaviconDominant(url: string): Promise<string | null> {
  if (!isValidHttpUrl(url)) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FAVICON_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }

    const rawContentType = response.headers.get("content-type") ?? "";
    const contentType = rawContentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (contentType && !SUPPORTED_FAVICON_TYPES.has(contentType)) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_FAVICON_BYTES) {
      return null;
    }

    const stats = await sharp(Buffer.from(buffer)).stats();
    const { r, g, b } = stats.dominant;
    return rgbToHex(r, g, b);
  } catch (error) {
    logger.warn({ url, err: (error as Error).message }, "Favicon dominant-color extraction failed");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeHex(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^#?[0-9a-fA-F]{3}$/.test(trimmed)) {
    const body = trimmed.replace("#", "");
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`.toLowerCase();
  }
  if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.replace("#", "").toLowerCase()}`;
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number): string => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function dedupeHex(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const normalized = normalizeHex(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function isString(value: string | null): value is string {
  return typeof value === "string";
}
