import { API_BASE_URL, ROUTES } from "./constants";

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Wraps the global `fetch` with silent token-refresh logic.
 *
 * On a 401 response the interceptor calls `POST /api/auth/refresh`, which
 * exchanges the `refresh_token` httpOnly cookie for a fresh `access_token`
 * cookie, then retries the original request once. If the refresh also fails
 * the user is redirected to the login page.
 */
export async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  // Don't intercept auth endpoints to avoid redirect loops
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("/api/auth/")) {
    return response;
  }

  if (!refreshPromise) {
    refreshPromise = tryRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (!refreshed) {
    window.location.href = ROUTES.login;
    return response;
  }

  return fetch(input, init);
}
