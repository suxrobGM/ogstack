import type { TemplateSlug } from "@ogstack/shared/constants";
import type { ReactNode } from "react";
import type { TemplateInfo } from "./template.schema";
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

const registry = new Map<TemplateSlug, TemplateEntry>([
  [
    "gradient_dark",
    {
      info: {
        slug: "gradient_dark",
        name: "Aurora",
        description: "Atmospheric dark canvas with accent glow, dot grid, and hostname footer",
        category: "MINIMAL",
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
      },
      render: Minimal,
    },
  ],
]);

export function getTemplate(slug: TemplateSlug): TemplateEntry {
  const entry = registry.get(slug);
  if (!entry) throw new Error(`Unknown template: ${slug}`);
  return entry;
}

export function listTemplates(): TemplateInfo[] {
  return Array.from(registry.values()).map((e) => e.info);
}

export function hasTemplate(slug: string): slug is TemplateSlug {
  return registry.has(slug as TemplateSlug);
}
