import { decodeHtmlEntities } from "@/common/utils/html-entities";

export interface AuditMetadata {
  url: string;
  isHttps: boolean;

  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  hasViewport: boolean;
  hasCharset: boolean;
  favicon: string | null;

  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasStructuredData: boolean;
  hasHreflang: boolean;

  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string | null;
  ogUrl: string | null;
  ogSiteName: string | null;

  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;

  ogImageWidth: number | null;
  ogImageHeight: number | null;
  ogImageBytes: number | null;
}

function resolveRelative(href: string | null, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export async function extractAuditMetadata(url: string, html: string): Promise<AuditMetadata> {
  const meta: AuditMetadata = {
    url,
    isHttps: url.startsWith("https://"),
    title: null,
    titleLength: 0,
    description: null,
    descriptionLength: 0,
    canonical: null,
    robots: null,
    lang: null,
    hasViewport: false,
    hasCharset: false,
    favicon: null,
    h1Count: 0,
    imageCount: 0,
    imagesMissingAlt: 0,
    hasStructuredData: false,
    hasHreflang: false,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogType: null,
    ogUrl: null,
    ogSiteName: null,
    twitterCard: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    ogImageWidth: null,
    ogImageHeight: null,
    ogImageBytes: null,
  };

  let titleText = "";
  let capturingTitle = false;

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(el) {
        const lang = el.getAttribute("lang");
        if (lang?.trim()) meta.lang = lang.trim();
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
        const property = el.getAttribute("property");
        const name = el.getAttribute("name")?.toLowerCase();
        const content = el.getAttribute("content");
        const charset = el.getAttribute("charset");

        if (charset) meta.hasCharset = true;

        if (!content?.trim()) return;
        const value = content.trim();
        const decoded = decodeHtmlEntities(value);

        if (property === "og:title") meta.ogTitle ??= decoded;
        else if (property === "og:description") meta.ogDescription ??= decoded;
        else if (property === "og:image") meta.ogImage ??= value;
        else if (property === "og:image:width") meta.ogImageWidth ??= parseInt(value, 10) || null;
        else if (property === "og:image:height") meta.ogImageHeight ??= parseInt(value, 10) || null;
        else if (property === "og:type") meta.ogType ??= decoded;
        else if (property === "og:url") meta.ogUrl ??= value;
        else if (property === "og:site_name") meta.ogSiteName ??= decoded;

        if (name === "description") {
          meta.description ??= decoded;
          meta.descriptionLength = decoded.length;
        } else if (name === "viewport") {
          meta.hasViewport = true;
        } else if (name === "robots") {
          meta.robots ??= decoded;
        } else if (name === "twitter:card") {
          meta.twitterCard ??= decoded;
        } else if (name === "twitter:title") {
          meta.twitterTitle ??= decoded;
        } else if (name === "twitter:description") {
          meta.twitterDescription ??= decoded;
        } else if (name === "twitter:image") {
          meta.twitterImage ??= value;
        }
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        const href = el.getAttribute("href");
        if (href?.trim()) meta.canonical = resolveRelative(href.trim(), url);
      },
    })
    .on('link[rel="alternate"][hreflang]', {
      element() {
        meta.hasHreflang = true;
      },
    })
    .on('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', {
      element(el) {
        const href = el.getAttribute("href");
        if (href?.trim() && !meta.favicon) {
          meta.favicon = resolveRelative(href.trim(), url);
        }
      },
    })
    .on("h1", {
      element() {
        meta.h1Count += 1;
      },
    })
    .on("img", {
      element(el) {
        meta.imageCount += 1;
        const alt = el.getAttribute("alt");
        if (alt === null || !alt.trim()) meta.imagesMissingAlt += 1;
      },
    })
    .on('script[type="application/ld+json"]', {
      element() {
        meta.hasStructuredData = true;
      },
    });

  const transformed = rewriter.transform(new Response(html));
  await transformed.text();

  if (titleText.trim()) {
    meta.title = decodeHtmlEntities(titleText.trim());
    meta.titleLength = meta.title.length;
  }

  if (meta.ogImage) {
    meta.ogImage = resolveRelative(meta.ogImage, url) ?? meta.ogImage;
  }
  if (meta.twitterImage) {
    meta.twitterImage = resolveRelative(meta.twitterImage, url) ?? meta.twitterImage;
  }
  if (!meta.favicon) {
    try {
      meta.favicon = `${new URL(url).origin}/favicon.ico`;
    } catch {
      // ignore
    }
  }

  return meta;
}

/**
 * HEAD the OG image to get its byte size. Best-effort — failures return null.
 */
export async function probeOgImage(imageUrl: string): Promise<{ bytes: number | null }> {
  try {
    const res = await fetch(imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { bytes: null };
    const len = res.headers.get("content-length");
    return { bytes: len ? parseInt(len, 10) : null };
  } catch {
    return { bytes: null };
  }
}
