/**
 * Auto-prepend `https://` to a URL input once the user has typed something
 * that looks like a host (contains a dot) and hasn't already supplied a scheme.
 *
 * Used by both the dashboard playground (via TanStack Form's `transform` prop)
 * and the landing playground (via a plain `onChange` handler) so URL inputs
 * behave identically across the app.
 */
export function normalizeUrlInput(value: string): string {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!value.includes(".")) return value;
  return `https://${value}`;
}
