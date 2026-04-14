import { logger } from "@/common/logger";
import type { OEmbedData, UrlMetadata } from "./scraper.types";

const OEMBED_TIMEOUT_MS = 3000;

/** Applies fallback rules to fill missing core fields (title, description,
 *  image) using Twitter Card, JSON-LD, h1, and domain heuristics. Mutates and
 *  returns the same object for convenience. */
export function applyMetadataFallbacks(metadata: UrlMetadata): UrlMetadata {
  const jsonLd = metadata.jsonLd[0];

  // Title fallback chain: og:title -> twitter:title -> <title> -> JSON-LD -> h1 -> domain
  if (!metadata.ogTitle) {
    metadata.ogTitle =
      metadata.twitterTitle ??
      metadata.title ??
      jsonLd?.headline ??
      jsonLd?.name ??
      metadata.h1 ??
      deriveTitleFromDomain(metadata.url);
  }
  metadata.title ??= metadata.ogTitle;

  // Description fallback: og:description -> twitter:description -> meta desc -> JSON-LD -> first body chunk
  if (!metadata.ogDescription) {
    metadata.ogDescription =
      metadata.twitterDescription ??
      metadata.description ??
      jsonLd?.description ??
      firstSentenceFromBody(metadata.bodyText);
  }
  metadata.description ??= metadata.ogDescription;

  // Image fallback: og:image -> twitter:image -> JSON-LD image
  metadata.ogImage ??= metadata.twitterImage ?? jsonLd?.image ?? null;

  // Author fallback
  metadata.author ??= jsonLd?.author ?? null;

  // Published/modified time fallback from JSON-LD
  metadata.publishedTime ??= jsonLd?.datePublished ?? null;
  metadata.modifiedTime ??= jsonLd?.dateModified ?? null;

  // Favicon default
  if (!metadata.favicon) {
    try {
      metadata.favicon = `${new URL(metadata.url).origin}/favicon.ico`;
    } catch {
      // ignore
    }
  }

  return metadata;
}

function deriveTitleFromDomain(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    if (parts.length === 0) return null;
    const base = parts[0]!;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return null;
  }
}

function firstSentenceFromBody(bodyText: string | null): string | null {
  if (!bodyText) return null;
  const sentence = bodyText.split(/(?<=[.!?])\s/)[0]?.trim();
  if (!sentence) return null;
  return sentence.length > 240 ? `${sentence.slice(0, 239)}…` : sentence;
}

/** Fetches oEmbed JSON if discovered. Best-effort: returns null on any failure. */
export async function fetchOEmbed(href: string): Promise<OEmbedData | null> {
  try {
    const res = await fetch(href, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return {
      title: str(data.title),
      description: str(data.description),
      thumbnailUrl: str(data.thumbnail_url),
      authorName: str(data.author_name),
      providerName: str(data.provider_name),
    };
  } catch (error) {
    logger.debug(
      { href, error: error instanceof Error ? error.message : String(error) },
      "oEmbed fetch failed",
    );
    return null;
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Folds oEmbed data into metadata, only for fields that are still empty. */
export function applyOEmbed(metadata: UrlMetadata, oembed: OEmbedData | null): void {
  if (!oembed) return;
  metadata.oEmbed = oembed;
  metadata.ogTitle ??= oembed.title ?? null;
  metadata.title ??= oembed.title ?? null;
  metadata.ogDescription ??= oembed.description ?? null;
  metadata.description ??= oembed.description ?? null;
  metadata.ogImage ??= oembed.thumbnailUrl ?? null;
  metadata.author ??= oembed.authorName ?? null;
  metadata.siteName ??= oembed.providerName ?? null;
}
