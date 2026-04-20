const IP_ADDRESS_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export function isValidIpAddress(ip: string): boolean {
  return IP_ADDRESS_REGEX.test(ip);
}

/** Bare hostname: 2+ labels of [a-z0-9-], no leading hyphen. No IPs or localhost. */
export const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?:\.(?!-)[a-z0-9-]{1,63})+$/i;

export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain);
}

/**
 * True when `hostname` is equal to `domain` or a subdomain of it.
 * Both inputs are compared case-insensitively.
 */
export function hostMatchesDomain(hostname: string, domain: string): boolean {
  const host = hostname.toLowerCase();
  const normalized = domain.toLowerCase();
  return host === normalized || host.endsWith(`.${normalized}`);
}

/**
 * http(s) URL with a real-looking hostname. Rejects whitespace and junk authorities
 *  that WHATWG's URL parser otherwise tolerates (e.g. `https://foo.com$`).
 */
export function isValidHttpUrl(raw: string): boolean {
  if (!raw || raw.trim().length === 0) {
    return false;
  }
  if (/\s/.test(raw)) {
    return false;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname;
    if (!host) {
      return false;
    }
    return isValidDomain(host) || isValidIpAddress(host) || host === "localhost";
  } catch {
    return false;
  }
}

/**
 * Split a comma/newline list into trimmed, lowercased, de-duplicated domains.
 *  Caller validates each entry with `isValidDomain`.
 */
export function parseDomainList(input: string): string[] {
  const parts = input
    .split(/[,\n]/)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

/**
 * Provider-specific AI model ID (e.g. `fal-ai/flux-2-pro`) → generic UI label,
 *  so we can swap vendors without touching frontend copy.
 */
export function aiModelLabel(modelId: string | null | undefined): "Standard" | "Pro" | null {
  if (!modelId) {
    return null;
  }
  const lower = modelId.toLowerCase();
  if (lower.includes("pro")) {
    return "Pro";
  }
  return "Standard";
}
