/**
 * Generate static template thumbnail images for the playground UI.
 *
 * Usage: bun run scripts/generate-template-thumbnails.ts
 * Or:    bun run generate:thumbnails
 *
 * Outputs WebP images to apps/web/public/images/templates/
 */
import "reflect-metadata";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import type { UrlMetadata } from "@/common/services/scraper.service";
import { listTemplates } from "@/modules/template/template.registry";
import type { TemplateSlug } from "@/modules/template/template.schema";
import { TemplateService } from "@/modules/template/template.service";

const OUTPUT_DIR = resolve(__dirname, "../../../apps/web/public/images/templates");

const SAMPLE_METADATA: UrlMetadata = {
  url: "https://example.com",
  title: "Your Page Title",
  description: "A brief description of your page content for social previews.",
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  favicon: null,
  author: "John Doe",
  siteName: "example.com",
};

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const templateService = new TemplateService();
  const templates = listTemplates();

  console.log(`Generating ${templates.length} template thumbnails (WebP)...`);

  for (const template of templates) {
    const slug = template.slug as TemplateSlug;
    const fileName = slug.replace(/_/g, "-") + ".webp";
    const outputPath = join(OUTPUT_DIR, fileName);

    try {
      const pngBuffer = await templateService.render(slug, SAMPLE_METADATA, {
        accent: "#3B82F6",
        dark: true,
        font: "inter",
      });

      const webpBuffer = await sharp(pngBuffer).resize(600, 315).webp({ quality: 80 }).toBuffer();

      await writeFile(outputPath, webpBuffer);
      console.log(`  OK ${slug} -> ${fileName} (${(webpBuffer.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`  FAIL ${slug}: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
