import type { Route } from "next";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  docs: "/docs" as Route,
  overview: "/overview" as Route,
  projects: "/projects" as Route,
  apiKeys: "/api-keys" as Route,
} as const;

export const COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  timezone: "timezone",
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const SIDEBAR_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.overview, icon: "dashboard" },
  { label: "Projects", href: ROUTES.projects, icon: "folder" },
  { label: "API Keys", href: ROUTES.apiKeys, icon: "vpnKey" },
] as const;
