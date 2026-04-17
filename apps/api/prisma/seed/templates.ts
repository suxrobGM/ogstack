import type { TemplateCategorySlug, TemplateSlug } from "@ogstack/shared/constants";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";

interface BuiltInTemplate {
  slug: TemplateSlug;
  name: string;
  description: string;
  category: TemplateCategorySlug;
  darkMode: boolean;
  lightMode: boolean;
}

const builtInTemplates: BuiltInTemplate[] = [
  {
    slug: "aurora",
    name: "Aurora",
    description: "Atmospheric dark canvas with accent glow, dot grid, and hostname footer",
    category: "MINIMAL",
    darkMode: true,
    lightMode: false,
  },
  {
    slug: "billboard",
    name: "Billboard",
    description: "Oversized gradient headline with corner marks and radial glows",
    category: "MARKETING",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "blog_card",
    name: "Magazine",
    description: "Category pill, serif headline, author byline with avatar and read time",
    category: "SOCIAL",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "changelog",
    name: "Release Notes",
    description: "Prominent version number with color-coded change rows and release metadata",
    category: "TECH",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "docs_page",
    name: "Docs IDE",
    description: "Sidebar navigation mock with breadcrumb chips and monospace accents",
    category: "DOCUMENTATION",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "editorial",
    name: "Editorial",
    description: "Warm paper-stock essay layout with serif display and dateline footer",
    category: "MINIMAL",
    darkMode: false,
    lightMode: true,
  },
  {
    slug: "github_repo",
    name: "Open Source",
    description: "Owner/name header, star/fork/issue stats, and language distribution bar",
    category: "TECH",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "minimal",
    name: "Minimal",
    description:
      "Restrained typographic composition — Swiss grid at OG, quiet negative space at wider aspects",
    category: "MINIMAL",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "panorama",
    name: "Panorama",
    description: "Two-column editorial + accent-gradient panel with CTA pill",
    category: "CREATIVE",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "product_launch",
    name: "Launchpad",
    description: "Radial glow, spark constellation, gradient headline, NEW ribbon, stat chips",
    category: "MARKETING",
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "showcase",
    name: "Showcase",
    description: "Split editorial + tilted card at OG; centered brand card at wider aspects",
    category: "CREATIVE",
    darkMode: true,
    lightMode: true,
  },
];

export async function seedTemplates(): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const template of builtInTemplates) {
    const result = await prisma.template.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        darkMode: template.darkMode,
        lightMode: template.lightMode,
        isBuiltIn: true,
      },
      create: {
        ...template,
        jsxCode: template.slug,
        isBuiltIn: true,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  logger.info("Templates seeded: %d created, %d updated", created, updated);
}
