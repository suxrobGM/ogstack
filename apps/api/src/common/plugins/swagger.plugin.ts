import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

/**
 * Elysia plugin for Swagger/OpenAPI documentation.
 */
export const swaggerPlugin = new Elysia({ name: "swagger" }).use(
  swagger({
    documentation: {
      info: {
        title: "OGStack API",
        version: "1.0.0",
        description: "OGStack API — generate beautiful Open Graph images for any URL",
      },
      tags: [
        { name: "Auth", description: "Authentication & authorization" },
        { name: "Users", description: "User profile management" },
        { name: "Projects", description: "Project management" },
        { name: "Admin", description: "Admin management" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token obtained from /auth/login or /auth/register",
          },
        },
      },
    },
  }),
);
