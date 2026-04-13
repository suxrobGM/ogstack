import { jwt } from "@elysiajs/jwt";
import { Plan } from "@ogstack/shared";
import { Elysia } from "elysia";

export type OptionalUser = {
  id: string;
  role: string;
  email: string;
  plan: Plan;
} | null;

/**
 * Optional JWT auth plugin — derives `user` into the request context when a
 * valid token is present, or `null` otherwise. Never throws.
 *
 * Use for endpoints that are public but benefit from knowing the caller
 * (e.g. attaching ownership, personalized rate limits).
 *
 * Usage:
 *   someRoutes.use(optionalAuthGuard).post("/", ({ user }) => {
 *     // user is { id, role, email, plan } | null
 *   });
 */
export const optionalAuthGuard = new Elysia({ name: "optional-auth-guard" })
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

    if (!token) return { user: null as OptionalUser };

    try {
      const payload = await jwt.verify(token);
      if (!payload) return { user: null as OptionalUser };
      return {
        user: {
          id: payload.sub!,
          role: payload.role!,
          email: payload.email!,
          plan: (payload.plan ?? Plan.FREE) as Plan,
        } as OptionalUser,
      };
    } catch {
      return { user: null as OptionalUser };
    }
  });
