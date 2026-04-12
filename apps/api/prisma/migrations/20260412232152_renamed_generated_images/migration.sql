/*
  Warnings:

  - You are about to drop the `generated_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "generated_images" DROP CONSTRAINT "generated_images_api_key_id_fkey";

-- DropForeignKey
ALTER TABLE "generated_images" DROP CONSTRAINT "generated_images_project_id_fkey";

-- DropForeignKey
ALTER TABLE "generated_images" DROP CONSTRAINT "generated_images_template_id_fkey";

-- DropForeignKey
ALTER TABLE "generated_images" DROP CONSTRAINT "generated_images_user_id_fkey";

-- DropTable
DROP TABLE "generated_images";

-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "api_key_id" UUID,
    "template_id" UUID,
    "category" "TemplateCategory",
    "source_url" TEXT,
    "cache_key" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "cdn_url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "favicon_url" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1200,
    "height" INTEGER NOT NULL DEFAULT 630,
    "format" "ImageFormat" NOT NULL DEFAULT 'PNG',
    "file_size" INTEGER,
    "ai_model" TEXT,
    "ai_prompt" TEXT,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "generation_ms" INTEGER,
    "serve_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_cache_key_key" ON "images"("cache_key");

-- CreateIndex
CREATE INDEX "images_cache_key_idx" ON "images"("cache_key");

-- CreateIndex
CREATE INDEX "images_user_id_created_at_idx" ON "images"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "images_user_id_category_idx" ON "images"("user_id", "category");

-- CreateIndex
CREATE INDEX "images_source_url_idx" ON "images"("source_url");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
