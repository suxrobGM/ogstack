/** Result of a URL validation check. */
export interface UrlValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Checks whether an IPv4 address falls within a private or reserved range.
 * Covers 0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16,
 * 172.16.0.0/12, and 192.168.0.0/16.
 *
 * Returns false for non-IPv4 hostnames (domain names).
 */
export function isPrivateIp(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;

  const octets = parts.map(p => (/^\d{1,3}$/.test(p) ? parseInt(p, 10) : -1));
  if (octets.some(o => o < 0 || o > 255)) return false;

  const [a = -1, b = -1] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function extractIPv4FromMappedIPv6(bare: string): string | null {
  if (!bare.startsWith('::ffff:')) return null;

  const remainder = bare.slice(7);
  const hexParts = remainder.split(':');
  if (hexParts.length !== 2) return null;

  const high = parseInt(hexParts[0]!, 16);
  const low = parseInt(hexParts[1]!, 16);
  if (isNaN(high) || isNaN(low)) return null;

  return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
}

function isBlockedIPv6(bare: string): boolean {
  const lower = bare.toLowerCase();

  if (lower === '::1') return true;
  if (lower.startsWith('fe80:')) return true;

  const mapped = extractIPv4FromMappedIPv6(lower);
  if (mapped !== null) return isPrivateIp(mapped);

  return false;
}

/**
 * Validates a URL for SSRF safety. Parses with the WHATWG URL constructor
 * (which normalizes hex, octal, decimal, and short-form IPs) then checks
 * the resolved hostname against blocked ranges.
 *
 * Rejects: private IPv4 ranges, localhost, link-local (169.254.x.x),
 * IPv6 loopback/link-local, IPv4-mapped IPv6, non-http(s) protocols,
 * and malformed URLs.
 */
export function validateUrl(url: string): UrlValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Disallowed protocol: ${parsed.protocol}` };
  }

  const { hostname } = parsed;

  if (!hostname) {
    return { valid: false, reason: 'No hostname in URL' };
  }

  if (hostname.startsWith('[')) {
    const bare = hostname.slice(1, -1);
    if (isBlockedIPv6(bare)) {
      return { valid: false, reason: 'URL resolves to a blocked address range' };
    }
    return { valid: true };
  }

  if (hostname === 'localhost') {
    return { valid: false, reason: 'URL resolves to a blocked address range' };
  }

  if (isPrivateIp(hostname)) {
    return { valid: false, reason: 'URL resolves to a blocked address range' };
  }

  return { valid: true };
}
