import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { logger } from "@/common/logger";
import { PrismaClient } from "@/generated/prisma";
import { ImageService } from "@/modules/image";

const DEMO_USER_EMAIL = "demo@ogstack.dev";
const DEMO_PROJECT_NAME = "Public Playground";
const DEMO_IMAGE_RETENTION_HOURS = 24;

async function runCleanup(): Promise<void> {
  try {
    const prisma = container.resolve(PrismaClient);
    const imageService = container.resolve(ImageService);

    const project = await prisma.project.findFirst({
      where: { user: { email: DEMO_USER_EMAIL }, name: DEMO_PROJECT_NAME },
      select: { id: true },
    });
    if (!project) return;

    const cutoff = new Date(Date.now() - DEMO_IMAGE_RETENTION_HOURS * 60 * 60 * 1000);
    const deleted = await imageService.deleteStaleForProject(project.id, cutoff);

    if (deleted > 0) {
      logger.info(
        { deleted, retentionHours: DEMO_IMAGE_RETENTION_HOURS },
        "demo-project.cleanup completed",
      );
    }
  } catch (err) {
    logger.error({ err }, "demo-project.cleanup failed");
  }
}

/** Daily cron that prunes generated images older than the retention window from the demo project. */
export const demoProjectCleanupCron = new Elysia({ name: "demo-project-cleanup-cron" }).use(
  cron({
    name: "demo-project-cleanup",
    pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
    catch: true,
    run: () => {
      logger.info("Running scheduled demo project image cleanup job");
      void runCleanup();
    },
  }),
) as unknown as Elysia;
