import { Elysia } from "elysia";
import { container } from "@/common/di";
import { rateLimiter } from "@/common/middleware/rate-limiter";
import { MessageResponseSchema } from "@/types/response";
import {
  AuthResponseSchema,
  ForgotPasswordBodySchema,
  LoginBodySchema,
  RefreshBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
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
  .post("/refresh", ({ body }) => authService.refresh(body.refreshToken), {
    body: RefreshBodySchema,
    response: AuthResponseSchema,
    detail: {
      summary: "Refresh access token",
      description:
        "Exchange a valid refresh token for a new access token and rotated refresh token.",
    },
  })
  .post(
    "/forgot-password",
    async ({ body }) => {
      await authService.forgotPassword(body);
      return { message: "If an account with that email exists, a reset link has been sent" };
    },
    {
      body: ForgotPasswordBodySchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Request password reset",
        description:
          "Send a password reset email to the provided address. Always returns success to prevent email enumeration.",
      },
    },
  )
  .post(
    "/reset-password",
    async ({ body }) => {
      await authService.resetPassword(body);
      return { message: "Password has been reset successfully" };
    },
    {
      body: ResetPasswordBodySchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Reset password",
        description: "Set a new password using a valid reset token from the forgot-password email.",
      },
    },
  );
