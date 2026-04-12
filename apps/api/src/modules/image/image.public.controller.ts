import { Elysia } from "elysia";
import { container } from "@/common/di";
import { rateLimiter } from "@/common/middleware";
import { ImageGenerationService } from "./image-generation.service";
import { PublicGenerateParamsSchema, PublicGenerateQuerySchema } from "./image.schema";

const imageGenerationService = container.resolve(ImageGenerationService);

/** /og/:publicId — unauthenticated CDN endpoint, returns a PNG directly. */
export const imagePublicController = new Elysia({ prefix: "/og", tags: ["Images"] })
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .get(
    "/:publicId",
    async ({ params, query, set }) => {
      const pngBuffer = await imageGenerationService.generateByPublicId(
        params.publicId,
        query.url,
        query.template ?? "gradient_dark",
        {
          accent: query.accent,
          dark: query.dark === "false" ? false : true,
          font: query.font,
          logoUrl: query.logoUrl,
          logoPosition: query.logoPosition,
        },
      );

      set.headers["content-type"] = "image/png";
      set.headers["cache-control"] = "public, max-age=86400, s-maxage=604800";
      return pngBuffer;
    },
    {
      params: PublicGenerateParamsSchema,
      query: PublicGenerateQuerySchema,
      detail: {
        summary: "Generate OG image (public)",
        description: "Public meta-tag mode. Returns the PNG directly with long cache headers.",
      },
    },
  );
