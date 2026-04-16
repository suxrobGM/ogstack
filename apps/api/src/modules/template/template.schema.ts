import {
  DEFAULT_TEMPLATE_SLUG,
  TEMPLATE_SLUGS,
  type TemplateSlug as SharedTemplateSlug,
} from "@ogstack/shared/constants";
import { t, type Static } from "elysia";

// `t.Unsafe<T>` wraps a runtime schema with a compile-time type override. We
// build an enum-constrained string schema from the shared slug list, then
// brand its Static type with `SharedTemplateSlug` so handlers and inferred
// types get the narrow union without TypeBox's excessive tuple-inference cost.
export const TemplateSlugSchema = t.Unsafe<SharedTemplateSlug>(
  t.String({
    enum: [...TEMPLATE_SLUGS],
    default: DEFAULT_TEMPLATE_SLUG,
  }),
);

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

export const RenderOptionsSchema = t.Object({
  accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$", default: "#3B82F6" })),
  dark: t.Optional(t.Boolean({ default: true })),
  font: t.Optional(FontFamilySchema),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  logoPosition: t.Optional(LogoPositionSchema),
  aiGenerated: t.Optional(t.Boolean({ default: false })),
  aiModel: t.Optional(t.Union([t.Literal("standard"), t.Literal("pro")])),
  aiPrompt: t.Optional(t.String({ maxLength: 500 })),
  fullOverride: t.Optional(t.Boolean({ default: false })),
  force: t.Optional(t.Boolean({ default: false })),
});

export const TemplateInfoSchema = t.Object({
  slug: TemplateSlugSchema,
  name: t.String(),
  description: t.String(),
  category: t.String(),
});

export const TemplateListResponseSchema = t.Array(TemplateInfoSchema);

export type TemplateSlug = SharedTemplateSlug;
export type FontFamily = Static<typeof FontFamilySchema>;
export type LogoPosition = Static<typeof LogoPositionSchema>;
export type RenderOptions = Static<typeof RenderOptionsSchema>;
export type TemplateInfo = Static<typeof TemplateInfoSchema>;
