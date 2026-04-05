import { t, type Static } from "elysia";

export const TemplateSlugSchema = t.Union(
  [
    t.Literal("gradient_dark"),
    t.Literal("gradient_light"),
    t.Literal("split_hero"),
    t.Literal("centered_bold"),
    t.Literal("blog_card"),
    t.Literal("docs_page"),
    t.Literal("product_launch"),
    t.Literal("changelog"),
    t.Literal("github_repo"),
    t.Literal("minimal"),
  ],
  { default: "gradient_dark" },
);

export const FontFamilySchema = t.Union(
  [
    t.Literal("inter"),
    t.Literal("plus-jakarta-sans"),
    t.Literal("space-grotesk"),
    t.Literal("jetbrains-mono"),
    t.Literal("noto-sans"),
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
});

export const TemplateInfoSchema = t.Object({
  slug: TemplateSlugSchema,
  name: t.String(),
  description: t.String(),
  category: t.String(),
});

export const TemplateListResponseSchema = t.Array(TemplateInfoSchema);

export type TemplateSlug = Static<typeof TemplateSlugSchema>;
export type FontFamily = Static<typeof FontFamilySchema>;
export type LogoPosition = Static<typeof LogoPositionSchema>;
export type RenderOptions = Static<typeof RenderOptionsSchema>;
export type TemplateInfo = Static<typeof TemplateInfoSchema>;
