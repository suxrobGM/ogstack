import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { TemplateListResponseSchema } from "./template.schema";
import { TemplateService } from "./template.service";

const templateService = container.resolve(TemplateService);

export const templateController = new Elysia({ prefix: "/templates", tags: ["Templates"] })
  .use(authGuard)
  .get("/", () => templateService.list(), {
    response: TemplateListResponseSchema,
    detail: {
      summary: "List templates",
      description: "List all available OG image templates with their metadata.",
    },
  });
