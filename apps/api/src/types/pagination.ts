import { t, type Static, type TSchema } from "elysia";

/**
 * Base pagination query schema
 */
export const PaginationQueryBaseSchema = t.Object({
  page: t.Integer({ minimum: 1, default: 1 }),
  limit: t.Integer({ minimum: 1, maximum: 100, default: 20 }),
});

/**
 * Creates a pagination query schema by extending the base schema with additional fields
 * @param itemSchema - Additional fields to include in the pagination query
 * @returns Combined pagination query schema
 */
export const PaginationQuerySchema = <T extends TSchema>(itemSchema: T) =>
  t.Composite([PaginationQueryBaseSchema, itemSchema]);

export type PaginationQuery = Static<typeof PaginationQueryBaseSchema>;

/**
 * Sort order options
 */
export const SortOrderSchema = t.Union([t.Literal("asc"), t.Literal("desc")]);

export type SortOrder = Static<typeof SortOrderSchema>;

/**
 * Reusable date range filter. Accepts ISO 8601 strings and coerces them
 * into Date objects at the validation boundary.
 */
export const DateRangeQuerySchema = t.Object({
  from: t.Optional(t.Date({ description: "Start of date range (ISO 8601)" })),
  to: t.Optional(t.Date({ description: "End of date range (ISO 8601)" })),
});

export const DateRangeRequiredQuerySchema = t.Object({
  from: t.Date({ description: "Start of date range (ISO 8601)" }),
  to: t.Date({ description: "End of date range (ISO 8601)" }),
});

export type DateRange = Static<typeof DateRangeQuerySchema>;
export type RequiredDateRange = Static<typeof DateRangeRequiredQuerySchema>;
