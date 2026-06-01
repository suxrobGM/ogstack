import type { Treaty } from "@elysiajs/eden";

/**
 * Shorthand for Treaty.Data - extracts data from an endpoint method reference.
 * Usage: Data<typeof client.api.auth.login.post>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Data<T extends (...args: any[]) => any> = NonNullable<Treaty.Data<T>>;

/**
 * Extract the request body type from an Eden Treaty POST/PATCH/PUT endpoint.
 * Usage: Body<typeof client.api.auth.login.post>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Body<T extends (...args: any[]) => any> = NonNullable<Parameters<T>[0]>;

/**
 * Extract the query-parameter type from an Eden Treaty GET endpoint.
 * Usage: Query<typeof client.api.images.get>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Query<T extends (...args: any[]) => any> = NonNullable<
  NonNullable<Parameters<T>[0]>["query"]
>;
