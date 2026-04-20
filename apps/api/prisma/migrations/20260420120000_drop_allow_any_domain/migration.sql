-- Drop the `allow_any_domain` column. Its semantics are now fully expressed by
-- an empty `domains` array (empty = allow any URL; non-empty = allowlist).
ALTER TABLE "projects" DROP COLUMN "allow_any_domain";
