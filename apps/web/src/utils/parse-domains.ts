/**
 * Parse a comma-separated string of domains into a trimmed, non-empty array.
 */
export function parseDomains(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
}
