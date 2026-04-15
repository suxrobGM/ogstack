-- AlterTable
ALTER TABLE "audit_reports" ADD COLUMN     "ai_analysis" JSONB,
ADD COLUMN     "ai_error" TEXT,
ADD COLUMN     "ai_status" TEXT;
