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

export const authController = new Elysia({ prefix: "/auth" })
  .use(rateLimiter({ max: 10, windowMs: 60_000 }))
  .post(
    "/register",
    async ({ body }) => {
      return authService.register(body);
    },
    {
      body: RegisterBodySchema,
      response: { 200: AuthResponseSchema },
      detail: { tags: ["Auth"], summary: "Register a new user" },
    },
  )
  .post(
    "/login",
    async ({ body }) => {
      return authService.login(body);
    },
    {
      body: LoginBodySchema,
      response: { 200: AuthResponseSchema },
      detail: { tags: ["Auth"], summary: "Login with email and password" },
    },
  )
  .post(
    "/refresh",
    async ({ body }) => {
      return authService.refresh(body);
    },
    {
      body: RefreshBodySchema,
      response: { 200: AuthResponseSchema },
      detail: { tags: ["Auth"], summary: "Refresh access token" },
    },
  )
  .use(authGuard)
  .post(
    "/logout",
    async ({ body }) => {
      await authService.logout(body.refreshToken);
      return { message: "Logged out successfully" };
    },
    {
      body: RefreshBodySchema,
      response: { 200: MessageSchema },
      detail: { tags: ["Auth"], summary: "Logout and revoke refresh token" },
    },
  );
