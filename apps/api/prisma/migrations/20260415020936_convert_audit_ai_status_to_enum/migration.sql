/*
  Warnings:

  - The `ai_status` column on the `audit_reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AuditAiStatus" AS ENUM ('PENDING', 'READY', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "audit_reports" DROP COLUMN "ai_status",
ADD COLUMN     "ai_status" "AuditAiStatus";
