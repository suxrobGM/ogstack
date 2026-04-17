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
 * Built-in template slugs. OG templates render at 1200×630; hero templates
 * render at 1600×900 / 1920×1080. Each template declares the kinds it's
 * designed for via `supportedKinds` in the backend registry — a slug in this
 * flat list is valid on the wire but the service rejects kind/slug pairs that
 * don't match.
 *
 * Adding a new template requires a matching registry entry at
 * apps/api/src/modules/template/template.registry.ts and (for OG) a thumbnail
 * at apps/web/public/images/templates/{slug-with-dashes}.webp.
 */
export const TEMPLATE_SLUGS = [
  "gradient_dark",
  "gradient_light",
  "split_hero",
  "centered_bold",
  "blog_card",
  "docs_page",
  "product_launch",
  "changelog",
  "github_repo",
  "minimal",
  "hero_editorial",
  "hero_spotlight",
  "hero_panorama",
  "hero_minimal",
  "hero_brand_card",
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export const DEFAULT_TEMPLATE_SLUG: TemplateSlug = "gradient_dark";

/** Default hero-kind template — used when a `blog_hero` render omits `template`. */
export const DEFAULT_HERO_TEMPLATE_SLUG: TemplateSlug = "hero_editorial";

/** Kind-appropriate default slug. Callers should prefer this over hard-coding. */
export const DEFAULT_TEMPLATE_SLUG_BY_KIND: Record<ImageKind, TemplateSlug> = {
  og: DEFAULT_TEMPLATE_SLUG,
  blog_hero: DEFAULT_HERO_TEMPLATE_SLUG,
  // Icon-set renders don't use a slug; the value is a cache-key stub.
  icon_set: DEFAULT_TEMPLATE_SLUG,
};
