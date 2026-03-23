export interface UrlValidationResult {
  valid: boolean;
  reason?: string;
}

function isPrivateIPv4(hostname: string): boolean {
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
  if (mapped !== null) return isPrivateIPv4(mapped);

  return false;
}

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

  if (isPrivateIPv4(hostname)) {
    return { valid: false, reason: 'URL resolves to a blocked address range' };
  }

  return { valid: true };
}
