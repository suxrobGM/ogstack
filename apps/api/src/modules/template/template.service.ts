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
  private readonly fontCache = new Map<string, ArrayBuffer>();

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
          const data = await this.fetchFont(req.family, req.weight, req.style ?? "normal");
          return {
            name: req.family,
            data,
            weight: req.weight,
            style: req.style ?? "normal",
          } as FontData;
        } catch (error) {
          logger.warn(
            { family: req.family, weight: req.weight, err: (error as Error).message },
            "Skipping font weight",
          );
          return null;
        }
      }),
    );

    return loaded.filter((f): f is FontData => f !== null);
  }

  private async fetchFont(
    family: string,
    weight: FontWeight,
    style: "normal" | "italic",
  ): Promise<ArrayBuffer> {
    const cacheKey = `${family}-${weight}-${style}`;
    const cached = this.fontCache.get(cacheKey);
    if (cached) return cached;

    const italicAxis = style === "italic" ? "ital,wght@1," : "wght@";
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${italicAxis}${weight}&display=swap`;

    const cssResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    });

    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch font CSS for ${family} ${weight} ${style}`);
    }

    const css = await cssResponse.text();
    const fontUrlMatch = css.match(/src:\s*url\(([^)]+)\)/);
    if (!fontUrlMatch?.[1]) {
      throw new Error(`Could not parse font URL from CSS for ${family}`);
    }

    const fontResponse = await fetch(fontUrlMatch[1]);
    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file for ${family}`);
    }

    const data = await fontResponse.arrayBuffer();
    this.fontCache.set(cacheKey, data);
    return data;
  }
}
