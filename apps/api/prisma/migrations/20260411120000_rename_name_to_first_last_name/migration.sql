-- AlterTable: split `name` into `first_name` + `last_name`
ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;

-- Populate from existing name (split on first space)
UPDATE "users"
SET "first_name" = CASE
      WHEN POSITION(' ' IN "name") > 0 THEN LEFT("name", POSITION(' ' IN "name") - 1)
      ELSE "name"
    END,
    "last_name" = CASE
      WHEN POSITION(' ' IN "name") > 0 THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
      ELSE ''
    END;

-- Make columns required
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;

-- Drop old column
ALTER TABLE "users" DROP COLUMN "name";
