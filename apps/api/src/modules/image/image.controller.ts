import { Elysia, t } from "elysia";
import { container } from "@/common/di";
import { apiKeyGuard, authGuard } from "@/common/middleware";
import {
  resolveApiKeyPlan,
  resolveUserPlan,
  tieredRateLimiter,
} from "@/common/middleware/tiered-rate-limiter";
import { UuidIdParamSchema } from "@/types/request";
import { ImageGenerationService } from "./image-generation.service";
import {
  ApiGenerateBodySchema,
  DashboardGenerateBodySchema,
  GenerateResponseSchema,
  ImageItemSchema,
  ImageListQuerySchema,
  ImageListResponseSchema,
  ImageUpdateBodySchema,
} from "./image.schema";
import { ImageService } from "./image.service";

const imageService = container.resolve(ImageService);
const imageGenerationService = container.resolve(ImageGenerationService);

/** /api/images — JWT-authenticated CRUD + dashboard generate. */
export const imageController = new Elysia({ prefix: "/images", tags: ["Images"] })
  .use(authGuard)
  .use(tieredRateLimiter({ resolvePlan: resolveUserPlan, keyPrefix: "img-dashboard" }))
  .post(
    "/",
    ({ user, body }) =>
      imageGenerationService.generate({
        userId: user.id,
        projectId: body.projectId,
        url: body.url,
        template: body.template ?? "gradient_dark",
        options: body.options,
        fullOverride: body.options?.fullOverride,
      }),
    {
      body: DashboardGenerateBodySchema,
      response: GenerateResponseSchema,
      detail: { summary: "Generate an OG image (dashboard)" },
    },
  )
  .get("/", ({ user, query }) => imageService.list(user.id, query), {
    query: ImageListQuerySchema,
    response: ImageListResponseSchema,
    detail: { summary: "List images for the authenticated user" },
  })
  .get("/:id", ({ user, params }) => imageService.findById(user.id, params.id), {
    params: UuidIdParamSchema,
    response: ImageItemSchema,
    detail: { summary: "Fetch an image by id" },
  })
  .patch("/:id", ({ user, params, body }) => imageService.update(user.id, params.id, body), {
    params: UuidIdParamSchema,
    body: ImageUpdateBodySchema,
    response: ImageItemSchema,
    detail: { summary: "Update image metadata" },
  })
  .delete("/:id", ({ user, params }) => imageService.delete(user.id, params.id), {
    params: UuidIdParamSchema,
    response: t.Object({ success: t.Boolean() }),
    detail: { summary: "Delete an image" },
  });

/** /api/images/generate — API-key-authenticated programmatic generation. */
export const imageApiController = new Elysia({ prefix: "/images/generate", tags: ["Images"] })
  .use(apiKeyGuard)
  .use(tieredRateLimiter({ resolvePlan: resolveApiKeyPlan, keyPrefix: "img-api" }))
  .post(
    "/",
    ({ apiKeyContext, body }) =>
      imageGenerationService.generate({
        userId: apiKeyContext.userId,
        projectId: apiKeyContext.projectId,
        url: body.url,
        template: body.template ?? "gradient_dark",
        options: body.options,
        fullOverride: body.options?.fullOverride,
      }),
    {
      body: ApiGenerateBodySchema,
      response: GenerateResponseSchema,
      detail: {
        summary: "Generate OG image (API key)",
        description: "Programmatic generation using an API key.",
      },
    },
  );
