import { Elysia, t } from "elysia";
import { container } from "@/common/di";
import { ForbiddenError } from "@/common/errors";
import { apiKeyGuard, authGuard } from "@/common/middleware";
import { tieredRateLimiter } from "@/common/middleware/tiered-rate-limiter";
import { UuidIdParamSchema } from "@/types/request";
import { ImageGenerationService } from "./image-generation.service";
import {
  ApiGenerateBodySchema,
  DashboardGenerateBodySchema,
  GenerateResponseSchema,
  ImageBulkDeleteBodySchema,
  ImageBulkDeleteResponseSchema,
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
  .use(tieredRateLimiter({ resolvePlan: "user", keyPrefix: "img-dashboard" }))
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
        override: body.override,
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
  })
  .delete("/", ({ user, body }) => imageService.bulkDelete(user.id, body.ids), {
    body: ImageBulkDeleteBodySchema,
    response: ImageBulkDeleteResponseSchema,
    detail: { summary: "Bulk delete images" },
  });

/** /api/images/generate — API-key-authenticated programmatic generation. */
export const imageApiController = new Elysia({ prefix: "/images/generate", tags: ["Images"] })
  .use(apiKeyGuard)
  .use(tieredRateLimiter({ resolvePlan: "apiKey", keyPrefix: "img-api" }))
  .post(
    "/",
    ({ apiKeyContext, body }) => {
      if (apiKeyContext.projectId && apiKeyContext.projectId !== body.projectId) {
        throw new ForbiddenError("API key is scoped to a different project.");
      }

      return imageGenerationService.generate({
        userId: apiKeyContext.userId,
        projectId: body.projectId,
        url: body.url,
        template: body.template ?? "gradient_dark",
        options: body.options,
        fullOverride: body.options?.fullOverride,
        override: body.override,
      });
    },
    {
      body: ApiGenerateBodySchema,
      response: GenerateResponseSchema,
      detail: {
        summary: "Generate OG image (API key)",
        description:
          "Programmatic generation using an API key. `projectId` must be supplied in the body. Scoped keys may only target the project they were created for; global keys may target any of the user's projects.",
      },
    },
  );
