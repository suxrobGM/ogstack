import { t, type Static } from "elysia";

export const ApiKeyIdParamSchema = t.Object({
  id: t.String(),
});

export const CreateApiKeyBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  projectId: t.Optional(t.Nullable(t.String({ format: "uuid" }))),
});

export const ApiKeyListQuerySchema = t.Object({
  projectId: t.Optional(t.String({ format: "uuid" })),
});

export const ApiKeySchema = t.Object({
  id: t.String(),
  prefix: t.String(),
  name: t.String(),
  projectId: t.Nullable(t.String()),
  projectName: t.Nullable(t.String()),
  lastUsedAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
});

export const ApiKeyCreatedSchema = t.Object({
  id: t.String(),
  key: t.String({ description: "Full API key — shown only once" }),
  prefix: t.String(),
  name: t.String(),
  projectId: t.Nullable(t.String()),
  createdAt: t.Date(),
});

export const ApiKeyListResponseSchema = t.Array(ApiKeySchema);

export type ApiKeyIdParam = Static<typeof ApiKeyIdParamSchema>;
export type CreateApiKeyBody = Static<typeof CreateApiKeyBodySchema>;
export type ApiKeyListQuery = Static<typeof ApiKeyListQuerySchema>;
export type ApiKey = Static<typeof ApiKeySchema>;
export type ApiKeyCreated = Static<typeof ApiKeyCreatedSchema>;
