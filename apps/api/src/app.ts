import "dotenv/config";
import "@/common/di/container";
import { Elysia } from "elysia";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { errorMiddleware } from "@/common/middleware";
import { corsPlugin, swaggerPlugin, uploadsStaticPlugin } from "@/common/plugins";
import { logAiServicesAtStartup } from "@/common/services/ai";
import { validateEnv } from "@/env";
import { adminController } from "@/modules/admin";
import { apiKeyController, apiKeyDeleteController } from "@/modules/api-key";
import { auditCleanupCron, auditController, auditUserController } from "@/modules/audit";
import { authController } from "@/modules/auth";
import {
  billingController,
  billingWebhookController,
  syncStripeOnStartup,
} from "@/modules/billing";
import { imageApiController, imageController, imagePublicController } from "@/modules/image";
import { notificationController } from "@/modules/notification";
import { pageAnalysisController } from "@/modules/page-analysis";
import { projectController } from "@/modules/project";
import { templateController } from "@/modules/template";
import { usageController } from "@/modules/usage";
import { userController } from "@/modules/user";
import { HttpErrorResponses } from "@/types/response";

validateEnv();

const app = new Elysia()
  .use(errorMiddleware)
  .use(corsPlugin)
  .use(uploadsStaticPlugin)
  .use(swaggerPlugin)
  .onStop(async () => {
    await prisma.$disconnect();
  })
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(imagePublicController)
  .use(auditCleanupCron)
  .group("/api", (api) =>
    api
      .guard({ response: HttpErrorResponses })
      .use(authController)
      .use(apiKeyController)
      .use(apiKeyDeleteController)
      .use(auditController)
      .use(auditUserController)
      .use(pageAnalysisController)
      .use(imageApiController)
      .use(imageController)
      .use(projectController)
      .use(templateController)
      .use(userController)
      .use(usageController)
      .use(adminController)
      .use(billingWebhookController)
      .use(billingController)
      .use(notificationController),
  )
  .listen(parseInt(process.env.PORT!));

logger.info(`OGStack API running at http://${app.server?.hostname}:${app.server?.port}`);
logger.info(`Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`);

logAiServicesAtStartup();
syncStripeOnStartup();

// Export app type for Eden Treaty
export type App = typeof app;
