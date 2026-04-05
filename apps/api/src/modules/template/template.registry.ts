import type { ReactNode } from "react";
import type { TemplateInfo, TemplateSlug } from "./template.schema";
import { BlogCard } from "./templates/blog-card";
import { CenteredBold } from "./templates/centered-bold";
import { Changelog } from "./templates/changelog";
import { DocsPage } from "./templates/docs-page";
import { GithubRepo } from "./templates/github-repo";
import { GradientDark } from "./templates/gradient-dark";
import { GradientLight } from "./templates/gradient-light";
import { Minimal } from "./templates/minimal";
import { ProductLaunch } from "./templates/product-launch";
import { SplitHero } from "./templates/split-hero";
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
        name: "Dark Gradient",
        description: "Title on dark gradient with accent color border",
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
        name: "Light Gradient",
        description: "Title on light gradient, clean and minimal",
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
        name: "Split Hero",
        description: "Left text, right image or pattern area",
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
        name: "Centered Bold",
        description: "Large centered title with subtle background",
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
        name: "Blog Card",
        description: "Author avatar, title, reading time, and site name",
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
        name: "Documentation",
        description: "Sidebar-style layout with section breadcrumbs",
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
        name: "Product Launch",
        description: "Hero-style with tagline and call-to-action",
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
        name: "Changelog",
        description: "Version badge, date, and update title",
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
        name: "Repository Card",
        description: "GitHub-style card with description and language indicator",
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
        description: "Just the title with maximum whitespace",
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
