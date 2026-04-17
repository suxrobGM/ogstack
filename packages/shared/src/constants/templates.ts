import type { ImageKind } from "./image-kinds";

/**
 * Built-in template categories. Stored as plain strings on `Template.category`
 * and `Image.category` so new categories can be added without DB migrations;
 * the `template_categories` table is seeded but is not a hard FK, since
 * category-less templates are valid.
 */
export const TEMPLATE_CATEGORIES = [
  { slug: "TECH", label: "Tech" },
  { slug: "MARKETING", label: "Marketing" },
  { slug: "MINIMAL", label: "Minimal" },
  { slug: "CREATIVE", label: "Creative" },
  { slug: "BUSINESS", label: "Business" },
  { slug: "DOCUMENTATION", label: "Documentation" },
  { slug: "SOCIAL", label: "Social" },
] as const;

export const TEMPLATE_CATEGORY_SLUGS = TEMPLATE_CATEGORIES.map((c) => c.slug);

export type TemplateCategorySlug = (typeof TEMPLATE_CATEGORIES)[number]["slug"];

/**
 * Built-in template slugs. All templates are universal — they render at
 * whatever dimensions the caller passes (OG 1200×630, hero 1600×900 or
 * 1920×1080) and adapt their layout via aspect-aware scale tokens.
 *
 * Adding a new template requires a matching registry entry at
 * apps/api/src/modules/template/template.registry.ts and thumbnails at
 * apps/web/public/images/templates/{slug-with-dashes}-{og|hero}.webp.
 */
export const TEMPLATE_SLUGS = [
  "aurora",
  "billboard",
  "blog_card",
  "changelog",
  "docs_page",
  "editorial",
  "github_repo",
  "minimal",
  "panorama",
  "product_launch",
  "showcase",
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export const DEFAULT_TEMPLATE_SLUG: TemplateSlug = "editorial";

/**
 * Kind-appropriate default slug. With the unified registry, every template
 * supports every renderable kind — but callers can still prefer a different
 * default per kind if the UX benefits (e.g. marketing-leaning default for
 * hero). For now, `editorial` is the canonical default for both.
 */
export const DEFAULT_TEMPLATE_SLUG_BY_KIND: Record<ImageKind, TemplateSlug> = {
  og: DEFAULT_TEMPLATE_SLUG,
  blog_hero: DEFAULT_TEMPLATE_SLUG,
  // Icon-set renders don't use a slug; the value is a cache-key stub.
  icon_set: DEFAULT_TEMPLATE_SLUG,
};
