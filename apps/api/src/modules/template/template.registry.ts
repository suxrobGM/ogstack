import type { ImageKind, TemplateSlug } from "@ogstack/shared/constants";
import type { ReactNode } from "react";
import type { TemplateInfo } from "./template.schema";
import { HeroBrandCard } from "./templates/hero/brand-card";
import { HeroEditorial } from "./templates/hero/editorial";
import { HeroMinimal } from "./templates/hero/minimal";
import { HeroPanorama } from "./templates/hero/panorama";
import { HeroSpotlight } from "./templates/hero/spotlight";
import { BlogCard } from "./templates/og/blog-card";
import { CenteredBold } from "./templates/og/centered-bold";
import { Changelog } from "./templates/og/changelog";
import { DocsPage } from "./templates/og/docs-page";
import { GithubRepo } from "./templates/og/github-repo";
import { GradientDark } from "./templates/og/gradient-dark";
import { GradientLight } from "./templates/og/gradient-light";
import { Minimal } from "./templates/og/minimal";
import { ProductLaunch } from "./templates/og/product-launch";
import { SplitHero } from "./templates/og/split-hero";
import type { TemplateProps } from "./templates/types";

interface TemplateEntry {
  info: TemplateInfo;
  render: (props: TemplateProps) => ReactNode;
}

const OG_KINDS: ImageKind[] = ["og"];
const HERO_KINDS: ImageKind[] = ["blog_hero"];

const registry = new Map<TemplateSlug, TemplateEntry>([
  [
    "gradient_dark",
    {
      info: {
        slug: "gradient_dark",
        name: "Aurora",
        description: "Atmospheric dark canvas with accent glow, dot grid, and hostname footer",
        category: "MINIMAL",
        supportedKinds: OG_KINDS,
      },
      render: GradientDark,
    },
  ],
  [
    "gradient_light",
    {
      info: {
        slug: "gradient_light",
        name: "Editorial Paper",
        description: "Warm off-white essay layout with serif display type and corner marks",
        category: "MINIMAL",
        supportedKinds: OG_KINDS,
      },
      render: GradientLight,
    },
  ],
  [
    "split_hero",
    {
      info: {
        slug: "split_hero",
        name: "Spotlight Split",
        description: "Editorial left column with stacked tilted accent cards on the right",
        category: "CREATIVE",
        supportedKinds: OG_KINDS,
      },
      render: SplitHero,
    },
  ],
  [
    "centered_bold",
    {
      info: {
        slug: "centered_bold",
        name: "Billboard",
        description: "Oversized gradient display type with asymmetric accent blobs",
        category: "MINIMAL",
        supportedKinds: OG_KINDS,
      },
      render: CenteredBold,
    },
  ],
  [
    "blog_card",
    {
      info: {
        slug: "blog_card",
        name: "Magazine",
        description: "Category pill, serif headline, author byline with avatar and read time",
        category: "SOCIAL",
        supportedKinds: OG_KINDS,
      },
      render: BlogCard,
    },
  ],
  [
    "docs_page",
    {
      info: {
        slug: "docs_page",
        name: "Docs IDE",
        description: "Sidebar navigation mock with breadcrumb chips and monospace accents",
        category: "DOCUMENTATION",
        supportedKinds: OG_KINDS,
      },
      render: DocsPage,
    },
  ],
  [
    "product_launch",
    {
      info: {
        slug: "product_launch",
        name: "Launchpad",
        description: "Radial glow, spark constellation, gradient headline, NEW ribbon, stat chips",
        category: "MARKETING",
        supportedKinds: OG_KINDS,
      },
      render: ProductLaunch,
    },
  ],
  [
    "changelog",
    {
      info: {
        slug: "changelog",
        name: "Release Notes",
        description: "Prominent version number with color-coded change rows and release metadata",
        category: "TECH",
        supportedKinds: OG_KINDS,
      },
      render: Changelog,
    },
  ],
  [
    "github_repo",
    {
      info: {
        slug: "github_repo",
        name: "Open Source",
        description: "Owner/name header, star/fork/issue stats, and language distribution bar",
        category: "TECH",
        supportedKinds: OG_KINDS,
      },
      render: GithubRepo,
    },
  ],
  [
    "minimal",
    {
      info: {
        slug: "minimal",
        name: "Swiss Grid",
        description: "Line-numbered gutter with restrained typographic composition",
        category: "MINIMAL",
        supportedKinds: OG_KINDS,
      },
      render: Minimal,
    },
  ],
  [
    "hero_editorial",
    {
      info: {
        slug: "hero_editorial",
        name: "Editorial",
        description: "Magazine-cover serif headline with accent kicker and dateline rule",
        category: "MINIMAL",
        supportedKinds: HERO_KINDS,
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
        supportedKinds: HERO_KINDS,
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
        supportedKinds: HERO_KINDS,
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
        supportedKinds: HERO_KINDS,
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
        supportedKinds: HERO_KINDS,
      },
      render: HeroBrandCard,
    },
  ],
]);

export function getTemplate(slug: TemplateSlug): TemplateEntry {
  const entry = registry.get(slug);
  if (!entry) throw new Error(`Unknown template: ${slug}`);
  return entry;
}

export function listTemplates(kind?: ImageKind): TemplateInfo[] {
  const all = Array.from(registry.values()).map((e) => e.info);
  if (!kind) return all;
  return all.filter((info) => info.supportedKinds.includes(kind));
}

export function hasTemplate(slug: string): slug is TemplateSlug {
  return registry.has(slug as TemplateSlug);
}

export function templateSupportsKind(slug: TemplateSlug, kind: ImageKind): boolean {
  return registry.get(slug)?.info.supportedKinds.includes(kind) ?? false;
}
