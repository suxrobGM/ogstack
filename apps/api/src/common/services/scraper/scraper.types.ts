export interface UrlMetadata {
  url: string;

  title: string | null;
  description: string | null;

  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogImageWidth: number | null;
  ogImageHeight: number | null;
  ogType: string | null;
  ogUrl: string | null;
  ogSiteName: string | null;

  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  twitterCard: string | null;

  favicon: string | null;
  author: string | null;
  siteName: string | null;

  canonicalUrl: string | null;
  lang: string | null;
  locale: string | null;
  themeColor: string | null;
  robots: string | null;

  publishedTime: string | null;
  modifiedTime: string | null;
  section: string | null;
  tags: string[];

  h1: string | null;
  h2s: string[];
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;

  hasViewport: boolean;
  hasCharset: boolean;
  hreflangVariants: string[];

  jsonLd: JsonLdEntity[];
  oEmbed: OEmbedData | null;

  bodyText: string | null;
  isThinHtml: boolean;
  renderedWithJs: boolean;
}

export interface JsonLdEntity {
  type: string;
  headline?: string;
  name?: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  raw: Record<string, unknown>;
}

export interface OEmbedData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  authorName?: string;
  providerName?: string;
}

export interface ScrapeResult {
  url: string;
  html: string;
  metadata: UrlMetadata;
}

export interface FetchedHtml {
  url: string;
  html: string;
  contentType: string | null;
}

export function createEmptyMetadata(url: string): UrlMetadata {
  return {
    url,
    title: null,
    description: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogImageWidth: null,
    ogImageHeight: null,
    ogType: null,
    ogUrl: null,
    ogSiteName: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    twitterCard: null,
    favicon: null,
    author: null,
    siteName: null,
    canonicalUrl: null,
    lang: null,
    locale: null,
    themeColor: null,
    robots: null,
    publishedTime: null,
    modifiedTime: null,
    section: null,
    tags: [],
    h1: null,
    h2s: [],
    h1Count: 0,
    imageCount: 0,
    imagesMissingAlt: 0,
    hasViewport: false,
    hasCharset: false,
    hreflangVariants: [],
    jsonLd: [],
    oEmbed: null,
    bodyText: null,
    isThinHtml: false,
    renderedWithJs: false,
  };
}
