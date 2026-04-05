import * as dns from "node:dns/promises";
import * as net from "node:net";
import { BadRequestError } from "@/common/errors";

const BLOCKED_IPV4_RANGES = [
  { prefix: "10.", mask: null },
  { prefix: "127.", mask: null },
  { prefix: "169.254.", mask: null },
  { prefix: "192.168.", mask: null },
  { prefix: "0.", mask: null },
];

const BLOCKED_IPV4_172 = { min: 16, max: 31 };

const BLOCKED_IPV6 = ["::1", "::ffff:127.0.0.1", "fe80::", "fc00::", "fd00::"];

function isPrivateIPv4(ip: string): boolean {
  for (const range of BLOCKED_IPV4_RANGES) {
    if (ip.startsWith(range.prefix)) return true;
  }

  if (ip.startsWith("172.")) {
    const secondOctet = parseInt(ip.split(".")[1] ?? "0");
    if (secondOctet >= BLOCKED_IPV4_172.min && secondOctet <= BLOCKED_IPV4_172.max) return true;
  }

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return BLOCKED_IPV6.some((blocked) => normalized.startsWith(blocked));
}

/** Returns true if the IP address is in a private, loopback, or link-local range. */
export function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return false;
}

/**
 * Validates a URL for safe server-side fetching.
 * Blocks private IPs, localhost, and non-HTTP(S) schemes.
 */
export async function validateUrlForFetch(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BadRequestError("Only HTTP and HTTPS URLs are allowed");
  }

  const hostname = url.hostname;

  if (hostname === "localhost" || hostname === "[::1]") {
    throw new BadRequestError("Requests to localhost are not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new BadRequestError("Requests to private IP addresses are not allowed");
    }
    return url;
  }

  const { address } = await dns.lookup(hostname);
  if (isPrivateIP(address)) {
    throw new BadRequestError("URL resolves to a private IP address");
  }

  return url;
}
