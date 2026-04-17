/**
 * Hero (blog cover) template slugs. Kept separate from OG `TEMPLATE_SLUGS`
 * because hero templates are tuned for 1600×900 / 1920×1080 and are not
 * interchangeable with OG 1200×630 templates.
 *
 * Adding a new hero slug here requires a matching entry in
 * apps/api/src/modules/template/hero.registry.ts and a thumbnail asset at
 * apps/web/public/images/templates/{slug-with-dashes}.webp.
 */
export const HERO_TEMPLATE_SLUGS = [
  "hero_editorial",
  "hero_spotlight",
  "hero_panorama",
  "hero_minimal",
  "hero_brand_card",
] as const;

export type HeroTemplateSlug = (typeof HERO_TEMPLATE_SLUGS)[number];

export const DEFAULT_HERO_TEMPLATE_SLUG: HeroTemplateSlug = "hero_editorial";

export function isHeroTemplateSlug(value: unknown): value is HeroTemplateSlug {
  return typeof value === "string" && (HERO_TEMPLATE_SLUGS as readonly string[]).includes(value);
}
