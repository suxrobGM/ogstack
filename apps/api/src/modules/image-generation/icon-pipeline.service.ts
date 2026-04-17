import { ICON_MASTER_SIZE, ICON_SIZES, type IconSize } from "@ogstack/shared/constants";
import pngToIco from "png-to-ico";
import sharp from "sharp";
import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import { buildIconPrompt, ImageProviderService } from "@/common/services/ai";
import { ImageStorageService } from "@/common/services/storage";
import { PrismaClient } from "@/generated/prisma";
import { toPrismaImageKind } from "@/modules/image/image.mapper";
import type { ImageAsset } from "@/modules/image/image.schema";
import { PageAnalysisService } from "@/modules/page-analysis";
import type { RenderContext } from "./context.builder";
import type { AiRenderOutcome } from "./generation.mapper";
import type { PipelineResult } from "./pipeline.service";

const FAVICON_ICO_SIZES: IconSize[] = [16, 32, 48];

interface IconAssetPlan {
  name: string;
  size: IconSize;
  contentType: string;
}

const ICON_FILES: IconAssetPlan[] = [
  { name: "favicon-16.png", size: 16, contentType: "image/png" },
  { name: "favicon-32.png", size: 32, contentType: "image/png" },
  { name: "favicon-48.png", size: 48, contentType: "image/png" },
  { name: "apple-touch-icon.png", size: 180, contentType: "image/png" },
  { name: "icon-192.png", size: 192, contentType: "image/png" },
  { name: "icon-512.png", size: 512, contentType: "image/png" },
];

/**
 * Generates a full favicon + app-icon set from a URL. Always AI-driven:
 * 1. Reuses cached page analysis for brand/palette seeds.
 * 2. Requests a 1024×1024 square master from Flux 2.
 * 3. Post-processes with sharp to emit 16/32/48/180/192/512 PNGs.
 * 4. Packages the 16/32/48 PNGs into favicon.ico via png-to-ico.
 * 5. Writes a site.webmanifest referencing the 192/512 sizes.
 * 6. Stores every file under an R2 prefix `{cacheKey}/…` and creates one
 *    `Image` row with `kind=ICON_SET` + `assets[]` metadata.
 */
@singleton()
export class IconPipelineService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly imageProvider: ImageProviderService,
    private readonly storage: ImageStorageService,
    private readonly pageAnalysis: PageAnalysisService,
  ) {}

  async run(ctx: RenderContext): Promise<PipelineResult> {
    const startMs = performance.now();

    if (!ctx.aiModel) {
      throw new BadRequestError("Icon-set generation requires an AI model.");
    }

    const { metadata, ai } = await this.pageAnalysis.getPageContext({
      url: ctx.url,
      userId: ctx.userId,
      userPrompt: ctx.options?.aiPrompt,
      fullOverride: ctx.fullOverride,
      skipAi: false,
    });

    const prompt = buildIconPrompt(metadata, ai, ctx.options?.aiPrompt);

    const masterPng = await this.imageProvider.generate({
      model: ctx.aiModel,
      prompt,
      imageSize: "square_hd",
    });

    const resized = await this.resizeToAllSizes(masterPng);
    const assets = await this.uploadAssets(ctx.cacheKey, resized);

    const generationMs = Math.round(performance.now() - startMs);

    const canonical = resized.get(512)!;
    const canonicalStored = await this.storage.store(
      `${ctx.cacheKey}/icon-512.png`,
      canonical,
      "image/png",
    );

    const image = await this.prisma.image.create({
      data: {
        userId: ctx.userId,
        projectId: ctx.projectId,
        apiKeyId: ctx.apiKeyId ?? null,
        kind: toPrismaImageKind("icon_set"),
        sourceUrl: ctx.url,
        cacheKey: ctx.cacheKey,
        imageUrl: canonicalStored.url,
        title: metadata.ogTitle ?? metadata.title,
        description: metadata.ogDescription ?? metadata.description,
        faviconUrl: metadata.favicon,
        width: ICON_MASTER_SIZE,
        height: ICON_MASTER_SIZE,
        format: "PNG",
        fileSize: canonical.length,
        generationMs,
        serveCount: 1,
        category: null,
        aiEnabled: true,
        aiModel: ctx.aiModel,
        aiPrompt: prompt,
        generatedOnPlan: ctx.plan,
        assets: assets as unknown as object,
      },
    });

    logger.info(
      { imageId: image.id, cacheKey: ctx.cacheKey, assetCount: assets.length, generationMs },
      "Icon set generated",
    );

    const outcome: AiRenderOutcome = {
      pngBuffer: canonical,
      aiEnabled: true,
      aiFellBack: false,
      aiModel: ctx.aiModel,
      aiPrompt: prompt,
    };

    return { image, outcome, generationMs };
  }

  /**
   * Lanczos3 on the downscale preserves detail; post-sharpen at sizes ≤48
   * fights the softness of aggressive downsampling.
   */
  private async resizeToAllSizes(master: Buffer): Promise<Map<IconSize, Buffer>> {
    const results = new Map<IconSize, Buffer>();
    await Promise.all(
      ICON_SIZES.map(async (size) => {
        let pipeline = sharp(master).resize(size, size, {
          fit: "cover",
          kernel: "lanczos3",
        });
        if (size <= 48) {
          pipeline = pipeline.sharpen({ sigma: 0.6 });
        }
        const buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
        results.set(size, buf);
      }),
    );
    return results;
  }

  private async uploadAssets(
    cacheKey: string,
    resized: Map<IconSize, Buffer>,
  ): Promise<ImageAsset[]> {
    const pngAssets: ImageAsset[] = [];

    await Promise.all(
      ICON_FILES.map(async (plan) => {
        const buffer = resized.get(plan.size);
        if (!buffer) return;
        const key = `${cacheKey}/${plan.name}`;
        const stored = await this.storage.store(key, buffer, plan.contentType);
        pngAssets.push({
          name: plan.name,
          width: plan.size,
          height: plan.size,
          sizeBytes: stored.size,
        });
      }),
    );

    const icoBuffers = FAVICON_ICO_SIZES.map((s) => resized.get(s)).filter((b): b is Buffer =>
      Boolean(b),
    );
    const icoBuffer = (await pngToIco(icoBuffers)) as Buffer;
    const icoStored = await this.storage.store(
      `${cacheKey}/favicon.ico`,
      icoBuffer,
      "image/x-icon",
    );
    pngAssets.push({
      name: "favicon.ico",
      width: 48,
      height: 48,
      sizeBytes: icoStored.size,
    });

    const manifest = {
      name: "Site",
      short_name: "Site",
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    };
    const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), "utf-8");
    const manifestStored = await this.storage.store(
      `${cacheKey}/site.webmanifest`,
      manifestBuffer,
      "application/manifest+json",
    );
    pngAssets.push({
      name: "site.webmanifest",
      width: 0,
      height: 0,
      sizeBytes: manifestStored.size,
    });

    return pngAssets;
  }
}
