import type { ImageKind } from "@ogstack/shared";

/**
 * Auto-prepend `https://` to a URL input once the user has typed something
 * that looks like a host (contains a dot) and hasn't already supplied a scheme.
 *
 * Used by both the dashboard playground (via TanStack Form's `transform` prop)
 * and the landing playground (via a plain `onChange` handler) so URL inputs
 * behave identically across the app.
 */
export function normalizeUrlInput(value: string): string {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!value.includes(".")) return value;
  return `https://${value}`;
}

/**
 * Path to a template's preview thumbnail. Templates are rendered at both OG
 * (1200×630) and hero (16:9) aspect ratios, so callers pass the kind whose
 * preview they want to display.
 */
export function templateThumbnailUrl(slug: string, kind: ImageKind = "og"): string {
  const kindSuffix = kind === "blog_hero" ? "hero" : "og";
  return `/images/templates/${slug.replace(/_/g, "-")}-${kindSuffix}.webp`;
}
