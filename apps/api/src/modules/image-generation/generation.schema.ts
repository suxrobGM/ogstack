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
const HexColorSchema = t.String({ pattern: "^#[0-9a-fA-F]{6}$" });
const AiModelSchema = t.Union([t.Literal("standard"), t.Literal("pro")]);
const AiPromptSchema = t.String({ maxLength: 500 });

export const StyleOptionsSchema = t.Object({
  accent: t.Optional(HexColorSchema),
  dark: t.Optional(t.Boolean()),
  font: t.Optional(FontFamilySchema),
  logo: t.Optional(
    t.Object({
      url: t.String({ format: "uri" }),
      position: t.Optional(LogoPositionSchema),
    }),
  ),
  aspectRatio: t.Optional(BlogHeroAspectSchema),
});

/**
 * Options for AI-generated backgrounds. Use `ai: true` to enable with defaults,
 * or `ai: { model, prompt, override }` to customize. Omit for template-only.
 */
export const AiOptionsSchema = t.Object({
  model: t.Optional(AiModelSchema),
  prompt: t.Optional(AiPromptSchema),
  /** When true, `prompt` is used as-is as the full Flux prompt (no page-synthesized blending). */
  override: t.Optional(t.Boolean()),
});

const AiParamSchema = t.Union([t.Literal(true), AiOptionsSchema]);

/** Shared generate body used by both /api/images (dashboard) and /api/images/generate (API key). */
export const GenerateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
  projectId: t.String({ format: "uuid" }),
  kind: t.Optional(ImageKindSchema),
  template: t.Optional(TemplateSlugBodySchema),
  style: t.Optional(StyleOptionsSchema),
  ai: t.Optional(AiParamSchema),
  /** Evict any cached image at (projectId, url) and regenerate. */
  force: t.Optional(t.Boolean()),
});

export const PublicGenerateParamsSchema = t.Object({ publicId: t.String() });

export const PublicGenerateQuerySchema = t.Object({
  url: t.String({ format: "uri" }),
  template: t.Optional(TemplateSlugBodySchema),
  accent: t.Optional(HexColorSchema),
  dark: t.Optional(t.Boolean()),
  font: t.Optional(FontFamilySchema),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  logoPosition: t.Optional(LogoPositionSchema),
  aspectRatio: t.Optional(BlogHeroAspectSchema),
  ai: t.Optional(t.Boolean()),
  aiModel: t.Optional(AiModelSchema),
  aiPrompt: t.Optional(AiPromptSchema),
});

const AiOutcomeSchema = t.Object({
  enabled: t.Boolean(),
  model: t.Nullable(t.String()),
  prompt: t.Nullable(t.String()),
  fellBack: t.Boolean(),
});

export const GenerateResponseSchema = t.Object({
  imageUrl: t.String(),
  kind: ImageKindSchema,
  width: t.Number(),
  height: t.Number(),
  cached: t.Boolean(),
  generationMs: t.Nullable(t.Number()),
  ai: t.Nullable(AiOutcomeSchema),
  source: t.Object({
    title: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    favicon: t.Nullable(t.String()),
  }),
  assets: t.Nullable(t.Array(ImageAssetSchema)),
});

export type StyleOptions = Static<typeof StyleOptionsSchema>;
export type AiOptions = Static<typeof AiOptionsSchema>;
export type AiParam = Static<typeof AiParamSchema>;
export type GenerateBody = Static<typeof GenerateBodySchema>;
export type PublicGenerateParams = Static<typeof PublicGenerateParamsSchema>;
export type PublicGenerateQuery = Static<typeof PublicGenerateQuerySchema>;
export type GenerateResponse = Static<typeof GenerateResponseSchema>;
