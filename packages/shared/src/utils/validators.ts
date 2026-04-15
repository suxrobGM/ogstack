/**
 * Regex pattern to validate IPv4 addresses.
 */
const IP_ADDRESS_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Validate if the given string is a valid IP address.
 */
export function isValidIpAddress(ip: string): boolean {
  return IP_ADDRESS_REGEX.test(ip);
}

/**
 * Regex for a bare hostname: labels separated by dots, each label 1-63 chars of
 * [a-z0-9-] and not starting with a hyphen. At least two labels (so "example.com"
 * passes but "localhost" does not). No protocol, path, port, or IPs.
 */
export const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?:\.(?!-)[a-z0-9-]{1,63})+$/i;

export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain);
}

/**
 * Validate if the given string is a well-formed http(s) URL.
 */
export function isValidHttpUrl(raw: string): boolean {
  if (!raw || raw.trim().length === 0) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parse a comma- or newline-separated list of domains into a normalized
 * (trimmed, lowercased, de-duplicated) array. Caller is responsible for
 * validating each entry with `isValidDomain`.
 */
export function parseDomainList(input: string): string[] {
  const parts = input
    .split(/[,\n]/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

/**
 * Map a provider-specific AI model ID (e.g. `fal-ai/flux-2-pro`) to a
 * user-facing generic label. Keeps the underlying model implementation hidden
 * from the UI so we can swap vision models without touching frontend copy.
 */
export function aiModelLabel(modelId: string | null | undefined): "Standard" | "Pro" | null {
  if (!modelId) return null;
  const lower = modelId.toLowerCase();
  if (lower.includes("pro")) return "Pro";
  return "Standard";
}
