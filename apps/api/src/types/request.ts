import { t, type Static } from "elysia";

/**
 * ID parameter schema with string type ID
 */
export const StringIdParamSchema = t.Object({
  id: t.String(),
});

/**
 * ID parameter schema with number type ID
 */
export const NumberIdParamSchema = t.Object({
  id: t.Number(),
});

/**
 * ID parameter schema with UUID-formatted string ID.
 * Use for route params whose underlying Prisma column is `@db.Uuid`.
 */
export const UuidIdParamSchema = t.Object({
  id: t.String({ format: "uuid" }),
});

export type StringIdParam = Static<typeof StringIdParamSchema>;
export type NumberIdParam = Static<typeof NumberIdParamSchema>;
export type UuidIdParam = Static<typeof UuidIdParamSchema>;
