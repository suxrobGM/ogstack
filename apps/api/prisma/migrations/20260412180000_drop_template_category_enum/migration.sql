-- Convert TemplateCategory from an enum to free-form strings backed by a
-- lookup table. Existing enum values are preserved as-is (they're already
-- uppercase slugs like "TECH", "MINIMAL" etc.), so no data rewrite needed
-- beyond relaxing the column types.

ALTER TABLE "templates" ALTER COLUMN "category" TYPE TEXT USING "category"::text;
ALTER TABLE "templates" ALTER COLUMN "category" DROP NOT NULL;

ALTER TABLE "images" ALTER COLUMN "category" TYPE TEXT USING "category"::text;

DROP TYPE "TemplateCategory";

CREATE INDEX "templates_category_idx" ON "templates"("category");

CREATE TABLE "template_categories" (
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "template_categories_pkey" PRIMARY KEY ("slug")
);
