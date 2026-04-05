import { t, type Static } from "elysia";

export const RegisterBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 128 }),
  name: t.String({ minLength: 1, maxLength: 100 }),
});

export const LoginBodySchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const RefreshBodySchema = t.Object({
  refreshToken: t.String(),
});

export const AuthUserSchema = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  role: t.String(),
});

export const AuthResponseSchema = t.Object({
  user: AuthUserSchema,
  accessToken: t.String(),
  refreshToken: t.String(),
});

export type RegisterBody = Static<typeof RegisterBodySchema>;
export type LoginBody = Static<typeof LoginBodySchema>;
export type RefreshBody = Static<typeof RefreshBodySchema>;
export type AuthUser = Static<typeof AuthUserSchema>;
export type AuthResponse = Static<typeof AuthResponseSchema>;
