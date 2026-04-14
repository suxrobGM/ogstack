import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import { validateUrlForFetch } from "@/common/utils/url";
import { RenderProviderService } from "./render-providers";
import { applyMetadataFallbacks, applyOEmbed, fetchOEmbed } from "./scraper.fallbacks";
import { parseHtml } from "./scraper.parser";
import type { FetchedHtml, UrlMetadata } from "./scraper.types";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_REDIRECTS = 5;

export interface ExtractOptions {
  /** When true and the page is thin, try headless render if a provider is
   *  configured. Callers gated to Pro+ should set this to true. */
  allowHeadless?: boolean;
}

@singleton()
export class ScraperService {
  constructor(private readonly render: RenderProviderService) {}

  async extractMetadata(rawUrl: string, options: ExtractOptions = {}): Promise<UrlMetadata> {
    const { url, html } = await this.fetchValidatedHtml(rawUrl);
    return this.parseMetadata(url, html, options);
  }

  async fetchValidatedHtml(rawUrl: string): Promise<FetchedHtml> {
    const url = await validateUrlForFetch(rawUrl);
    const { html, contentType } = await this.fetchHtml(url.toString());
    return { url: url.toString(), html, contentType };
  }

  async parseMetadata(
    url: string,
    html: string,
    options: ExtractOptions = {},
  ): Promise<UrlMetadata> {
    try {
      const { metadata, oEmbedLinks } = await parseHtml(url, html);

      if (oEmbedLinks.length > 0) {
        const jsonLink = oEmbedLinks.find((l) => l.type === "json");
        if (jsonLink) {
          const oembed = await fetchOEmbed(jsonLink.href);
          applyOEmbed(metadata, oembed);
        }
      }

      if (metadata.isThinHtml && options.allowHeadless && this.render.isEnabled()) {
        const rendered = await this.render.render(url);
        if (rendered) {
          const { metadata: secondPass } = await parseHtml(url, rendered);
          secondPass.renderedWithJs = true;
          return applyMetadataFallbacks(secondPass);
        }
      }

      return applyMetadataFallbacks(metadata);
    } catch (error) {
      logger.warn({ url, error }, "Failed to parse HTML");
      const { metadata } = await parseHtml(url, "");
      return applyMetadataFallbacks(metadata);
    }
  }

  async fetchHtml(url: string): Promise<{ html: string; contentType: string | null }> {
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

      return { html: body, contentType };
    }

    throw new BadRequestError("That URL redirects too many times.");
  }
}
