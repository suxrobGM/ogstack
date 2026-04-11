import { t, type Static } from "elysia";

export const UserProfileSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  role: t.String(),
  avatarUrl: t.Nullable(t.String()),
  emailVerified: t.Boolean(),
  hasPassword: t.Boolean(),
  githubConnected: t.Boolean(),
  googleConnected: t.Boolean(),
  createdAt: t.Date(),
});

export const UpdateProfileBodySchema = t.Object({
  firstName: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  lastName: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  avatarUrl: t.Optional(t.Nullable(t.String())),
});

export const ChangePasswordBodySchema = t.Object({
  currentPassword: t.String({ minLength: 8 }),
  newPassword: t.String({ minLength: 8 }),
  confirmPassword: t.String({ minLength: 8 }),
});

export const ChangeEmailBodySchema = t.Object({
  newEmail: t.String({ format: "email" }),
  password: t.String(),
});

export const UnlinkProviderParamsSchema = t.Object({
  provider: t.Union([t.Literal("github"), t.Literal("google")]),
});

export type UserProfile = Static<typeof UserProfileSchema>;
export type UpdateProfileBody = Static<typeof UpdateProfileBodySchema>;
export type ChangePasswordBody = Static<typeof ChangePasswordBodySchema>;
export type ChangeEmailBody = Static<typeof ChangeEmailBodySchema>;
export type UnlinkProviderParams = Static<typeof UnlinkProviderParamsSchema>;
