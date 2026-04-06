/**
 * API key types — defined manually because Eden Treaty cannot resolve
 * the hyphenated "api-keys" route segment via type-level property access.
 * Mirrors ApiKeySchema / ApiKeyListResponseSchema from the backend.
 */
export interface ApiKey {
  id: string;
  prefix: string;
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export type ApiKeyListResponse = ApiKey[];
