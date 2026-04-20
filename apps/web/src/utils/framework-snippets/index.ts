import type { ImageKind } from "@ogstack/shared/constants";
import type { GenerateDto, ImageItem } from "@/types/api";
import { buildFaviconTags, buildOgImageUrl } from "../integration-snippet";
import { angularPlugin } from "./angular";
import { astroPlugin } from "./astro";
import { htmlPlugin } from "./html";
import { nextjsPlugin } from "./nextjs";
import { nuxtPlugin } from "./nuxt";
import { reactPlugin } from "./react";
import { remixPlugin } from "./remix";
import { sveltekitPlugin } from "./sveltekit";
import type { FaviconUrls, FrameworkPlugin, FrameworkSnippet } from "./types";
import { vuePlugin } from "./vue";

export type { FrameworkId, FrameworkSnippet } from "./types";
export { buildFaviconTags };

const PLUGINS: readonly FrameworkPlugin[] = [
  htmlPlugin,
  nextjsPlugin,
  nuxtPlugin,
  astroPlugin,
  sveltekitPlugin,
  remixPlugin,
  vuePlugin,
  reactPlugin,
  angularPlugin,
];

type Asset = { name: string; url: string };

function pickFaviconUrls(assets: readonly Asset[] | null | undefined): FaviconUrls {
  const map = new Map<string, string>();
  for (const a of assets ?? []) {
    if (a.url) map.set(a.name, a.url);
  }
  return {
    faviconIco: map.get("favicon.ico"),
    favicon16: map.get("favicon-16.png"),
    favicon32: map.get("favicon-32.png"),
    appleTouchIcon: map.get("apple-touch-icon.png"),
    icon192: map.get("icon-192.png"),
    icon512: map.get("icon-512.png"),
    manifest: map.get("site.webmanifest"),
  };
}

type SnippetParams =
  | { kind: "og"; ogUrl: string }
  | { kind: "icon_set"; assets: readonly Asset[] | null | undefined };

/**
 * Build per-framework integration snippets for an OG image URL or favicon
 * asset bundle. Returns [] when the input is empty (caller handles fallback).
 */
export function buildFrameworkSnippets(params: SnippetParams): FrameworkSnippet[] {
  if (params.kind === "og") {
    return PLUGINS.map((p) => ({
      id: p.id,
      label: p.label,
      language: p.language,
      code: p.buildOg(params.ogUrl),
    }));
  }

  const urls = pickFaviconUrls(params.assets);
  if (!urls.faviconIco && !urls.favicon32 && !urls.icon512) {
    return [];
  }
  return PLUGINS.map((p) => ({
    id: p.id,
    label: p.label,
    language: p.language,
    code: p.buildFavicon(urls),
  }));
}

/**
 * Image-detail variant: pulls publicProjectId, sourceUrl, template/AI from a
 * persisted ImageItem and returns framework snippets. Returns [] for blog_hero.
 */
export function buildImageFrameworkSnippets(image: ImageItem): FrameworkSnippet[] {
  if (image.kind === "og") {
    if (!image.publicProjectId) return [];
    const sourceUrl = image.sourceUrl ?? "https://yoursite.com/page";
    const ogParams: Record<string, string> = { url: sourceUrl };
    if (image.aiModel) {
      ogParams.ai = "true";
    } else if (image.template?.slug) {
      ogParams.template = image.template.slug;
    }
    return buildFrameworkSnippets({
      kind: "og",
      ogUrl: buildOgImageUrl(image.publicProjectId, ogParams),
    });
  }

  if (image.kind === "icon_set") {
    return buildFrameworkSnippets({ kind: "icon_set", assets: image.assets });
  }

  return [];
}

/**
 * Playground variant: builds framework snippets from live form state.
 * Returns [] for blog_hero (a raw URL, not a head-tag).
 */
export function buildPlaygroundFrameworkSnippets(params: {
  kind: ImageKind;
  result: GenerateDto;
  publicProjectId: string | null;
  ogParams: Record<string, string>;
}): FrameworkSnippet[] {
  const { kind, result, publicProjectId, ogParams } = params;

  if (kind === "og") {
    if (!publicProjectId) return [];
    return buildFrameworkSnippets({
      kind: "og",
      ogUrl: buildOgImageUrl(publicProjectId, ogParams),
    });
  }

  if (kind === "icon_set") {
    return buildFrameworkSnippets({ kind: "icon_set", assets: result.assets });
  }

  return [];
}
