import { t, type Static } from "elysia";
import { Plan } from "@/generated/prisma";

export const RegisterBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 128 }),
  firstName: t.String({ minLength: 1, maxLength: 50 }),
  lastName: t.String({ minLength: 1, maxLength: 50 }),
  recaptchaToken: t.String({ minLength: 1 }),
});

export const LoginBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
  recaptchaToken: t.String({ minLength: 1 }),
});

export const RefreshBodySchema = t.Object({
  refreshToken: t.Optional(t.String()),
});

export const AuthUserSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  role: t.String(),
  plan: t.Enum(Plan),
});

export const AuthResponseSchema = t.Object({
  user: AuthUserSchema,
  accessToken: t.String(),
  refreshToken: t.String(),
});

export const RegisterResponseSchema = t.Object({
  message: t.String(),
  email: t.String(),
});

export const ForgotPasswordBodySchema = t.Object({
  email: t.String({ format: "email" }),
  recaptchaToken: t.String({ minLength: 1 }),
});

export const ResetPasswordBodySchema = t.Object({
  token: t.String(),
  password: t.String({ minLength: 8, maxLength: 128 }),
});

export const VerifyEmailBodySchema = t.Object({
  token: t.String(),
});

export const ResendVerificationBodySchema = t.Object({
  email: t.String({ format: "email" }),
  recaptchaToken: t.String({ minLength: 1 }),
});

export const OAuthRedirectQuerySchema = t.Object({
  redirect: t.Optional(t.String()),
});

export const OAuthCallbackQuerySchema = t.Object({
  code: t.String(),
  state: t.Optional(t.String()),
});

export type RegisterBody = Static<typeof RegisterBodySchema>;
export type LoginBody = Static<typeof LoginBodySchema>;
export type RefreshBody = Static<typeof RefreshBodySchema>;
export type ForgotPasswordBody = Static<typeof ForgotPasswordBodySchema>;
export type ResetPasswordBody = Static<typeof ResetPasswordBodySchema>;
export type VerifyEmailBody = Static<typeof VerifyEmailBodySchema>;
export type ResendVerificationBody = Static<typeof ResendVerificationBodySchema>;
export type AuthUser = Static<typeof AuthUserSchema>;
export type AuthResponse = Static<typeof AuthResponseSchema>;
export type RegisterResponse = Static<typeof RegisterResponseSchema>;
export type OAuthCallbackQuery = Static<typeof OAuthCallbackQuerySchema>;
