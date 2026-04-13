import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { logger } from "@/common/logger";
import { AuditService } from "./audit.service";

const AUDIT_RETENTION_DAYS = 30;

async function runCleanup(): Promise<void> {
  try {
    const deleted = await container
      .resolve(AuditService)
      .deleteStaleAnonymous(AUDIT_RETENTION_DAYS);
    if (deleted > 0) {
      logger.info({ deleted, retentionDays: AUDIT_RETENTION_DAYS }, "audit.cleanup completed");
    }
  } catch (err) {
    logger.error({ err }, "audit.cleanup failed");
  }
}

/** Elysia plugin that deletes anonymous audit reports older than the
 *  retention window, daily at midnight. */
export const auditCleanupCron = new Elysia({ name: "audit-cleanup-cron" }).use(
  cron({
    name: "audit-cleanup",
    pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
    catch: true,
    run: () => {
      logger.info("Running scheduled audit cleanup job");
      void runCleanup();
    },
  }),
) as unknown as Elysia;
