import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import { decodeHtmlEntities } from "@/common/utils/html-entities";
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
      let response: Response;
      try {
        response = await fetch(currentUrl, {
          headers: {
            "User-Agent": "OGStackBot/1.0 (+https://ogstack.dev)",
            Accept: "text/html,application/xhtml+xml",
          },
          redirect: "manual",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
      } catch {
        throw new BadRequestError("We couldn't reach that URL. Make sure it's public and online.");
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new BadRequestError("That URL returned a broken redirect (no Location header).");
        }

        const redirectUrl = new URL(location, currentUrl);
        await validateUrlForFetch(redirectUrl.toString());
        currentUrl = redirectUrl.toString();
        continue;
      }

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new BadRequestError(
            "We couldn't find that page (404). Check the URL and try again.",
          );
        }
        if (status === 401 || status === 403) {
          throw new BadRequestError(
            "That page requires authentication and isn't publicly accessible.",
          );
        }
        if (status >= 500) {
          throw new BadRequestError(
            `The target site returned an error (HTTP ${status}). Try again later.`,
          );
        }
        throw new BadRequestError(`The target site returned HTTP ${status}.`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new BadRequestError(
          "That URL doesn't return an HTML page — we can only preview web pages.",
        );
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        throw new BadRequestError("That page is too large to preview (over 2 MB).");
      }

      const body = await response.text();
      if (body.length > MAX_BODY_SIZE) {
        throw new BadRequestError("That page is too large to preview (over 2 MB).");
      }

      return body;
    }

    throw new BadRequestError("That URL redirects too many times.");
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

            const decoded = decodeHtmlEntities(value);

            if (property === "og:title") metadata.ogTitle ??= decoded;
            else if (property === "og:description") metadata.ogDescription ??= decoded;
            else if (property === "og:image") metadata.ogImage ??= value;
            else if (property === "og:site_name") metadata.siteName ??= decoded;

            const nameLower = name?.toLowerCase();
            if (nameLower === "description") metadata.description ??= decoded;
            else if (nameLower === "author") metadata.author ??= decoded;
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

    if (titleText.trim()) metadata.title = decodeHtmlEntities(titleText.trim());

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
