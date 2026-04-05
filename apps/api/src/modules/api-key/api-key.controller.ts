import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { StringIdParamSchema } from "@/types/request";
import { MessageResponseSchema } from "@/types/response";
import {
  ApiKeyCreatedSchema,
  ApiKeyListResponseSchema,
  CreateApiKeyBodySchema,
  ProjectIdParamSchema,
} from "./api-key.schema";
import { ApiKeyService } from "./api-key.service";

const apiKeyService = container.resolve(ApiKeyService);

export const apiKeyController = new Elysia({ prefix: "/projects", tags: ["API Keys"] })
  .use(authGuard)
  .post(
    "/:projectId/api-keys",
    ({ user, params, body }) => apiKeyService.create(user.id, params.projectId, body),
    {
      params: ProjectIdParamSchema,
      body: CreateApiKeyBodySchema,
      response: ApiKeyCreatedSchema,
      detail: {
        summary: "Create API key",
        description:
          "Generate a new API key for a project. The full key is returned once and never stored — save it immediately.",
      },
    },
  )
  .get(
    "/:projectId/api-keys",
    ({ user, params }) => apiKeyService.list(user.id, params.projectId),
    {
      params: ProjectIdParamSchema,
      response: ApiKeyListResponseSchema,
      detail: {
        summary: "List API keys",
        description: "List all API keys for a project. Only the prefix is shown, not the full key.",
      },
    },
  );

export const apiKeyDeleteController = new Elysia({ prefix: "/api-keys", tags: ["API Keys"] })
  .use(authGuard)
  .delete(
    "/:id",
    async ({ user, params }) => {
      await apiKeyService.delete(user.id, params.id);
      return { message: "API key deleted successfully" };
    },
    {
      params: StringIdParamSchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Delete API key",
        description: "Permanently delete an API key. Must be the key owner.",
      },
    },
  );
