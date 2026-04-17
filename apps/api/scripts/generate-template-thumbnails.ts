/**
 * Generate static template thumbnail images for the playground UI.
 *
 * Usage: bun run scripts/generate-template-thumbnails.ts
 * Or:    bun run generate:thumbnails
 *
 * Outputs WebP images to apps/web/public/images/templates/
 * Covers OG (1200×630) and blog hero 16:9 (1600×900) templates — icon sets
 * are AI-generated and have no selectable templates.
 */
import "reflect-metadata";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  BLOG_HERO_DIMENSIONS,
  OG_DIMENSIONS,
  type ImageDimensions,
  type ImageKind,
} from "@ogstack/shared/constants";
import sharp from "sharp";
import { createEmptyMetadata, type UrlMetadata } from "@/common/services/scraper";
import { listTemplates } from "@/modules/template/template.registry";
import type { TemplateSlug } from "@/modules/template/template.schema";
import { TemplateService } from "@/modules/template/template.service";

const OUTPUT_DIR = resolve(__dirname, "../../../apps/web/public/images/templates");
const THUMBNAIL_WIDTH = 600;

const SAMPLE_METADATA: UrlMetadata = {
  ...createEmptyMetadata("https://example.com"),
  title: "Your Page Title",
  description: "A brief description of your page content for social previews.",
  author: "John Doe",
  siteName: "example.com",
};

const RENDER_TARGETS: ReadonlyArray<{ kind: ImageKind; dimensions: ImageDimensions }> = [
  { kind: "og", dimensions: OG_DIMENSIONS },
  { kind: "blog_hero", dimensions: BLOG_HERO_DIMENSIONS["16:9"] },
];

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const templateService = new TemplateService();

  for (const { kind, dimensions } of RENDER_TARGETS) {
    const templates = listTemplates(kind);
    console.log(
      `\nGenerating ${templates.length} ${kind} thumbnails at ${dimensions.width}×${dimensions.height}...`,
    );

    for (const template of templates) {
      const slug = template.slug as TemplateSlug;
      const fileName = slug.replace(/_/g, "-") + ".webp";
      const outputPath = join(OUTPUT_DIR, fileName);

      try {
        const pngBuffer = await templateService.render(
          slug,
          SAMPLE_METADATA,
          { accent: "#3B82F6", dark: true, font: "inter" },
          dimensions,
        );

        const webpBuffer = await sharp(pngBuffer)
          .resize({ width: THUMBNAIL_WIDTH })
          .webp({ quality: 80 })
          .toBuffer();

        await writeFile(outputPath, webpBuffer);
        console.log(`  OK ${slug} -> ${fileName} (${(webpBuffer.length / 1024).toFixed(1)} KB)`);
      } catch (error) {
        console.error(`  FAIL ${slug}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
