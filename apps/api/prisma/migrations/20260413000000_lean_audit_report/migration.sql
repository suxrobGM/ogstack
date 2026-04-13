-- Collapse denormalized scalar + boolean columns on audit_reports into JSON blobs.
-- See `audit-report.prisma`: metadata + issues + categoryScores hold everything
-- that was previously expanded into per-field columns.

-- DropColumn
ALTER TABLE "audit_reports"
  DROP COLUMN "has_og_image",
  DROP COLUMN "og_image_url",
  DROP COLUMN "og_image_width",
  DROP COLUMN "og_image_height",
  DROP COLUMN "og_image_size",
  DROP COLUMN "has_og_title",
  DROP COLUMN "has_og_desc",
  DROP COLUMN "has_twitter_card";

-- RenameColumn
ALTER TABLE "audit_reports" RENAME COLUMN "previews" TO "metadata";

-- AddColumn
ALTER TABLE "audit_reports" ADD COLUMN "category_scores" JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "audit_reports" ALTER COLUMN "category_scores" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "audit_reports_user_id_created_at_idx" ON "audit_reports"("user_id", "created_at");
