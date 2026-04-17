import { t, type Static } from "elysia";
import {
  BlogHeroAspectSchema,
  ImageAssetSchema,
  ImageKindSchema,
} from "@/modules/image/image.schema";
import { FontFamilySchema, LogoPositionSchema } from "@/modules/template/template.schema";

// Loose template slug — the service validates against the registry per kind
// and fails with a specific 404.
const TemplateSlugBodySchema = t.String({ minLength: 1, maxLength: 64 });

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

/** Shared generate body used by both /api/images (dashboard) and /api/images/generate (API key). */
export const GenerateBodySchema = t.Object({
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

export type GenerateBody = Static<typeof GenerateBodySchema>;
export type PublicGenerateParams = Static<typeof PublicGenerateParamsSchema>;
export type PublicGenerateQuery = Static<typeof PublicGenerateQuerySchema>;
export type GenerateResponse = Static<typeof GenerateResponseSchema>;
