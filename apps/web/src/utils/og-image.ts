import type { ImageKind } from "@ogstack/shared/constants";
import { API_BASE_URL } from "@/lib/api/constants";

/**
 * Production CDN host that customers paste into their `<head>`. The dashboard
 * meta-tag output points here regardless of the running API base URL so the
 * snippet is copy-paste ready for real sites.
 */
export const OG_PRODUCTION_HOST = "https://api.ogstack.dev";

/**
 * Path to a template's preview thumbnail. Templates are rendered at both OG
 * (1200×630) and hero (16:9) aspect ratios, so callers pass the kind whose
 * preview they want to display.
 */
export function templateThumbnailUrl(slug: string, kind: ImageKind = "og"): string {
  const kindSuffix = kind === "blog_hero" ? "hero" : "og";
  return `/images/templates/${slug.replace(/_/g, "-")}-${kindSuffix}.webp`;
}

/**
 * Build a full OG image URL for a given public ID and query params, using the production host by default since these are meant to be shared as meta tags. The
 * public ID is the opaque identifier returned from the API after generation, not
 * the user-friendly template slug.
 */
export function buildOgImageUrl(
  publicId: string,
  params: URLSearchParams,
  baseUrl: string = API_BASE_URL,
): string {
  const query = params
    .toString()
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%40/g, "@")
    .replace(/%2B/g, "+")
    .replace(/%2C/g, ",");
  return `${baseUrl}/og/${publicId}?${query}`;
}

/** Wrap a full image URL in a `<meta property="og:image" …>` tag. */
export function buildOgMetaTag(imageUrl: string): string {
  return `<meta property="og:image" content="${imageUrl}" />`;
}
