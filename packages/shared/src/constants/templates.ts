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
 * Built-in template slugs. Adding a new template here requires a matching
 * registry entry (apps/api/src/modules/template/template.registry.ts) and
 * thumbnail asset (apps/web/public/images/templates/{slug-with-dashes}.webp).
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
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export const DEFAULT_TEMPLATE_SLUG: TemplateSlug = "gradient_dark";
