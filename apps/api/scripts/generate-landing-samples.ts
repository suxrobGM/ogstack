/**
 * Pre-generate AI sample images for the landing page AI Showcase.
 *
 * For each entry in the manifest we:
 *   1. Scrape the source URL for its metadata.
 *   2. Run page analysis through the local llama.cpp LLM to extract seeds.
 *   3. Build a Flux prompt from those seeds.
 *   4. Render at Standard (Flux 2) and Pro (Flux 2 Pro) quality via FAL.
 *   5. Convert PNG → WebP and write to apps/web/public/images/ai-samples/.
 *   6. Update the manifest with the real seeds returned by the LLM.
 *
 * Usage:
 *   bun run scripts/generate-landing-samples.ts
 *
 * Configuration is read from .env (same file the server uses). At
 * minimum the script expects:
 *   PROMPT_PROVIDER=llamacpp
 *   LLAMACPP_BASE_URL=http://localhost:8080
 *   FAL_API_KEY=...
 *
 * The script deliberately does not touch the database or the R2 storage layer.
 * The output images are committed as static assets under the web app.
 *
 * We never expose raw model names in filenames or copy — the manifest and
 * filenames label quality as "standard" or "pro".
 */
import { config } from "dotenv";
import "reflect-metadata";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { container } from "tsyringe";
import "@/common/di/container";
import { buildAiImagePrompt, PromptProviderService } from "@/common/services/ai";
import { FAL_MODELS } from "@/common/services/ai/image-providers/fal-ai.provider";
import { ImageProviderService } from "@/common/services/ai/image-providers/image-provider.service";
import { PAGE_ANALYSIS_SYSTEM_PROMPT } from "@/common/services/ai/prompt-providers/prompts";
import { parseJsonResponse } from "@/common/services/ai/prompt-providers/utils";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = resolve(__dirname, "../../../apps/web/public/images/ai-samples");
const MANIFEST_PATH = join(OUTPUT_DIR, "samples.manifest.json");

config({ path: resolve(__dirname, "../.env") });

type SampleQuality = "standard" | "pro";

interface SampleManifestEntry {
  slug: string;
  sourceUrl: string;
  template: string;
  quality: SampleQuality;
  file: string;
  seeds: {
    headline: string;
    tagline: string;
    mood: string;
  };
}

interface SampleManifest {
  generatedAt: string | null;
  notes: string;
  samples: SampleManifestEntry[];
}

interface PageAnalysisSeeds {
  imagePrompt?: {
    headline?: string;
    tagline?: string;
    backgroundKeywords?: string;
    mood?: string;
    suggestedAccent?: string;
  };
}

const FAL_MODEL_BY_QUALITY: Record<SampleQuality, string> = {
  standard: FAL_MODELS.flux2,
  pro: FAL_MODELS.flux2Pro,
};

async function loadManifest(): Promise<SampleManifest> {
  const raw = await readFile(MANIFEST_PATH, "utf8");
  return JSON.parse(raw) as SampleManifest;
}

async function saveManifest(manifest: SampleManifest): Promise<void> {
  manifest.generatedAt = new Date().toISOString();
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

async function analyze(
  metadata: UrlMetadata,
  promptProvider: PromptProviderService,
): Promise<PageAnalysisSeeds | null> {
  if (!promptProvider.isEnabled()) return null;

  const user = JSON.stringify({
    url: metadata.url,
    title: metadata.ogTitle ?? metadata.title,
    description: metadata.ogDescription ?? metadata.description,
    siteName: metadata.siteName,
    lang: metadata.lang,
    h1: metadata.h1,
    h2s: metadata.h2s.slice(0, 4),
    tags: metadata.tags.slice(0, 10),
    bodyText: metadata.bodyText?.slice(0, 3000) ?? null,
  });

  const raw = await promptProvider.chat(
    {
      system: PAGE_ANALYSIS_SYSTEM_PROMPT,
      user,
      json: true,
      temperature: 0.3,
      maxTokens: 5000,
    },
    { timeoutMs: 30_000 },
  );
  if (!raw) return null;
  return parseJsonResponse<PageAnalysisSeeds>(raw);
}

async function renderOne(params: {
  metadata: UrlMetadata;
  seeds: PageAnalysisSeeds | null;
  quality: SampleQuality;
  imageProvider: ImageProviderService;
}): Promise<Buffer> {
  const { metadata, seeds, quality, imageProvider } = params;
  const model = FAL_MODEL_BY_QUALITY[quality];

  const prompt = buildAiImagePrompt(metadata, {
    overrideHeadline: seeds?.imagePrompt?.headline,
    overrideTagline: seeds?.imagePrompt?.tagline,
    enrichedKeywords: seeds?.imagePrompt?.backgroundKeywords,
  });

  return imageProvider.generate({ model, prompt, timeoutMs: 60_000 });
}

async function main(): Promise<void> {
  const manifest = await loadManifest();

  const scraper = container.resolve(ScraperService);
  const promptProvider = container.resolve(PromptProviderService);
  const imageProvider = container.resolve(ImageProviderService);

  const active = promptProvider.getActiveProvider();
  console.log(
    `LLM: ${active ? `${active.id} (${active.model})` : "none — seeds fall back to scraped metadata"}`,
  );

  const metadataByUrl = new Map<string, UrlMetadata>();
  const seedsByUrl = new Map<string, PageAnalysisSeeds | null>();

  for (const entry of manifest.samples) {
    try {
      if (!metadataByUrl.has(entry.sourceUrl)) {
        console.log(`Scraping ${entry.sourceUrl}`);
        const meta = await scraper.extractMetadata(entry.sourceUrl, { allowHeadless: false });
        metadataByUrl.set(entry.sourceUrl, meta);
        const seeds = await analyze(meta, promptProvider);
        seedsByUrl.set(entry.sourceUrl, seeds);
      }

      const metadata = metadataByUrl.get(entry.sourceUrl)!;
      const seeds = seedsByUrl.get(entry.sourceUrl) ?? null;

      console.log(`  Rendering ${entry.slug} @ ${entry.quality} (${entry.template})`);
      const pngBuffer = await renderOne({
        metadata,
        seeds,
        quality: entry.quality,
        imageProvider,
      });
      const webpBuffer = await sharp(pngBuffer).resize(1200, 630).webp({ quality: 85 }).toBuffer();
      const outputPath = join(OUTPUT_DIR, entry.file);
      await writeFile(outputPath, webpBuffer);
      console.log(`  OK ${entry.file} (${(webpBuffer.length / 1024).toFixed(1)} KB)`);

      if (seeds?.imagePrompt) {
        entry.seeds = {
          headline: seeds.imagePrompt.headline ?? entry.seeds.headline,
          tagline: seeds.imagePrompt.tagline ?? entry.seeds.tagline,
          mood: seeds.imagePrompt.mood ?? entry.seeds.mood,
        };
      }
    } catch (error) {
      console.error(
        `  FAIL ${entry.slug} @ ${entry.quality}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  await saveManifest(manifest);
  console.log("Manifest updated. Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
