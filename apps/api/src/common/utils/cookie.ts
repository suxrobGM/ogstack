import type { Cookie } from "elysia";
import type { AuthResponse } from "@/modules/auth/auth.schema";

const IS_PROD = process.env.NODE_ENV === "production";

const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

/**
 * Parses a duration string (e.g. "15m", "2h") into seconds.
 * If the input is invalid or missing, returns the provided fallback value.
 */
function parseExpiry(expiry: string | undefined, fallback: number): number {
  if (!expiry) {
    return fallback;
  }

  const match = /^(\d+)([smhdw]?)$/.exec(expiry.trim());
  if (!match) {
    return fallback;
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2] || "s";
  return value * (UNIT_SECONDS[unit] ?? 1);
}

/**
 * Sets the access and refresh token cookies based on the authentication response.
 * @param cookie The cookie object from Elysia request context
 * @param result The authentication response containing access and refresh tokens
 */
export function setAuthCookies(cookie: Record<string, Cookie<unknown>>, result: AuthResponse) {
  const accessMaxAge = parseExpiry(process.env.JWT_EXPIRY, 24 * 60 * 60);
  const refreshMaxAge = parseExpiry(process.env.REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60);

  cookie.access_token!.value = result.accessToken;
  cookie.access_token!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  cookie.refresh_token!.value = result.refreshToken;
  cookie.refresh_token!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    path: "/api/auth",
    maxAge: refreshMaxAge,
  });
}

/**
 * Clears the authentication cookies by setting their values to empty and maxAge to 0.
 * @param cookie The cookie object from Elysia request context
 */
export function clearAuthCookies(cookie: Record<string, Cookie<unknown>>) {
  cookie.access_token!.value = "";
  cookie.access_token!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    path: "/",
    maxAge: 0,
  });

  cookie.refresh_token!.value = "";
  cookie.refresh_token!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "strict" : "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

/**
 * Sets the OAuth state cookie used for CSRF protection during OAuth flows.
 * @param cookie The cookie object from Elysia request context
 * @param state The random state string to store
 */
export function setOAuthStateCookie(cookie: Record<string, Cookie<unknown>>, state: string) {
  cookie.oauth_state!.value = state;
  cookie.oauth_state!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
}

/**
 * Clears the OAuth state cookie after callback validation.
 * @param cookie The cookie object from Elysia request context
 */
export function clearOAuthStateCookie(cookie: Record<string, Cookie<unknown>>) {
  cookie.oauth_state!.value = "";
  cookie.oauth_state!.set({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

/**
 * Reads the stored OAuth state value from the cookie.
 * @param cookie The cookie object from Elysia request context
 */
export function getOAuthStateCookie(cookie: Record<string, Cookie<unknown>>): string | undefined {
  return cookie.oauth_state?.value as string | undefined;
}
