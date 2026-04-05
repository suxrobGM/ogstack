import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors/http.error";
import { logger } from "@/common/logger";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { getTemplate, hasTemplate, listTemplates } from "./template.registry";
import type { FontFamily, RenderOptions, TemplateInfo, TemplateSlug } from "./template.schema";
import type { TemplateProps } from "./templates/types";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const DEFAULT_ACCENT = "#3B82F6";
const DEFAULT_LOGO_POSITION = "top-left" as const;

interface FontData {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

/** Maps font slug to Google Fonts family name. */
const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  inter: "Inter",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  "space-grotesk": "Space Grotesk",
  "jetbrains-mono": "JetBrains Mono",
  "noto-sans": "Noto Sans",
};

@singleton()
export class TemplateService {
  private readonly fontCache = new Map<string, ArrayBuffer>();

  list(): TemplateInfo[] {
    return listTemplates();
  }

  async render(
    slug: TemplateSlug,
    metadata: UrlMetadata,
    options: RenderOptions = {},
  ): Promise<Buffer> {
    if (!hasTemplate(slug)) {
      throw new NotFoundError(`Template "${slug}" not found`);
    }

    const template = getTemplate(slug);
    const fontFamily = options.font ?? "inter";
    const fonts = await this.loadFonts(fontFamily);

    const props: TemplateProps = {
      metadata,
      accent: options.accent ?? DEFAULT_ACCENT,
      dark: options.dark ?? true,
      logoUrl: options.logoUrl,
      logoPosition: options.logoPosition ?? DEFAULT_LOGO_POSITION,
    };

    const element = template.render(props);

    const svg = await satori(element, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: OG_WIDTH },
    });

    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
  }

  private async loadFonts(family: FontFamily): Promise<FontData[]> {
    const familyName = FONT_FAMILY_MAP[family];

    const [regular, bold] = await Promise.all([
      this.fetchFont(familyName, 400),
      this.fetchFont(familyName, 700),
    ]);

    return [
      { name: familyName, data: regular, weight: 400, style: "normal" as const },
      { name: familyName, data: bold, weight: 700, style: "normal" as const },
    ];
  }

  private async fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
    const cacheKey = `${family}-${weight}`;
    const cached = this.fontCache.get(cacheKey);
    if (cached) return cached;

    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;

    const cssResponse = await fetch(url, {
      headers: {
        // Google Fonts returns woff2 for this UA; Satori supports it
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    });

    if (!cssResponse.ok) {
      logger.warn({ family, weight, status: cssResponse.status }, "Failed to fetch font CSS");
      throw new Error(`Failed to fetch font CSS for ${family}`);
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
