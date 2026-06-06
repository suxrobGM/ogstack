const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL;

/**
 * API base URL - uses internal URL for server-side requests (Docker networking)
 * and public URL for client-side requests (browser).
 * Falls back to the public URL when INTERNAL_API_URL is not configured (local dev).
 */
export const API_BASE_URL =
  typeof window === "undefined" ? (INTERNAL_API_URL ?? NEXT_PUBLIC_API_URL) : NEXT_PUBLIC_API_URL;

export const COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  timezone: "timezone",
} as const;
