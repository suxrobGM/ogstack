import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { UnauthorizedError } from "@/common/errors";

/**
 * JWT auth guard plugin.
 * Derives `user` (id, role, email) into the Elysia request context.
 * Checks Authorization header first, then falls back to the `access_token` cookie.
 *
 * Usage:
 *   someRoutes.use(authGuard).get("/protected", ({ user }) => { ... })
 */
export const authGuard = new Elysia({ name: "auth-guard" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .derive({ as: "scoped" }, async ({ headers, cookie, jwt }) => {
    const authorization = headers.authorization;
    let token: string | undefined;

    if (authorization?.startsWith("Bearer ")) {
      token = authorization.slice(7);
    } else if (cookie.access_token?.value) {
      token = cookie.access_token.value as string;
    }

    if (!token) {
      throw new UnauthorizedError("Missing or invalid authorization");
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    return {
      user: {
        id: payload.sub!,
        role: payload.role!,
        email: payload.email!,
        plan: payload.plan ?? "FREE",
      },
    };
  });
