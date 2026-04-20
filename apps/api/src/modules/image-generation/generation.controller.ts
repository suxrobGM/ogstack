import { Elysia } from "elysia";
import { container } from "@/common/di";
import { ForbiddenError } from "@/common/errors";
import { apiKeyGuard, authGuard } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import {
  GenerateBodySchema,
  GenerateResponseSchema,
  PublicGenerateParamsSchema,
  PublicGenerateQuerySchema,
  type AiOptions,
  type PublicGenerateQuery,
  type StyleOptions,
} from "./generation.schema";
import { ImageGenerationService } from "./generation.service";

const imageGenerationService = container.resolve(ImageGenerationService);

/** POST /api/images — dashboard (JWT) generation. */
export const imageGenerationDashboardController = new Elysia({
  prefix: "/images",
  tags: ["Images"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "img-dashboard" }))
  .post("/", ({ user, body }) => imageGenerationService.generate({ userId: user.id, ...body }), {
    body: GenerateBodySchema,
    response: GenerateResponseSchema,
    detail: {
      summary: "Generate an OG image (dashboard)",
      description:
        "Dashboard counterpart to `POST /images/generate`. Same request/response shape, but authenticated via the JWT cookie/bearer token set at login instead of an API key.",
    },
  });

/** POST /api/images/generate — programmatic (API key) generation. */
export const imageGenerationApiController = new Elysia({
  prefix: "/images/generate",
  tags: ["Images"],
  detail: { security: [{ apiKeyAuth: [] }] },
})
  .use(apiKeyGuard)
  .use(tieredRateLimiter({ resolvePlan: "apiKey", keyPrefix: "img-api" }))
  .post(
    "/",
    ({ apiKeyContext, body }) => {
      if (apiKeyContext.projectId && apiKeyContext.projectId !== body.projectId) {
        throw new ForbiddenError("API key is scoped to a different project.");
      }
      return imageGenerationService.generate({ userId: apiKeyContext.userId, ...body });
    },
    {
      body: GenerateBodySchema,
      response: GenerateResponseSchema,
      detail: {
        summary: "Generate OG image (API key)",
        description:
          "Programmatic generation using an API key. `projectId` must be supplied in the body. Scoped keys may only target the project they were created for; global keys may target any of the user's projects.",
      },
    },
  );

function styleFromQuery(query: PublicGenerateQuery): StyleOptions | null {
  const logo = query.logoUrl ? { url: query.logoUrl, position: query.logoPosition } : null;

  const hasAny =
    query.accent != null ||
    query.dark != null ||
    query.font != null ||
    logo != null ||
    query.aspectRatio != null;

  if (!hasAny) {
    return null;
  }
  return {
    accent: query.accent,
    dark: query.dark,
    font: query.font,
    logo: logo ?? undefined,
    aspectRatio: query.aspectRatio,
  };
}

function aiFromQuery(query: PublicGenerateQuery): AiOptions | null {
  if (!query.ai) {
    return null;
  }
  return {
    model: query.aiModel,
    prompt: query.aiPrompt,
  };
}

/**
 * /api/og/:publicId — unauthenticated image endpoint, returns a PNG directly.
 * Reached externally as `api.ogstack.dev/og/:publicId` via nginx rewriting, or
 * as `ogstack.dev/api/og/:publicId` from the landing playground.
 */
export const imagePublicController = new Elysia({ prefix: "/og", tags: ["Images"] })
  .use(
    tieredRateLimiter({
      resolvePlan: "publicId",
      keyPrefix: "og-public",
      keyFn: (ctx) => {
        const params = ctx.params as { publicId?: string } | undefined;
        return params?.publicId ?? "unknown";
      },
    }),
  )
  .get(
    "/:publicId",
    async ({ params, query, set }) => {
      const pngBuffer = await imageGenerationService.generateByPublicId({
        publicId: params.publicId,
        url: query.url,
        kind: "og",
        template: query.template,
        style: styleFromQuery(query) ?? undefined,
        ai: aiFromQuery(query) ?? undefined,
      });
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
          "Public meta-tag mode. Returns the PNG directly with long cache headers. Rate-limited per publicId by project owner's plan.",
      },
    },
  );
