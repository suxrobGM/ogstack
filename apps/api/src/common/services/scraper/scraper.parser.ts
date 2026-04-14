import { decodeHtmlEntities } from "@/common/utils/html-entities";
import { createEmptyMetadata, type JsonLdEntity, type UrlMetadata } from "./scraper.types";

const BODY_TEXT_LIMIT = 4000;
const H2_LIMIT = 6;
const TAG_LIMIT = 20;
const THIN_HTML_THRESHOLD = 200;

interface OEmbedLink {
  href: string;
  type: "json" | "xml";
}

export interface ParseResult {
  metadata: UrlMetadata;
  oEmbedLinks: OEmbedLink[];
}

function resolveRelative(href: string | null, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function pushUnique(arr: string[], value: string, limit: number): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  if (arr.includes(trimmed)) return;
  if (arr.length >= limit) return;
  arr.push(trimmed);
}

/** Streams the HTML through Cloudflare's HTMLRewriter, collecting every tag
 *  group we care about in a single pass. Returns metadata + a list of oEmbed
 *  discovery links so the caller can fetch them lazily. */
export async function parseHtml(url: string, html: string): Promise<ParseResult> {
  const metadata = createEmptyMetadata(url);
  const oEmbedLinks: OEmbedLink[] = [];
  const jsonLdBlocks: string[] = [];
  const bodyTextParts: string[] = [];
  let totalBodyTextLen = 0;

  let titleText = "";
  let capturingTitle = false;
  let h1Text = "";
  let capturingH1 = false;
  let currentH2 = "";
  let capturingH2 = false;
  let currentJsonLd = "";
  let capturingJsonLd = false;

  let skipTextDepth = 0;
  const blockedText = new Set([
    "script",
    "style",
    "noscript",
    "nav",
    "footer",
    "aside",
    "header",
    "svg",
    "iframe",
    "template",
  ]);

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(el) {
        const lang = el.getAttribute("lang");
        if (lang?.trim()) metadata.lang = lang.trim();
      },
    })
    .on("title", {
      element() {
        capturingTitle = true;
      },
      text(text) {
        if (capturingTitle) {
          titleText += text.text;
          if (text.lastInTextNode) capturingTitle = false;
        }
      },
    })
    .on("meta", {
      element(el) {
        const property = el.getAttribute("property")?.toLowerCase();
        const name = el.getAttribute("name")?.toLowerCase();
        const content = el.getAttribute("content");
        if (!content?.trim()) return;
        const value = content.trim();
        const decoded = decodeHtmlEntities(value);

        if (property === "og:title") metadata.ogTitle ??= decoded;
        else if (property === "og:description") metadata.ogDescription ??= decoded;
        else if (property === "og:image" || property === "og:image:url") metadata.ogImage ??= value;
        else if (property === "og:site_name") metadata.ogSiteName ??= decoded;
        else if (property === "og:locale") metadata.locale ??= decoded;
        else if (property === "article:published_time") metadata.publishedTime ??= decoded;
        else if (property === "article:modified_time") metadata.modifiedTime ??= decoded;
        else if (property === "article:section") metadata.section ??= decoded;
        else if (property === "article:tag") pushUnique(metadata.tags, decoded, TAG_LIMIT);

        if (name === "description") metadata.description ??= decoded;
        else if (name === "author") metadata.author ??= decoded;
        else if (name === "theme-color") metadata.themeColor ??= decoded;
        else if (name === "twitter:card") metadata.twitterCard ??= decoded;
        else if (name === "twitter:title") metadata.twitterTitle ??= decoded;
        else if (name === "twitter:description") metadata.twitterDescription ??= decoded;
        else if (name === "twitter:image" || name === "twitter:image:src")
          metadata.twitterImage ??= value;
        else if (name === "keywords") {
          for (const tag of decoded.split(",")) pushUnique(metadata.tags, tag, TAG_LIMIT);
        }
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        const href = el.getAttribute("href");
        if (href?.trim()) metadata.canonicalUrl = resolveRelative(href.trim(), url);
      },
    })
    .on('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', {
      element(el) {
        const href = el.getAttribute("href");
        if (href?.trim() && !metadata.favicon) {
          metadata.favicon = resolveRelative(href.trim(), url);
        }
      },
    })
    .on('link[rel="alternate"]', {
      element(el) {
        const type = el.getAttribute("type")?.toLowerCase();
        const href = el.getAttribute("href");
        if (!href?.trim()) return;
        if (type === "application/json+oembed") {
          oEmbedLinks.push({ href: resolveRelative(href, url) ?? href, type: "json" });
        } else if (type === "text/xml+oembed" || type === "application/xml+oembed") {
          oEmbedLinks.push({ href: resolveRelative(href, url) ?? href, type: "xml" });
        }
      },
    })
    .on("h1", {
      element() {
        if (!metadata.h1) capturingH1 = true;
      },
      text(text) {
        if (capturingH1) {
          h1Text += text.text;
          if (text.lastInTextNode) {
            metadata.h1 = decodeHtmlEntities(h1Text.trim()) || null;
            h1Text = "";
            capturingH1 = false;
          }
        }
      },
    })
    .on("h2", {
      element() {
        capturingH2 = true;
        currentH2 = "";
      },
      text(text) {
        if (capturingH2) {
          currentH2 += text.text;
          if (text.lastInTextNode) {
            const clean = decodeHtmlEntities(currentH2.trim());
            if (clean) pushUnique(metadata.h2s, clean, H2_LIMIT);
            capturingH2 = false;
          }
        }
      },
    })
    .on('script[type="application/ld+json"]', {
      element() {
        capturingJsonLd = true;
        currentJsonLd = "";
      },
      text(text) {
        if (capturingJsonLd) {
          currentJsonLd += text.text;
          if (text.lastInTextNode) {
            if (currentJsonLd.trim()) jsonLdBlocks.push(currentJsonLd);
            capturingJsonLd = false;
          }
        }
      },
    })
    // Body text capture — skip anything inside blocked tags (scripts, nav, etc.)
    .on("*", {
      element(el) {
        const tag = el.tagName.toLowerCase();
        if (blockedText.has(tag)) {
          skipTextDepth += 1;
          el.onEndTag(() => {
            skipTextDepth -= 1;
          });
        }
      },
    })
    // Match any element so we pick up text from custom elements too (Angular
    // `<app-*>`, Web Components, Lit, etc.). The `skipTextDepth` guard above
    // keeps script/style/nav/etc. out.
    .on("*", {
      text(text) {
        if (skipTextDepth > 0) return;
        if (totalBodyTextLen >= BODY_TEXT_LIMIT) return;
        const raw = text.text;
        if (!raw.trim()) return;
        const remaining = BODY_TEXT_LIMIT - totalBodyTextLen;
        const slice = raw.length > remaining ? raw.slice(0, remaining) : raw;
        bodyTextParts.push(slice);
        totalBodyTextLen += slice.length;
      },
    });

  const transformed = rewriter.transform(new Response(html));
  await transformed.text();

  if (titleText.trim()) metadata.title = decodeHtmlEntities(titleText.trim());

  metadata.jsonLd = parseJsonLdBlocks(jsonLdBlocks);

  if (metadata.ogImage) metadata.ogImage = resolveRelative(metadata.ogImage, url);
  if (metadata.twitterImage) metadata.twitterImage = resolveRelative(metadata.twitterImage, url);
  if (metadata.favicon) metadata.favicon = resolveRelative(metadata.favicon, url);

  metadata.siteName = metadata.ogSiteName;
  const bodyText = compactWhitespace(bodyTextParts.join(" "));
  metadata.bodyText = bodyText || null;
  metadata.isThinHtml = detectThinHtml(bodyText, html);

  return { metadata, oEmbedLinks };
}

