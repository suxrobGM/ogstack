import { Elysia } from "elysia";
import { container } from "@/common/di";
import { apiKeyGuard, authGuard, rateLimiter } from "@/common/middleware";
import {
  resolveApiKeyPlan,
  resolveUserPlan,
  tieredRateLimiter,
} from "@/common/middleware/tiered-rate-limiter";
import { MessageResponseSchema } from "@/types/response";
import {
  DashboardGenerateBodySchema,
  GenerateBodySchema,
  GenerateResponseSchema,
  InvalidateCacheParamsSchema,
  PublicGenerateParamsSchema,
  PublicGenerateQuerySchema,
} from "./generation.schema";
import { GenerationService } from "./generation.service";

const generationService = container.resolve(GenerationService);

/** POST /api/generate — API key auth, programmatic generation. */
export const generationController = new Elysia({ prefix: "/generate", tags: ["Generation"] })
  .use(apiKeyGuard)
  .use(tieredRateLimiter({ resolvePlan: resolveApiKeyPlan, keyPrefix: "gen-api" }))
  .post(
    "/",
    ({ apiKeyContext, body }) =>
      generationService.generate({
        userId: apiKeyContext.userId,
        projectId: apiKeyContext.projectId,
        url: body.url,
        template: body.template ?? "gradient_dark",
        options: body.options,
      }),
    {
      body: GenerateBodySchema,
      response: GenerateResponseSchema,
      detail: {
        summary: "Generate OG image",
        description: "Generate an Open Graph image from a URL. Requires API key authentication.",
      },
    },
  );

/** GET /og/:publicId — Public meta-tag mode, returns PNG directly. */
export const generationPublicController = new Elysia({ prefix: "/og", tags: ["Generation"] })
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .get(
    "/:publicId",
    async ({ params, query, set }) => {
      const pngBuffer = await generationService.generateImageByPublicId(
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
        description:
          "Public endpoint for meta-tag mode. Returns PNG image directly with caching headers.",
      },
    },
  );

/** POST /api/generate/playground — JWT auth, dashboard playground. */
export const generationDashboardController = new Elysia({
  prefix: "/generate",
  tags: ["Generation"],
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: resolveUserPlan, keyPrefix: "gen-dashboard" }))
  .post(
    "/playground",
    ({ user, body }) =>
      generationService.generate({
        userId: user.id,
        projectId: body.projectId,
        url: body.url,
        template: body.template ?? "gradient_dark",
        options: body.options,
      }),
    {
      body: DashboardGenerateBodySchema,
      response: GenerateResponseSchema,
      detail: {
        summary: "Generate OG image (dashboard)",
        description:
          "Generate an OG image from the dashboard playground. Requires user authentication.",
      },
    },
  )
  .delete(
    "/cache/:cacheKey",
    async ({ user, params }) => {
      await generationService.invalidateCache(user.id, params.cacheKey);
      return { message: "Cache invalidated" };
    },
    {
      params: InvalidateCacheParamsSchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Invalidate cached image",
        description: "Delete a cached generated image by its cache key. Must be the image owner.",
      },
    },
  );
