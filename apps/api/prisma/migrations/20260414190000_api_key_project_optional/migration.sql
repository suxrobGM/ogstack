-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_project_id_fkey";

-- AlterTable
ALTER TABLE "api_keys" ALTER COLUMN "project_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
