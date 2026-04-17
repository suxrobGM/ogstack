import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { TemplateListQuerySchema, TemplateListResponseSchema } from "./template.schema";
import { TemplateService } from "./template.service";

const templateService = container.resolve(TemplateService);

export const templateController = new Elysia({ prefix: "/templates", tags: ["Templates"] })
  .use(authGuard)
  .get("/", ({ query }) => templateService.list(query.kind), {
    query: TemplateListQuerySchema,
    response: TemplateListResponseSchema,
    detail: {
      summary: "List templates",
      description:
        "List available image templates. Pass `?kind=og` or `?kind=blog_hero` to filter to templates designed for that kind; omit to list all.",
    },
  });
