import { Elysia, t } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { UuidIdParamSchema } from "@/types/request";
import {
  ImageBulkDeleteBodySchema,
  ImageBulkDeleteResponseSchema,
  ImageItemSchema,
  ImageListQuerySchema,
  ImageListResponseSchema,
  ImageUpdateBodySchema,
} from "./image.schema";
import { ImageService } from "./image.service";

const imageService = container.resolve(ImageService);

/** /api/images — JWT-authenticated CRUD. Generation lives in image-generation. */
export const imageController = new Elysia({
  prefix: "/images",
  tags: ["Images"],
  detail: { security: [{ bearerAuth: [] }] },
})
  .use(authGuard)
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
  .get(
    "/:id/download",
    async ({ user, params }) => {
      const bundle = await imageService.buildDownloadBundle(user.id, params.id);
      const contentType = bundle.filename.endsWith(".zip") ? "application/zip" : "image/png";

      return new Response(new Uint8Array(bundle.buffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${bundle.filename}"`,
        },
      });
    },
    {
      params: UuidIdParamSchema,
      detail: { summary: "Download an image or icon-set bundle" },
    },
  )
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
