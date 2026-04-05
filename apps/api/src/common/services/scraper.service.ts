import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors/http.error";
import { logger } from "@/common/logger";
import { validateUrlForFetch } from "@/common/utils/url";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_REDIRECTS = 5;

export interface UrlMetadata {
  url: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  favicon: string | null;
  author: string | null;
  siteName: string | null;
}

@singleton()
export class ScraperService {
  async extractMetadata(rawUrl: string): Promise<UrlMetadata> {
    const url = await validateUrlForFetch(rawUrl);
    const html = await this.fetchHtml(url.toString());
    return this.parseMetadata(url.toString(), html);
  }

  private async fetchHtml(url: string): Promise<string> {
    let currentUrl = url;

    for (let i = 0; i < MAX_REDIRECTS; i++) {
      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "OGStackBot/1.0 (+https://ogstack.dev)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new BadRequestError("Redirect without Location header");

        const redirectUrl = new URL(location, currentUrl);
        await validateUrlForFetch(redirectUrl.toString());
        currentUrl = redirectUrl.toString();
        continue;
      }

      if (!response.ok) {
        throw new BadRequestError(`Failed to fetch URL: HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new BadRequestError("URL does not return HTML content");
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        throw new BadRequestError("Response body too large");
      }

      const body = await response.text();
      if (body.length > MAX_BODY_SIZE) {
        throw new BadRequestError("Response body too large");
      }

      return body;
    }

    throw new BadRequestError("Too many redirects");
  }

  async parseMetadata(url: string, html: string): Promise<UrlMetadata> {
    const metadata: UrlMetadata = {
      url,
      title: null,
      description: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      favicon: null,
      author: null,
      siteName: null,
    };

    let titleText = "";
    let capturingTitle = false;

    try {
      const rewriter = new HTMLRewriter()
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
            const name = el.getAttribute("name");
            const content = el.getAttribute("content");
            if (!content?.trim()) return;
            const value = content.trim();

            if (property === "og:title") metadata.ogTitle ??= value;
            else if (property === "og:description") metadata.ogDescription ??= value;
            else if (property === "og:image") metadata.ogImage ??= value;
            else if (property === "og:site_name") metadata.siteName ??= value;

            const nameLower = name?.toLowerCase();
            if (nameLower === "description") metadata.description ??= value;
            else if (nameLower === "author") metadata.author ??= value;
          },
        })
        .on('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', {
          element(el) {
            const href = el.getAttribute("href");
            if (href?.trim() && !metadata.favicon) {
              metadata.favicon = href.trim();
            }
          },
        });

      const transformed = rewriter.transform(new Response(html));
      await transformed.text();
    } catch (error) {
      logger.warn({ url, error }, "Failed to parse HTML");
      return metadata;
    }

    if (titleText.trim()) metadata.title = titleText.trim();

    if (metadata.ogImage) metadata.ogImage = this.resolveUrl(metadata.ogImage, url);
    if (metadata.favicon) {
      metadata.favicon = this.resolveUrl(metadata.favicon, url);
    } else {
      try {
        metadata.favicon = `${new URL(url).origin}/favicon.ico`;
      } catch {
        // ignore
      }
    }

    return metadata;
  }

  private resolveUrl(url: string | null, base: string): string | null {
    if (!url) return null;
    try {
      return new URL(url, base).toString();
    } catch {
      return null;
    }
  }
}
