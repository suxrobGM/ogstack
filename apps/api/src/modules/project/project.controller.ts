import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { StringIdParamSchema } from "@/types/request";
import { MessageResponseSchema } from "@/types/response";
import {
  CreateProjectBodySchema,
  ProjectListQuerySchema,
  ProjectListResponseSchema,
  ProjectSchema,
  UpdateProjectBodySchema,
} from "./project.schema";
import { ProjectService } from "./project.service";

const projectService = container.resolve(ProjectService);

export const projectController = new Elysia({ prefix: "/projects", tags: ["Projects"] })
  .use(authGuard)
  .get("/", ({ user, query }) => projectService.list(user.id, query), {
    query: ProjectListQuerySchema,
    response: ProjectListResponseSchema,
    detail: {
      summary: "List projects",
      description:
        "List all projects owned by the authenticated user with pagination and optional search.",
    },
  })
  .get("/:id", ({ user, params }) => projectService.getById(user.id, params.id), {
    params: StringIdParamSchema,
    response: ProjectSchema,
    detail: {
      summary: "Get project",
      description: "Get a single project by ID. Must be the project owner.",
    },
  })
  .post("/", ({ user, body }) => projectService.create(user.id, body), {
    body: CreateProjectBodySchema,
    response: ProjectSchema,
    detail: {
      summary: "Create project",
      description: "Create a new project with an auto-generated public ID.",
    },
  })
  .patch("/:id", ({ user, params, body }) => projectService.update(user.id, params.id, body), {
    params: StringIdParamSchema,
    body: UpdateProjectBodySchema,
    response: ProjectSchema,
    detail: {
      summary: "Update project",
      description: "Update a project's name and/or domains. Must be the project owner.",
    },
  })
  .delete(
    "/:id",
    async ({ user, params }) => {
      await projectService.delete(user.id, params.id);
      return { message: "Project deleted successfully" };
    },
    {
      params: StringIdParamSchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Delete project",
        description: "Delete a project. Must be the project owner.",
      },
    },
  );