function compactWhitespace(text: string): string {
  return decodeHtmlEntities(text.replace(/\s+/g, " ").trim());
}

function detectThinHtml(bodyText: string, html: string): boolean {
  if (bodyText.length < THIN_HTML_THRESHOLD) return true;
  // Only use hard SPA-shell markers. <noscript> hints are too noisy — modern SSR
  // stacks (Angular, Next, Nuxt, SvelteKit) still emit them as a safety net.
  const markers = [
    /<div[^>]+id=["']root["']/i,
    /<div[^>]+id=["']__next["']/i,
    /<div[^>]+id=["']app["']/i,
  ];
  if (markers.some((rx) => rx.test(html))) {
    // SPA shell markers + short body => thin. If body is long, SSR likely filled
    // the shell, so we don't flag.
    return bodyText.length < THIN_HTML_THRESHOLD * 2;
  }
  return false;
}

function parseJsonLdBlocks(blocks: string[]): JsonLdEntity[] {
  const out: JsonLdEntity[] = [];
  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw.trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const entity = toJsonLdEntity(item);
        if (entity) out.push(entity);
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }
  return out;
}

function toJsonLdEntity(value: unknown): JsonLdEntity | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const type = toStr(raw["@type"]) ?? "Thing";
  const image = raw.image;
  const imageStr =
    typeof image === "string"
      ? image
      : Array.isArray(image) && typeof image[0] === "string"
        ? image[0]
        : typeof image === "object" && image !== null && "url" in image
          ? toStr((image as Record<string, unknown>).url)
          : undefined;
  const author = raw.author;
  const authorStr =
    typeof author === "string"
      ? author
      : typeof author === "object" && author !== null && "name" in author
        ? toStr((author as Record<string, unknown>).name)
        : undefined;
  return {
    type,
    headline: toStr(raw.headline),
    name: toStr(raw.name),
    description: toStr(raw.description),
    image: imageStr,
    author: authorStr,
    datePublished: toStr(raw.datePublished),
    dateModified: toStr(raw.dateModified),
    raw,
  };
}

function toStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}
