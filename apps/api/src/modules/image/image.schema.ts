import { t, type Static } from "elysia";
import { ImageFormat } from "@/generated/prisma";
import { DateRangeQuerySchema, PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

/**
 * Wire-level image kind (lowercase). Mapped to the Prisma `ImageKind` enum
 * at the DB boundary. Shared across CRUD and generation.
 */
export const ImageKindSchema = t.Union(
  [t.Literal("og"), t.Literal("blog_hero"), t.Literal("icon_set")],
  { default: "og" },
);

/**
 * Kind variant for filter queries — no default, so an absent filter means
 * "any kind" rather than silently narrowing to `og`.
 */
const ImageKindFilterSchema = t.Union([
  t.Literal("og"),
  t.Literal("blog_hero"),
  t.Literal("icon_set"),
]);

export const BlogHeroAspectSchema = t.Union([t.Literal("16:9"), t.Literal("16:10")], {
  default: "16:9",
});

// Free-form on the DB (backed by the `template_categories` lookup table, not
// an enum). Loose validation lets seeders add categories without redeploying.
export const TemplateCategoryEnumSchema = t.String({ minLength: 1, maxLength: 64 });

export const ImageFormatSchema = t.Enum(ImageFormat);

export const ImageAssetSchema = t.Object({
  name: t.String(),
  url: t.String(),
  width: t.Number(),
  height: t.Number(),
  sizeBytes: t.Number(),
});

export const ImageListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  DateRangeQuerySchema,
  t.Object({
    projectId: t.Optional(t.String({ format: "uuid" })),
    category: t.Optional(TemplateCategoryEnumSchema),
    kind: t.Optional(ImageKindFilterSchema),
    search: t.Optional(t.String()),
  }),
]);

export const ImageItemSchema = t.Object({
  id: t.String(),
  sourceUrl: t.Nullable(t.String()),
  imageUrl: t.String(),
  cdnUrl: t.Nullable(t.String()),
  title: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  faviconUrl: t.Nullable(t.String()),
  kind: ImageKindSchema,
  category: t.Nullable(TemplateCategoryEnumSchema),
  template: t.Nullable(t.Object({ slug: t.String(), name: t.String() })),
  projectId: t.Nullable(t.String()),
  projectName: t.Nullable(t.String()),
  publicProjectId: t.Nullable(t.String()),
  aiModel: t.Nullable(t.String()),
  generatedOnPlan: t.String(),
  width: t.Number(),
  height: t.Number(),
  format: ImageFormatSchema,
  generationMs: t.Nullable(t.Number()),
  serveCount: t.Number(),
  assets: t.Nullable(t.Array(ImageAssetSchema)),
  createdAt: t.Date(),
});

export const ImageListResponseSchema = PaginatedResponseSchema(ImageItemSchema);

export const ImageUpdateBodySchema = t.Object({
  title: t.Optional(t.String({ maxLength: 200 })),
  description: t.Optional(t.String({ maxLength: 500 })),
});

export const ImageBulkDeleteBodySchema = t.Object({
  ids: t.Array(t.String({ format: "uuid" }), { minItems: 1, maxItems: 200 }),
});

export const ImageBulkDeleteResponseSchema = t.Object({
  success: t.Boolean(),
  deleted: t.Number(),
});

export type ImageListQuery = Static<typeof ImageListQuerySchema>;
export type ImageItem = Static<typeof ImageItemSchema>;
export type ImageListResponse = Static<typeof ImageListResponseSchema>;
export type ImageUpdateBody = Static<typeof ImageUpdateBodySchema>;
export type ImageBulkDeleteBody = Static<typeof ImageBulkDeleteBodySchema>;
export type ImageBulkDeleteResponse = Static<typeof ImageBulkDeleteResponseSchema>;
export type ImageAsset = Static<typeof ImageAssetSchema>;
