import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { rateLimiter } from "@/common/middleware/rate-limiter";
import {
  AuthResponseSchema,
  LoginBodySchema,
  MessageSchema,
  RefreshBodySchema,
  RegisterBodySchema,
} from "./auth.schema";
import { AuthService } from "./auth.service";

const authService = container.resolve(AuthService);

export const authController = new Elysia({ prefix: "/auth", tags: ["Auth"] })
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .post("/register", ({ body }) => authService.register(body), {
    body: RegisterBodySchema,
    response: AuthResponseSchema,
    detail: {
      summary: "Register a new user",
      description:
        "Create a new user account with email and password. Automatically creates a default project and returns JWT access and refresh tokens.",
    },
  })
  .post("/login", ({ body }) => authService.login(body), {
    body: LoginBodySchema,
    response: AuthResponseSchema,
    detail: {
      summary: "Login with email and password",
      description:
        "Authenticate with email and password credentials. Returns JWT access and refresh tokens on success.",
    },
  })
  .post("/refresh", ({ body }) => authService.refresh(body), {
    body: RefreshBodySchema,
    response: AuthResponseSchema,
    detail: {
      summary: "Refresh access token",
      description:
        "Exchange a valid refresh token for a new access token and rotated refresh token. The old refresh token is revoked.",
    },
  })
  .use(authGuard)
  .post(
    "/logout",
    async ({ body }) => {
      await authService.logout(body.refreshToken);
      return { message: "Logged out successfully" };
    },
    {
      body: RefreshBodySchema,
      response: MessageSchema,
      detail: {
        summary: "Logout and revoke refresh token",
        description:
          "Revoke the provided refresh token. Requires a valid access token in the Authorization header.",
      },
    },
  );
