import type { ImageKind } from "@ogstack/shared/constants";
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
})
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "img-dashboard" }))
  .post("/", ({ user, body }) => imageGenerationService.generate({ userId: user.id, ...body }), {
    body: GenerateBodySchema,
    response: GenerateResponseSchema,
    detail: { summary: "Generate an OG image (dashboard)" },
  });

/** POST /api/images/generate — programmatic (API key) generation. */
export const imageGenerationApiController = new Elysia({
  prefix: "/images/generate",
  tags: ["Images"],
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

interface PublicRouteOptions {
  prefix: string;
  kind: ImageKind;
  cacheControl: string;
  keyPrefix: string;
  summary: string;
  description: string;
}

function publicImageRoute(opts: PublicRouteOptions) {
  return new Elysia({ prefix: opts.prefix, tags: ["Images"] })
    .use(
      tieredRateLimiter({
        resolvePlan: "publicId",
        keyPrefix: opts.keyPrefix,
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
          kind: opts.kind,
          template: query.template,
          style: styleFromQuery(query) ?? undefined,
          ai: aiFromQuery(query) ?? undefined,
        });
        set.headers["content-type"] = "image/png";
        set.headers["cache-control"] = opts.cacheControl;
        return pngBuffer;
      },
      {
        params: PublicGenerateParamsSchema,
        query: PublicGenerateQuerySchema,
        detail: { summary: opts.summary, description: opts.description },
      },
    );
}

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

/** /og/:publicId — unauthenticated CDN endpoint, returns a PNG directly. */
export const imagePublicController = publicImageRoute({
  prefix: "/og",
  kind: "og",
  cacheControl: "public, max-age=86400, s-maxage=604800",
  keyPrefix: "og-public",
  summary: "Generate OG image (public)",
  description:
    "Public meta-tag mode. Returns the PNG directly with long cache headers. Rate-limited per publicId by project owner's plan.",
});

/** /hero/:publicId — unauthenticated CDN endpoint for blog hero/cover images. */
export const imageHeroPublicController = publicImageRoute({
  prefix: "/hero",
  kind: "blog_hero",
  cacheControl: "public, max-age=86400, s-maxage=2592000",
  keyPrefix: "hero-public",
  summary: "Generate blog hero image (public)",
  description:
    "Public endpoint for blog cover / hero images (1600x900 or 1920x1080). Returns the PNG directly with 30d edge cache.",
});
