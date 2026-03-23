import "dotenv/config";
import "@/common/di/container";
import { Elysia } from "elysia";
import { prisma } from "@/common/database";
import { logger } from "@/common/logger";
import { errorMiddleware } from "@/common/middleware";
import { corsPlugin, swaggerPlugin, uploadsStaticPlugin } from "@/common/plugins";
import { validateEnv } from "@/env";
import { authController } from "@/modules/auth";
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
  .group("/api", (api) =>
    api
      .guard({
        response: HttpErrorResponses,
      })
      .use(authController)
      .use(userController),
  )
  .listen(parseInt(process.env.PORT!));

logger.info(`OGStack API running at http://${app.server?.hostname}:${app.server?.port}`);

if (process.env.NODE_ENV === "development") {
  logger.info(
    `Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`,
  );
}

// Export app type for Eden Treaty
export type App = typeof app;
