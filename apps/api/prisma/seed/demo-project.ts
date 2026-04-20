import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { generatePublicId } from "@/common/utils/crypto";

const DEMO_USER_EMAIL = "demo@ogstack.dev";
const DEMO_PROJECT_NAME = "Public Playground";

/** Seeds the public playground project with `allowAnyDomain` so visitors can paste any URL. */
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

  const existing = await prisma.project.findFirst({
    where: { userId: user.id, name: DEMO_PROJECT_NAME },
  });

  const project = existing
    ? await prisma.project.update({
        where: { id: existing.id },
        data: { allowAnyDomain: true },
      })
    : await prisma.project.create({
        data: {
          userId: user.id,
          publicId: generatePublicId(),
          name: DEMO_PROJECT_NAME,
          domains: [],
          allowAnyDomain: true,
        },
      });

  logger.info("Demo project %s: publicId=%s", existing ? "updated" : "created", project.publicId);
  logger.info(
    "Set NEXT_PUBLIC_DEMO_PROJECT_ID=%s in apps/web to enable the landing playground.",
    project.publicId,
  );
}
