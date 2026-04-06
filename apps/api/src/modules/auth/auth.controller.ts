import { Elysia, type Cookie } from "elysia";
import { container } from "@/common/di";
import { rateLimiter } from "@/common/middleware/rate-limiter";
import { clearAuthCookies, setAuthCookies } from "@/common/utils/cookie";
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
  .post(
    "/register",
    async ({ body, cookie }) => {
      const result = await authService.register(body);
      setAuthCookies(cookie as Record<string, Cookie<unknown>>, result);
      return result;
    },
    {
      body: RegisterBodySchema,
      response: AuthResponseSchema,
      detail: {
        summary: "Register a new user",
        description:
          "Create a new user account with email and password. Automatically creates a default project and returns JWT access and refresh tokens.",
      },
    },
  )
  .post(
    "/login",
    async ({ body, cookie }) => {
      const result = await authService.login(body);
      setAuthCookies(cookie as Record<string, Cookie<unknown>>, result);
      return result;
    },
    {
      body: LoginBodySchema,
      response: AuthResponseSchema,
      detail: {
        summary: "Login with email and password",
        description:
          "Authenticate with email and password credentials. Returns JWT access and refresh tokens on success.",
      },
    },
  )
  .post(
    "/refresh",
    async ({ body, cookie }) => {
      const typedCookie = cookie as Record<string, Cookie<unknown>>;
      const refreshToken = body.refreshToken || (typedCookie.refresh_token?.value as string);
      const result = await authService.refresh(refreshToken);
      setAuthCookies(typedCookie, result);
      return result;
    },
    {
      body: RefreshBodySchema,
      response: AuthResponseSchema,
      detail: {
        summary: "Refresh access token",
        description:
          "Exchange a valid refresh token for a new access token and rotated refresh token.",
      },
    },
  )
  .post(
    "/logout",
    ({ cookie }) => {
      clearAuthCookies(cookie as Record<string, Cookie<unknown>>);
      return { message: "Logged out successfully" };
    },
    {
      response: MessageResponseSchema,
      detail: {
        summary: "Logout",
        description: "Clear authentication cookies and end the session.",
      },
    },
  )
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
