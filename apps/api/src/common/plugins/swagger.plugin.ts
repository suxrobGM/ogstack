import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const description = [
  "Branded image API: Open Graph previews, blog covers, and favicon sets — with AI that reads your page.",
  "",
  "Guides and concepts live at [docs.ogstack.dev](https://docs.ogstack.dev). This page is the endpoint reference.",
  "",
  "**Authentication**",
  "",
  "- `bearerAuth` — JWT from `POST /auth/login` or `POST /auth/register`. Use for dashboard-scoped endpoints.",
  "- `apiKeyAuth` — API key (`og_live_...`) from the dashboard. Use for `POST /images/generate` and other server-side endpoints.",
  "",
  'Click **Authorize** above to store credentials for "Try it out".',
].join("\n");

/**
 * Elysia plugin for Swagger/OpenAPI documentation.
 */
export const swaggerPlugin = new Elysia({ name: "swagger" }).use(
  swagger({
    documentation: {
      info: {
        title: "OGStack API",
        version: "1.0.0",
        description,
        contact: {
          name: "OGStack",
          url: "https://ogstack.dev",
          email: "support@ogstack.dev",
        },
        license: { name: "Proprietary" },
      },
      servers: [
        { url: "https://api.ogstack.dev", description: "Production" },
        { url: "http://localhost:5000", description: "Local development" },
      ],
      tags: [
        {
          name: "Auth",
          description: "Registration, login, OAuth, password reset, email verification",
        },
        {
          name: "Users",
          description: "Current user profile, password and email changes, OAuth links",
        },
        { name: "Projects", description: "Project CRUD, public IDs, domain allowlist" },
        { name: "API Keys", description: "Create, list, revoke API keys scoped to projects" },
        { name: "Templates", description: "Built-in template registry" },
        {
          name: "Images",
          description: "Generate, list, download, and delete images (OG, blog hero, icon set)",
        },
        {
          name: "Page Analysis",
          description: "Scrape a URL and extract page metadata plus AI-derived signals",
        },
        {
          name: "Audit",
          description: "OG / Twitter Card / SEO audit with optional AI recommendations",
        },
        { name: "Usage", description: "Monthly, daily, and historical usage stats" },
        { name: "Billing", description: "Plans, subscriptions, checkout, Stripe webhook" },
        { name: "Notifications", description: "In-app notifications for the current user" },
        { name: "Admin", description: "Admin-only endpoints (requires ADMIN role)" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token from POST /auth/login or POST /auth/register.",
          },
          apiKeyAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "og_live_...",
            description:
              "API key from the dashboard. Send as `Authorization: Bearer og_live_...`. Scoped keys can only target their assigned project.",
          },
        },
      },
    },
  }),
);
