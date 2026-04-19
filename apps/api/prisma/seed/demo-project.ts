import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { generatePublicId } from "@/common/utils/crypto";

const DEMO_USER_EMAIL = "demo@ogstack.dev";
const DEMO_PROJECT_NAME = "Public Playground";

/** Allowlisted domains for the landing playground; must include the default demo URL's host. */
const DEMO_ALLOWED_DOMAINS = ["bun.sh", "elysiajs.com", "nextjs.org", "vercel.com", "github.com"];

/** Seeds the public playground project. Idempotent — refreshes allowed domains on reruns. */
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
        data: { domains: DEMO_ALLOWED_DOMAINS },
      })
    : await prisma.project.create({
        data: {
          userId: user.id,
          publicId: generatePublicId(),
          name: DEMO_PROJECT_NAME,
          domains: DEMO_ALLOWED_DOMAINS,
        },
      });

  logger.info("Demo project %s: publicId=%s", existing ? "updated" : "created", project.publicId);
  logger.info(
    "Set NEXT_PUBLIC_DEMO_PROJECT_ID=%s in apps/web to enable the landing playground.",
    project.publicId,
  );
}
