import { OG_DIMENSIONS, type ImageDimensions, type ImageKind } from "@ogstack/shared/constants";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors/http.error";
import { logger } from "@/common/logger";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { getTemplate, hasTemplate, listTemplates } from "./template.registry";
import type { FontFamily, RenderOptions, TemplateInfo, TemplateSlug } from "./template.schema";
import { safeFetchImageDataUrl } from "./template.utils";
import type { TemplateProps } from "./templates/types";
import { scaleTokens } from "./templates/utils";

const DEFAULT_ACCENT = "#3B82F6";
const DEFAULT_LOGO_POSITION = "top-left" as const;

/** Serif display family always registered so any template can opt into `fontFamily: "Instrument Serif"`. */
const DISPLAY_SERIF_FAMILY = "Instrument Serif";
/** Mono family always registered so templates can use monospace accents. */
const ACCENT_MONO_FAMILY = "JetBrains Mono";

type FontWeight = 400 | 500 | 700 | 800;

interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
}

interface FontRequest {
  family: string;
  weight: FontWeight;
  style?: "normal" | "italic";
}

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  inter: "Inter",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  "space-grotesk": "Space Grotesk",
  "jetbrains-mono": "JetBrains Mono",
  "noto-sans": "Noto Sans",
  "instrument-serif": "Instrument Serif",
};

@singleton()
export class TemplateService {
  private readonly fontCache = new Map<string, ArrayBuffer[]>();

  list(): TemplateInfo[] {
    return listTemplates();
  }

  async render(
    slug: string,
    metadata: UrlMetadata,
    options: RenderOptions = {},
    dimensions: ImageDimensions = OG_DIMENSIONS,
    kind: ImageKind = "og",
  ): Promise<Buffer> {
    const template = this.resolveRenderer(slug);
    const fontFamily = options.font ?? "inter";
    const [fonts, ogImageDataUrl, logoDataUrl] = await Promise.all([
      this.loadFonts(fontFamily),
      safeFetchImageDataUrl(metadata.ogImage),
      safeFetchImageDataUrl(options.logoUrl),
    ]);

    const props: TemplateProps = {
      metadata: { ...metadata, ogImage: ogImageDataUrl },
      accent: options.accent ?? DEFAULT_ACCENT,
      dark: options.dark ?? true,
      logoUrl: logoDataUrl ?? undefined,
      logoPosition: options.logoPosition ?? DEFAULT_LOGO_POSITION,
      kind,
      dimensions,
      scale: scaleTokens(dimensions),
    };

    const element = template.render(props);

    const svg = await satori(element, {
      width: dimensions.width,
      height: dimensions.height,
      fonts,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: dimensions.width },
    });

    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
  }

  private resolveRenderer(slug: string): { render: (props: TemplateProps) => React.ReactNode } {
    if (!hasTemplate(slug)) {
      throw new NotFoundError(`Template "${slug}" not found`);
    }
    return getTemplate(slug as TemplateSlug);
  }

  /**
   * Loads the requested primary family in 4 weights and always registers the
   * display-serif and mono families so any template can reference them inline.
   */
  private async loadFonts(family: FontFamily): Promise<FontData[]> {
    const primaryName = FONT_FAMILY_MAP[family];
    const requests: FontRequest[] = [
      { family: primaryName, weight: 400 },
      { family: primaryName, weight: 500 },
      { family: primaryName, weight: 700 },
      { family: primaryName, weight: 800 },
    ];

    if (primaryName !== DISPLAY_SERIF_FAMILY) {
      requests.push({ family: DISPLAY_SERIF_FAMILY, weight: 400 });
      requests.push({ family: DISPLAY_SERIF_FAMILY, weight: 400, style: "italic" });
    }
    if (primaryName !== ACCENT_MONO_FAMILY) {
      requests.push({ family: ACCENT_MONO_FAMILY, weight: 400 });
      requests.push({ family: ACCENT_MONO_FAMILY, weight: 500 });
    }

    const loaded = await Promise.all(
      requests.map(async (req) => {
        try {
          const files = await this.fetchFont(req.family, req.weight, req.style ?? "normal");
          return files.map(
            (data): FontData => ({
              name: req.family,
              data,
              weight: req.weight,
              style: req.style ?? "normal",
            }),
          );
        } catch (error) {
          logger.warn(
            { family: req.family, weight: req.weight, err: (error as Error).message },
            "Skipping font weight",
          );
          return null;
        }
      }),
    );

    return loaded.filter((f): f is FontData[] => f !== null).flat();
  }

  /** Returns every subset WOFF Google serves for the weight (latin, cyrillic, greek, …). */
  private async fetchFont(
    family: string,
    weight: FontWeight,
    style: "normal" | "italic",
  ): Promise<ArrayBuffer[]> {
    const cacheKey = `${family}-${weight}-${style}`;
    const cached = this.fontCache.get(cacheKey);
    if (cached) return cached;

    const italicAxis = style === "italic" ? "ital,wght@1," : "wght@";
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${italicAxis}${weight}&display=swap`;

    const cssResponse = await fetch(url, {
      // FF38 is pre-WOFF2, so Google serves WOFF (Satori can't parse WOFF2).
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0",
      },
    });

    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch font CSS for ${family} ${weight} ${style}`);
    }

    const css = await cssResponse.text();
    const urls = Array.from(css.matchAll(/src:\s*url\(([^)]+)\)/g), (m) => m[1]!);
    if (urls.length === 0) {
      throw new Error(`Could not parse font URLs from CSS for ${family}`);
    }

    const files = await Promise.all(
      urls.map(async (fontUrl) => {
        const response = await fetch(fontUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch font file ${fontUrl}`);
        }
        return response.arrayBuffer();
      }),
    );

    this.fontCache.set(cacheKey, files);
    return files;
  }
}
