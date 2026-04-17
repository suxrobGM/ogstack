import type { BlogHeroAspect } from "@ogstack/shared/constants";
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { ImageGenerationService } from "./image-generation.service";
import { PublicGenerateParamsSchema, PublicGenerateQuerySchema } from "./image.schema";

const imageGenerationService = container.resolve(ImageGenerationService);

/** /hero/:publicId — unauthenticated CDN endpoint for blog cover / hero images.
 *  Longer edge cache than OG because hero images change less often. */
export const imageHeroPublicController = new Elysia({ prefix: "/hero", tags: ["Images"] })
  .use(
    tieredRateLimiter({
      resolvePlan: "publicId",
      keyPrefix: "hero-public",
      keyFn: (ctx) => {
        const params = ctx.params as { publicId?: string } | undefined;
        return params?.publicId ?? "unknown";
      },
    }),
  )
  .get(
    "/:publicId",
    async ({ params, query, set }) => {
      const pngBuffer = await imageGenerationService.generateByPublicId(
        params.publicId,
        query.url,
        query.template,
        {
          accent: query.accent,
          dark: query.dark === "false" ? false : true,
          font: query.font,
          logoUrl: query.logoUrl,
          logoPosition: query.logoPosition,
          aspectRatio: query.aspectRatio as BlogHeroAspect | undefined,
          aiGenerated: query.aiGenerated === "true",
          aiPrompt: query.aiPrompt,
        },
        "blog_hero",
      );

      set.headers["content-type"] = "image/png";
      // Hero images change less often than OG — extend edge cache to 30 days.
      set.headers["cache-control"] = "public, max-age=86400, s-maxage=2592000";
      return pngBuffer;
    },
    {
      params: PublicGenerateParamsSchema,
      query: PublicGenerateQuerySchema,
      detail: {
        summary: "Generate blog hero image (public)",
        description:
          "Public endpoint for blog cover / hero images (1600x900 or 1920x1080). Returns the PNG directly with 30d edge cache.",
      },
    },
  );
