import { t, type Static } from "elysia";
import { ImageFormat } from "@/generated/prisma";
import { FontFamilySchema, LogoPositionSchema } from "@/modules/template/template.schema";
import { DateRangeQuerySchema, PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

/**
 * Wire-level image kind (lowercase). Mapped to the Prisma `ImageKind` enum
 * at the DB boundary.
 */
export const ImageKindSchema = t.Union(
  [t.Literal("og"), t.Literal("blog_hero"), t.Literal("icon_set")],
  { default: "og" },
);

export const BlogHeroAspectSchema = t.Union([t.Literal("16:9"), t.Literal("16:10")], {
  default: "16:9",
});

/**
 * Loose template schema. The service validates against either the OG or
 * hero registry based on `kind`, so accept any string here and fail at the
 * service layer with a specific 404.
 */
const TemplateSlugBodySchema = t.String({ minLength: 1, maxLength: 64 });

// Category is a free-form string on the DB (backed by the `template_categories`
// lookup table, not an enum). API-level validation is intentionally loose so
// new categories can be added via seeding without a schema/API redeploy.
const TemplateCategoryEnumSchema = t.String({ minLength: 1, maxLength: 64 });
const ImageFormatSchema = t.Enum(ImageFormat);

// --- Generation schemas ---

const RenderOptionsBodySchema = t.Optional(
  t.Object({
    accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$" })),
    dark: t.Optional(t.Boolean()),
    font: t.Optional(FontFamilySchema),
    logoUrl: t.Optional(t.String({ format: "uri" })),
    logoPosition: t.Optional(LogoPositionSchema),
    aspectRatio: t.Optional(BlogHeroAspectSchema),
    aiGenerated: t.Optional(t.Boolean()),
    aiModel: t.Optional(t.Union([t.Literal("standard"), t.Literal("pro")])),
    aiPrompt: t.Optional(t.String({ maxLength: 500 })),
    fullOverride: t.Optional(t.Boolean()),
    force: t.Optional(t.Boolean()),
  }),
);

export const ApiGenerateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
  kind: t.Optional(ImageKindSchema),
  template: t.Optional(TemplateSlugBodySchema),
  projectId: t.String({ format: "uuid" }),
  options: RenderOptionsBodySchema,
  override: t.Optional(t.Boolean()),
});

export const DashboardGenerateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
  kind: t.Optional(ImageKindSchema),
  template: t.Optional(TemplateSlugBodySchema),
  projectId: t.String({ format: "uuid" }),
  options: RenderOptionsBodySchema,
  override: t.Optional(t.Boolean()),
});

export const PublicGenerateParamsSchema = t.Object({ publicId: t.String() });

export const PublicGenerateQuerySchema = t.Object({
  url: t.String({ format: "uri" }),
  template: t.Optional(TemplateSlugBodySchema),
  accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$" })),
  dark: t.Optional(t.String()),
  font: t.Optional(FontFamilySchema),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  logoPosition: t.Optional(LogoPositionSchema),
  aspectRatio: t.Optional(BlogHeroAspectSchema),
  aiGenerated: t.Optional(t.String()),
  aiPrompt: t.Optional(t.String({ maxLength: 500 })),
});

export const ImageAssetSchema = t.Object({
  name: t.String(),
  width: t.Number(),
  height: t.Number(),
  sizeBytes: t.Number(),
});

export const GenerateResponseSchema = t.Object({
  imageUrl: t.String(),
  kind: ImageKindSchema,
  width: t.Number(),
  height: t.Number(),
  cached: t.Boolean(),
  generationMs: t.Optional(t.Number()),
  aiEnabled: t.Optional(t.Boolean()),
  aiFellBack: t.Optional(t.Boolean()),
  aiModel: t.Optional(t.Nullable(t.String())),
  aiPrompt: t.Optional(t.Nullable(t.String())),
  assets: t.Optional(t.Nullable(t.Array(ImageAssetSchema))),
  metadata: t.Object({
    title: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    favicon: t.Nullable(t.String()),
  }),
});

// --- CRUD schemas ---

export const ImageListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  DateRangeQuerySchema,
  t.Object({
    projectId: t.Optional(t.String({ format: "uuid" })),
    category: t.Optional(TemplateCategoryEnumSchema),
    kind: t.Optional(ImageKindSchema),
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

export type ApiGenerateBody = Static<typeof ApiGenerateBodySchema>;
export type DashboardGenerateBody = Static<typeof DashboardGenerateBodySchema>;
export type PublicGenerateParams = Static<typeof PublicGenerateParamsSchema>;
export type PublicGenerateQuery = Static<typeof PublicGenerateQuerySchema>;
export type GenerateResponse = Static<typeof GenerateResponseSchema>;
export type ImageListQuery = Static<typeof ImageListQuerySchema>;
export type ImageItem = Static<typeof ImageItemSchema>;
export type ImageListResponse = Static<typeof ImageListResponseSchema>;
export type ImageUpdateBody = Static<typeof ImageUpdateBodySchema>;
export type ImageBulkDeleteBody = Static<typeof ImageBulkDeleteBodySchema>;
export type ImageBulkDeleteResponse = Static<typeof ImageBulkDeleteResponseSchema>;
export type ImageAsset = Static<typeof ImageAssetSchema>;
