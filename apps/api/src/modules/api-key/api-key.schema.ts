import { t, type Static } from "elysia";

export const CreateApiKeyBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  projectId: t.Optional(t.Nullable(t.String({ format: "uuid" }))),
});

export const ApiKeyListQuerySchema = t.Object({
  projectId: t.Optional(t.String({ format: "uuid" })),
});

export const ApiKeyProjectRefSchema = t.Object({
  id: t.String(),
  name: t.String(),
});

export const ApiKeySchema = t.Object({
  id: t.String(),
  prefix: t.String(),
  name: t.String(),
  project: t.Nullable(ApiKeyProjectRefSchema),
  lastUsedAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
});

export const ApiKeyWithSecretSchema = t.Object({
  id: t.String(),
  key: t.String({ description: "Full API key — shown only once" }),
  prefix: t.String(),
  name: t.String(),
  project: t.Nullable(ApiKeyProjectRefSchema),
  createdAt: t.Date(),
});

export type CreateApiKeyBody = Static<typeof CreateApiKeyBodySchema>;
export type ApiKeyListQuery = Static<typeof ApiKeyListQuerySchema>;
export type ApiKey = Static<typeof ApiKeySchema>;
export type ApiKeyWithSecret = Static<typeof ApiKeyWithSecretSchema>;
