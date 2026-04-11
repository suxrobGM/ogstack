import { Elysia } from "elysia";
import { container } from "@/common/di";
import { UnauthorizedError } from "@/common/errors";
import { ApiKeyService } from "@/modules/api-key/api-key.service";

/**
 * API key auth guard for the POST generation endpoint.
 * Expects `Authorization: Bearer og_live_...` and derives `apiKeyContext`
 * (userId, projectId) into the request context.
 */
export const apiKeyGuard = new Elysia({ name: "api-key-guard" }).derive(
  { as: "scoped" },
  async ({ headers }) => {
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const rawKey = authorization.slice(7);
    const apiKeyService = container.resolve(ApiKeyService);
    const result = await apiKeyService.validate(rawKey);

    if (!result) {
      throw new UnauthorizedError("Invalid or revoked API key");
    }

    return {
      apiKeyContext: {
        userId: result.userId,
        projectId: result.projectId,
        plan: result.plan,
      },
    };
  },
);
