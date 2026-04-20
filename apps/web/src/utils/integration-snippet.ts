import type { ImageKind } from "@ogstack/shared/constants";
import { API_BASE_URL } from "@/lib/constants";
import type { GenerateDto, ImageItem } from "@/types/api";

type Asset = { name: string; url: string };

/** Copy-paste integration output shown in both the playground and image-detail. */
export interface IntegrationSnippet {
  code: string;
  language: "html" | "url";
  /** Short label used for the section/tab heading. */
  label: string;
  description?: string;
}

const FAVICON_TAG_ORDER = [
  "favicon.ico",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "site.webmanifest",
];

function serializeOgQuery(params: Record<string, string>): string {
  return new URLSearchParams(params)
    .toString()
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%40/g, "@")
    .replace(/%2B/g, "+")
    .replace(/%2C/g, ",");
}

function pickAssets(assets: readonly Asset[] | null | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!assets) {
    return map;
  }

  for (const asset of assets) {
    if (asset.url) map.set(asset.name, asset.url);
  }
  return map;
}

/** OG image URL — `${API_BASE_URL}/api/og/:publicId`. Used for copy-paste snippets and internal previews alike. */
export function buildOgImageUrl(publicId: string, params: Record<string, string>): string {
  return `${API_BASE_URL}/api/og/${publicId}?${serializeOgQuery(params)}`;
}

/** `<meta property="og:image" …>` tag for the given project + query params. */
export function buildOgMetaTag(publicId: string, params: Record<string, string>): string {
  return `<meta property="og:image" content="${buildOgImageUrl(publicId, params)}" />`;
}

export function buildFaviconTags(assets: readonly Asset[] | null | undefined): string {
  const byName = pickAssets(assets);
  const lines: string[] = [];

  for (const name of FAVICON_TAG_ORDER) {
    const url = byName.get(name);
    if (!url) continue;
    switch (name) {
      case "favicon.ico":
        lines.push(`<link rel="icon" href="${url}" sizes="any" />`);
        break;
      case "favicon-16.png":
        lines.push(`<link rel="icon" type="image/png" sizes="16x16" href="${url}" />`);
        break;
      case "favicon-32.png":
        lines.push(`<link rel="icon" type="image/png" sizes="32x32" href="${url}" />`);
        break;
      case "apple-touch-icon.png":
        lines.push(`<link rel="apple-touch-icon" sizes="180x180" href="${url}" />`);
        break;
      case "icon-192.png":
        lines.push(`<link rel="icon" type="image/png" sizes="192x192" href="${url}" />`);
        break;
      case "icon-512.png":
        lines.push(`<link rel="icon" type="image/png" sizes="512x512" href="${url}" />`);
        break;
      case "site.webmanifest":
        lines.push(`<link rel="manifest" href="${url}" />`);
        break;
    }
  }
  return lines.join("\n");
}

/**
 * Playground output: uses the current form values + project public ID so the
 * OG snippet reflects unsaved style changes.
 */
export function buildPlaygroundSnippet(params: {
  kind: ImageKind;
  result: GenerateDto;
  publicProjectId: string | null;
  ogParams: Record<string, string>;
}): IntegrationSnippet | null {
  const { kind, result, publicProjectId, ogParams } = params;
  if (kind === "og") {
    if (!publicProjectId) return null;
    return { code: buildOgMetaTag(publicProjectId, ogParams), language: "html", label: "Meta Tag" };
  }

  if (kind === "blog_hero") {
    return { code: result.imageUrl, language: "url", label: "Image URL" };
  }

  // icon_set
  const code = buildFaviconTags(result.assets);
  return code ? { code, language: "html", label: "Meta Tags" } : null;
}

/**
 * Image-detail output: reads from the persisted row. Mirrors playground, but
 * uses the stored template/AI settings to rebuild the OG params.
 */
export function buildImageSnippet(image: ImageItem): IntegrationSnippet | null {
  if (image.kind === "og") {
    if (!image.publicProjectId) {
      return null;
    }

    const sourceUrl = image.sourceUrl ?? "https://yoursite.com/page";
    const params: Record<string, string> = { url: sourceUrl };

    if (image.aiModel) {
      params.ai = "true";
    } else if (image.template?.slug) {
      params.template = image.template.slug;
    }

    return {
      code: buildOgMetaTag(image.publicProjectId, params),
      language: "html",
      label: "Meta tag",
    };
  }

  if (image.kind === "blog_hero") {
    const url = image.cdnUrl ?? image.imageUrl;
    return { code: url, language: "url", label: "Image URL" };
  }

  // icon_set
  const code = buildFaviconTags(image.assets);
  return code ? { code, language: "html", label: "Meta tags" } : null;
}
