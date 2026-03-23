import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { hashPassword } from "@/common/utils/password";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  if (!email || !password) {
    logger.warn("ADMIN_EMAIL and ADMIN_PASSWORD must be set, skipping admin seed");
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const wasCreated = user.createdAt.getTime() === user.updatedAt.getTime();
  if (wasCreated) {
    logger.info("Admin user created (email: %s)", email);
  } else {
    logger.info("Admin user updated (email: %s)", email);
  }
}
