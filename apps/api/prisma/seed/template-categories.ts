import { TEMPLATE_CATEGORIES } from "@ogstack/shared/constants";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";

/**
 * Seed the built-in template categories. The `template_categories` table is a
 * soft lookup — the `Template.category` and `Image.category` columns are plain
 * strings, so new categories can be added by inserting rows here (or via a
 * future admin UI) without a schema migration.
 */
export async function seedTemplateCategories(): Promise<void> {
  let created = 0;
  let updated = 0;

  for (const { slug, label } of TEMPLATE_CATEGORIES) {
    const existing = await prisma.templateCategory.findUnique({ where: { slug } });
    await prisma.templateCategory.upsert({
      where: { slug },
      update: { label },
      create: { slug, label },
    });
    if (existing) updated++;
    else created++;
  }

  logger.info("Template categories seeded: %d created, %d updated", created, updated);
}
