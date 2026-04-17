import {
  DEFAULT_TEMPLATE_SLUG,
  IMAGE_KINDS,
  TEMPLATE_SLUGS,
  type ImageKind,
  type TemplateSlug as SharedTemplateSlug,
} from "@ogstack/shared/constants";
import { t, type Static } from "elysia";

const TEMPLATE_SLUG_ENUM = Object.fromEntries(TEMPLATE_SLUGS.map((slug) => [slug, slug])) as {
  readonly [K in SharedTemplateSlug]: K;
};

const IMAGE_KIND_ENUM = Object.fromEntries(IMAGE_KINDS.map((kind) => [kind, kind])) as {
  readonly [K in ImageKind]: K;
};

export const TemplateSlugSchema = t.Enum(TEMPLATE_SLUG_ENUM, { default: DEFAULT_TEMPLATE_SLUG });
export const ImageKindSchema = t.Enum(IMAGE_KIND_ENUM);

export const FontFamilySchema = t.Union(
  [
    t.Literal("inter"),
    t.Literal("plus-jakarta-sans"),
    t.Literal("space-grotesk"),
    t.Literal("jetbrains-mono"),
    t.Literal("noto-sans"),
    t.Literal("instrument-serif"),
  ],
  { default: "inter" },
);

export const LogoPositionSchema = t.Union(
  [
    t.Literal("top-left"),
    t.Literal("top-right"),
    t.Literal("bottom-left"),
    t.Literal("bottom-right"),
  ],
  { default: "top-left" },
);

/**
 * Internal render contract. Flat shape consumed by the template renderer,
 * context builder, and cache-key hasher. Service-level concerns like
 * `force` and `ai.override` are handled outside this type.
 */
export const RenderOptionsSchema = t.Object({
  accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$", default: "#3B82F6" })),
  dark: t.Optional(t.Boolean({ default: true })),
  font: t.Optional(FontFamilySchema),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  logoPosition: t.Optional(LogoPositionSchema),
  aspectRatio: t.Optional(t.Union([t.Literal("16:9"), t.Literal("16:10")])),
  aiGenerated: t.Optional(t.Boolean({ default: false })),
  aiModel: t.Optional(t.Union([t.Literal("standard"), t.Literal("pro")])),
  aiPrompt: t.Optional(t.String({ maxLength: 500 })),
});

export const TemplateInfoSchema = t.Object({
  slug: TemplateSlugSchema,
  name: t.String(),
  description: t.String(),
  category: t.String(),
  supportedKinds: t.Array(ImageKindSchema),
});

export const TemplateListQuerySchema = t.Object({
  kind: t.Optional(ImageKindSchema),
});

export const TemplateListResponseSchema = t.Array(TemplateInfoSchema);

export type TemplateSlug = SharedTemplateSlug;
export type FontFamily = Static<typeof FontFamilySchema>;
export type LogoPosition = Static<typeof LogoPositionSchema>;
export type RenderOptions = Static<typeof RenderOptionsSchema>;
export type TemplateInfo = Static<typeof TemplateInfoSchema>;
export type TemplateListQuery = Static<typeof TemplateListQuerySchema>;
