import type { UrlMetadata } from "@/common/services/scraper";
import type { PageAnalysisMetadata } from "./page-analysis.types";

export function toPublicMetadata(metadata: UrlMetadata): PageAnalysisMetadata {
  return {
    url: metadata.url,
    title: metadata.ogTitle ?? metadata.title,
    description: metadata.ogDescription ?? metadata.description,
    image: metadata.ogImage ?? metadata.twitterImage,
    siteName: metadata.siteName,
    favicon: metadata.favicon,
    author: metadata.author,
    canonicalUrl: metadata.canonicalUrl,
    lang: metadata.lang,
    publishedTime: metadata.publishedTime,
    modifiedTime: metadata.modifiedTime,
    tags: metadata.tags,
    isThinHtml: metadata.isThinHtml,
    renderedWithJs: metadata.renderedWithJs,
  };
}
