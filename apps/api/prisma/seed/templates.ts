import { prisma } from "@/common/database";
import { logger } from "@/common/logger";

const builtInTemplates = [
  {
    slug: "gradient_dark",
    name: "Dark Gradient",
    description: "Title on dark gradient with accent color border",
    category: "MINIMAL" as const,
    darkMode: true,
    lightMode: false,
  },
  {
    slug: "gradient_light",
    name: "Light Gradient",
    description: "Title on light gradient, clean and minimal",
    category: "MINIMAL" as const,
    darkMode: false,
    lightMode: true,
  },
  {
    slug: "split_hero",
    name: "Split Hero",
    description: "Left text, right image or pattern area",
    category: "CREATIVE" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "centered_bold",
    name: "Centered Bold",
    description: "Large centered title with subtle background",
    category: "MINIMAL" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "blog_card",
    name: "Blog Card",
    description: "Author avatar, title, reading time, and site name",
    category: "SOCIAL" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "docs_page",
    name: "Documentation",
    description: "Sidebar-style layout with section breadcrumbs",
    category: "DOCUMENTATION" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "product_launch",
    name: "Product Launch",
    description: "Hero-style with tagline and call-to-action",
    category: "MARKETING" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "changelog",
    name: "Changelog",
    description: "Version badge, date, and update title",
    category: "TECH" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "github_repo",
    name: "Repository Card",
    description: "GitHub-style card with description and language indicator",
    category: "TECH" as const,
    darkMode: true,
    lightMode: true,
  },
  {
    slug: "minimal",
    name: "Minimal",
    description: "Just the title with maximum whitespace",
    category: "MINIMAL" as const,
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
