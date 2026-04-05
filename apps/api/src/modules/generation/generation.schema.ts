import { t, type Static } from "elysia";
import {
  FontFamilySchema,
  LogoPositionSchema,
  TemplateSlugSchema,
} from "../template/template.schema";

export const GenerateBodySchema = t.Object({
  url: t.String({ format: "uri" }),
  template: t.Optional(TemplateSlugSchema),
  projectId: t.Optional(t.String({ format: "uuid" })),
  options: t.Optional(
    t.Object({
      accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$" })),
      dark: t.Optional(t.Boolean()),
      font: t.Optional(FontFamilySchema),
      logoUrl: t.Optional(t.String({ format: "uri" })),
      logoPosition: t.Optional(LogoPositionSchema),
    }),
  ),
});

export const DashboardGenerateBodySchema = t.Intersect([
  GenerateBodySchema,
  t.Object({ projectId: t.String({ format: "uuid" }) }),
]);

export const PublicGenerateParamsSchema = t.Object({
  publicId: t.String(),
});

export const PublicGenerateQuerySchema = t.Object({
  url: t.String({ format: "uri" }),
  template: t.Optional(TemplateSlugSchema),
  accent: t.Optional(t.String({ pattern: "^#[0-9a-fA-F]{6}$" })),
  dark: t.Optional(t.String()),
  font: t.Optional(FontFamilySchema),
  logoUrl: t.Optional(t.String({ format: "uri" })),
  logoPosition: t.Optional(LogoPositionSchema),
});

export const GenerateResponseSchema = t.Object({
  imageUrl: t.String(),
  cached: t.Boolean(),
  generationMs: t.Optional(t.Number()),
  metadata: t.Object({
    title: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    favicon: t.Nullable(t.String()),
  }),
});

export type GenerateBody = Static<typeof GenerateBodySchema>;
export type DashboardGenerateBody = Static<typeof DashboardGenerateBodySchema>;
export type PublicGenerateParams = Static<typeof PublicGenerateParamsSchema>;
export type PublicGenerateQuery = Static<typeof PublicGenerateQuerySchema>;
export type GenerateResponse = Static<typeof GenerateResponseSchema>;
