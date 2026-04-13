import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { generatePublicId } from "@/common/utils/crypto";

const DEMO_USER_EMAIL = "demo@ogstack.dev";
const DEMO_PROJECT_NAME = "Public Playground";

/**
 * Seed a dedicated project used by the public landing-page playground.
 *
 * The project is owned by a `demo@ogstack.dev` user (created on demand) with
 * empty `domains` so any URL is accepted. Its `publicId` is printed at the end
 * so you can copy it into `NEXT_PUBLIC_DEMO_PROJECT_ID` for the web app.
 *
 * Idempotent — reruns return the existing project's publicId rather than
 * creating a new one.
 */
export async function seedDemoProject(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      firstName: "Demo",
      lastName: "Playground",
      emailVerified: true,
    },
  });

  let project = await prisma.project.findFirst({
    where: { userId: user.id, name: DEMO_PROJECT_NAME },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        userId: user.id,
        publicId: generatePublicId(),
        name: DEMO_PROJECT_NAME,
        domains: [],
      },
    });
    logger.info("Demo project created: publicId=%s", project.publicId);
  } else {
    logger.info("Demo project already exists: publicId=%s", project.publicId);
  }

  logger.info(
    "Set NEXT_PUBLIC_DEMO_PROJECT_ID=%s in apps/web to enable the landing playground.",
    project.publicId,
  );
}
