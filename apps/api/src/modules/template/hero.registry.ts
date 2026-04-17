import type { HeroTemplateSlug } from "@ogstack/shared/constants";
import type { ReactNode } from "react";
import type { HeroTemplateInfo } from "./template.schema";
import { HeroBrandCard } from "./templates/hero/brand-card";
import { HeroEditorial } from "./templates/hero/editorial";
import { HeroMinimal } from "./templates/hero/minimal";
import { HeroPanorama } from "./templates/hero/panorama";
import { HeroSpotlight } from "./templates/hero/spotlight";
import type { TemplateProps } from "./templates/types";

interface HeroTemplateEntry {
  info: HeroTemplateInfo;
  render: (props: TemplateProps) => ReactNode;
}

const registry = new Map<HeroTemplateSlug, HeroTemplateEntry>([
  [
    "hero_editorial",
    {
      info: {
        slug: "hero_editorial",
        name: "Editorial",
        description: "Magazine-cover serif headline with accent kicker and dateline rule",
        category: "MINIMAL",
      },
      render: HeroEditorial,
    },
  ],
  [
    "hero_spotlight",
    {
      info: {
        slug: "hero_spotlight",
        name: "Spotlight",
        description:
          "Giant gradient headline with corner marks — billboard energy for landing pages",
        category: "MARKETING",
      },
      render: HeroSpotlight,
    },
  ],
  [
    "hero_panorama",
    {
      info: {
        slug: "hero_panorama",
        name: "Panorama",
        description: "Two-column editorial + accent-gradient panel with CTA pill",
        category: "CREATIVE",
      },
      render: HeroPanorama,
    },
  ],
  [
    "hero_minimal",
    {
      info: {
        slug: "hero_minimal",
        name: "Quiet Hero",
        description: "Restrained composition with generous negative space and a bottom dateline",
        category: "MINIMAL",
      },
      render: HeroMinimal,
    },
  ],
  [
    "hero_brand_card",
    {
      info: {
        slug: "hero_brand_card",
        name: "Brand Card",
        description: "Centered card with accent border, brand avatar, and read-more pill",
        category: "MARKETING",
      },
      render: HeroBrandCard,
    },
  ],
]);

export function getHeroTemplate(slug: HeroTemplateSlug): HeroTemplateEntry {
  const entry = registry.get(slug);
  if (!entry) throw new Error(`Unknown hero template: ${slug}`);
  return entry;
}

export function listHeroTemplates(): HeroTemplateInfo[] {
  return Array.from(registry.values()).map((e) => e.info);
}

export function hasHeroTemplate(slug: string): slug is HeroTemplateSlug {
  return registry.has(slug as HeroTemplateSlug);
}
