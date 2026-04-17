import type { TemplateSlug } from "@ogstack/shared/constants";
import type { ReactNode } from "react";
import type { TemplateInfo } from "./template.schema";
import { Aurora } from "./templates/aurora";
import { Billboard } from "./templates/billboard";
import { BlogCard } from "./templates/blog-card";
import { Changelog } from "./templates/changelog";
import { DocsPage } from "./templates/docs-page";
import { Editorial } from "./templates/editorial";
import { GithubRepo } from "./templates/github-repo";
import { Minimal } from "./templates/minimal";
import { Panorama } from "./templates/panorama";
import { ProductLaunch } from "./templates/product-launch";
import { Showcase } from "./templates/showcase";
import type { TemplateProps } from "./templates/types";

interface TemplateEntry {
  info: TemplateInfo;
  render: (props: TemplateProps) => ReactNode;
}

const registry = new Map<TemplateSlug, TemplateEntry>([
  [
    "aurora",
    {
      info: {
        slug: "aurora",
        name: "Aurora",
        description: "Atmospheric dark canvas with accent glow, dot grid, and hostname footer",
        category: "MINIMAL",
      },
      render: Aurora,
    },
  ],
  [
    "billboard",
    {
      info: {
        slug: "billboard",
        name: "Billboard",
        description: "Oversized gradient headline with corner marks and radial glows",
        category: "MARKETING",
      },
      render: Billboard,
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
    "editorial",
    {
      info: {
        slug: "editorial",
        name: "Editorial",
        description: "Warm paper-stock essay layout with serif display and dateline footer",
        category: "MINIMAL",
      },
      render: Editorial,
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
        name: "Minimal",
        description:
          "Restrained typographic composition — Swiss grid at OG, quiet negative space at wider aspects",
        category: "MINIMAL",
      },
      render: Minimal,
    },
  ],
  [
    "panorama",
    {
      info: {
        slug: "panorama",
        name: "Panorama",
        description: "Two-column editorial + accent-gradient panel with CTA pill",
        category: "CREATIVE",
      },
      render: Panorama,
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
    "showcase",
    {
      info: {
        slug: "showcase",
        name: "Showcase",
        description: "Split editorial + tilted card at OG; centered brand card at wider aspects",
        category: "CREATIVE",
      },
      render: Showcase,
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
