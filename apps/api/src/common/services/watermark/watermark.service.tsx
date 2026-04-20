import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { Plan } from "@/generated/prisma";
import { WatermarkBadge } from "./watermark-badge";

/** Free and Plus get a watermark. Pro is clean. */
export function shouldWatermark(plan: Plan): boolean {
  return plan === Plan.FREE || plan === Plan.PLUS;
}

const WATERMARK_WIDTH = 96;
const WATERMARK_HEIGHT = 22;
const MARGIN = 20;
const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap";
const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

@singleton()
export class WatermarkService {
  private badgeCache: Buffer | null = null;
  private badgeInflight: Promise<Buffer> | null = null;

  /**
   * Applies a watermark badge to the bottom-right of the given PNG buffer.
   * If any step of the process fails (e.g. font fetch, SVG render), logs a warning and returns the original image unmodified.
   */
  async apply(png: Buffer): Promise<Buffer> {
    try {
      const badge = await this.getBadge();
      const image = sharp(png);
      const { width, height } = await image.metadata();

      if (!width || !height) {
        throw new Error("Could not read image dimensions");
      }

      return image
        .composite([
          {
            input: badge,
            top: height - WATERMARK_HEIGHT - MARGIN,
            left: width - WATERMARK_WIDTH - MARGIN,
          },
        ])
        .png()
        .toBuffer();
    } catch (error) {
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        "Watermark application failed — returning unmodified image",
      );
      return png;
    }
  }

  private async getBadge(): Promise<Buffer> {
    if (this.badgeCache) return this.badgeCache;
    if (this.badgeInflight) return this.badgeInflight;

    this.badgeInflight = this.renderBadge()
      .then((buf) => {
        this.badgeCache = buf;
        this.badgeInflight = null;
        return buf;
      })
      .catch((error) => {
        this.badgeInflight = null;
        throw error;
      });

    return this.badgeInflight;
  }

  private async renderBadge(): Promise<Buffer> {
    const fontData = await this.fetchFont();

    const svg = await satori(<WatermarkBadge width={WATERMARK_WIDTH} height={WATERMARK_HEIGHT} />, {
      width: WATERMARK_WIDTH,
      height: WATERMARK_HEIGHT,
      fonts: [{ name: "Inter", data: fontData, weight: 600, style: "normal" }],
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: WATERMARK_WIDTH },
    });
    return Buffer.from(resvg.render().asPng());
  }

  private async fetchFont(): Promise<ArrayBuffer> {
    const css = await fetch(FONT_URL, { headers: { "User-Agent": FONT_UA } });
    if (!css.ok) {
      throw new Error(`Watermark font CSS fetch failed: ${css.status}`);
    }

    const text = await css.text();
    const match = text.match(/src:\s*url\(([^)]+)\)/);
    if (!match?.[1]) {
      throw new Error("Could not parse watermark font URL");
    }

    const font = await fetch(match[1]);
    if (!font.ok) {
      throw new Error(`Watermark font fetch failed: ${font.status}`);
    }
    return font.arrayBuffer();
  }
}
