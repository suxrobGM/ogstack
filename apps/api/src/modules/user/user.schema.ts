import { t, type Static } from "elysia";

export const UserProfileSchema = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  role: t.String(),
  avatarUrl: t.Nullable(t.String()),
  emailVerified: t.Boolean(),
  createdAt: t.Date(),
});

export const UpdateProfileBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  avatarUrl: t.Optional(t.Nullable(t.String())),
});

export type UserProfile = Static<typeof UserProfileSchema>;
export type UpdateProfileBody = Static<typeof UpdateProfileBodySchema>;
