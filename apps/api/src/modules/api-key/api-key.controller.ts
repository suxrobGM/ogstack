import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { StringIdParamSchema } from "@/types/request";
import { MessageResponseSchema } from "@/types/response";
import {
  ApiKeyCreatedSchema,
  ApiKeyListQuerySchema,
  ApiKeyListResponseSchema,
  CreateApiKeyBodySchema,
} from "./api-key.schema";
import { ApiKeyService } from "./api-key.service";

const apiKeyService = container.resolve(ApiKeyService);

/** Global API key management. Keys may be scoped to a project or apply to all of the user's projects. */
export const apiKeyController = new Elysia({ prefix: "/api-keys", tags: ["API Keys"] })
  .use(authGuard)
  .post("/", ({ user, body }) => apiKeyService.create(user.id, body), {
    body: CreateApiKeyBodySchema,
    response: ApiKeyCreatedSchema,
    detail: {
      summary: "Create API key",
      description:
        "Generate a new API key. When `projectId` is omitted, the key applies to all of your projects. The full key is returned once and never stored.",
    },
  })
  .get("/", ({ user, query }) => apiKeyService.list(user.id, query.projectId), {
    query: ApiKeyListQuerySchema,
    response: ApiKeyListResponseSchema,
    detail: {
      summary: "List API keys",
      description:
        "List all API keys for the authenticated user. Pass `projectId` to scope to a single project.",
    },
  })
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
