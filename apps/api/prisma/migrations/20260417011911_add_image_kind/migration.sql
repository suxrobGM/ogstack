-- CreateEnum
CREATE TYPE "ImageKind" AS ENUM ('OG', 'BLOG_HERO', 'ICON_SET');

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "assets" JSONB,
ADD COLUMN     "kind" "ImageKind" NOT NULL DEFAULT 'OG';

-- CreateIndex
CREATE INDEX "images_user_id_kind_idx" ON "images"("user_id", "kind");
