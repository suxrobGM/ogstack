import { Elysia, type Cookie } from "elysia";
import { container } from "@/common/di";
import { rateLimiter } from "@/common/middleware/rate-limiter";
import {
  clearAuthCookies,
  clearOAuthStateCookie,
  getOAuthStateCookie,
  setAuthCookies,
  setOAuthStateCookie,
} from "@/common/utils/cookie";
import { generateRandomToken } from "@/common/utils/crypto";
import { MessageResponseSchema } from "@/types/response";
import {
  AuthResponseSchema,
  ForgotPasswordBodySchema,
  LoginBodySchema,
  OAuthCallbackQuerySchema,
  RefreshBodySchema,
  RegisterBodySchema,
  ResendVerificationBodySchema,
  ResetPasswordBodySchema,
  VerifyEmailBodySchema,
} from "./auth.schema";
import { AuthService } from "./auth.service";
import { GitHubOAuthService } from "./github-oauth.service";
import { GoogleOAuthService } from "./google-oauth.service";

const authService = container.resolve(AuthService);
const githubOAuth = container.resolve(GitHubOAuthService);
const googleOAuth = container.resolve(GoogleOAuthService);
const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:4001";

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
  )
  .post(
    "/verify-email",
    async ({ body }) => {
      await authService.verifyEmail(body);
      return { message: "Email verified successfully" };
    },
    {
      body: VerifyEmailBodySchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Verify email address",
        description: "Verify a user's email address using the token from the verification email.",
      },
    },
  )
  .post(
    "/resend-verification",
    async ({ body }) => {
      await authService.resendVerification(body);
      return { message: "If an unverified account exists, a verification email has been sent" };
    },
    {
      body: ResendVerificationBodySchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Resend verification email",
        description:
          "Resend the email verification link. Always returns success to prevent enumeration.",
      },
    },
  )
  .get(
    "/github",
    ({ cookie, redirect }) => {
      const state = generateRandomToken();
      setOAuthStateCookie(cookie as Record<string, Cookie<unknown>>, state);
      return redirect(githubOAuth.getAuthUrl(state));
    },
    {
      detail: {
        summary: "GitHub OAuth redirect",
        description: "Redirects the user to GitHub for OAuth authorization.",
      },
    },
  )
  .get(
    "/github/callback",
    async ({ query, cookie, redirect }) => {
      const typedCookie = cookie as Record<string, Cookie<unknown>>;
      const storedState = getOAuthStateCookie(typedCookie);

      if (!storedState || storedState !== query.state) {
        return redirect(`${WEBSITE_URL}/login?error=oauth_state_mismatch`);
      }

      clearOAuthStateCookie(typedCookie);

      try {
        const result = await githubOAuth.callback(query.code);
        setAuthCookies(typedCookie, result);
        return redirect(`${WEBSITE_URL}/overview`);
      } catch {
        return redirect(`${WEBSITE_URL}/login?error=oauth_failed`);
      }
    },
    {
      query: OAuthCallbackQuerySchema,
      detail: {
        summary: "GitHub OAuth callback",
        description:
          "Handle the OAuth callback from GitHub. Sets auth cookies and redirects to the frontend.",
      },
    },
  )
  .get(
    "/google",
    ({ cookie, redirect }) => {
      const state = generateRandomToken();
      setOAuthStateCookie(cookie as Record<string, Cookie<unknown>>, state);
      return redirect(googleOAuth.getAuthUrl(state));
    },
    {
      detail: {
        summary: "Google OAuth redirect",
        description: "Redirects the user to Google for OAuth authorization.",
      },
    },
  )
  .get(
    "/google/callback",
    async ({ query, cookie, redirect }) => {
      const typedCookie = cookie as Record<string, Cookie<unknown>>;
      const storedState = getOAuthStateCookie(typedCookie);

      if (!storedState || storedState !== query.state) {
        return redirect(`${WEBSITE_URL}/login?error=oauth_state_mismatch`);
      }

      clearOAuthStateCookie(typedCookie);

      try {
        const result = await googleOAuth.callback(query.code);
        setAuthCookies(typedCookie, result);
        return redirect(`${WEBSITE_URL}/overview`);
      } catch {
        return redirect(`${WEBSITE_URL}/login?error=oauth_failed`);
      }
    },
    {
      query: OAuthCallbackQuerySchema,
      detail: {
        summary: "Google OAuth callback",
        description:
          "Handle the OAuth callback from Google. Sets auth cookies and redirects to the frontend.",
      },
    },
  );
