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
  projectDetail: (id: string) => `/projects/${id}` as Route,
  apiKeys: "/api-keys" as Route,
  billing: "/billing" as Route,
  notifications: "/notifications" as Route,
  settings: "/settings/profile" as Route,
  settingsProfile: "/settings/profile" as Route,
  settingsSecurity: "/settings/security" as Route,
  playground: "/playground" as Route,
  templates: "/templates" as Route,
  images: "/images" as Route,
  pricing: "/pricing" as Route,
  adminOverview: "/admin/overview" as Route,
  adminUsers: "/admin/users" as Route,
  adminUserDetail: (id: string) => `/admin/users/${id}` as Route,
  adminImages: "/admin/images" as Route,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const SIDEBAR_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.overview, icon: "dashboard" },
  { label: "Projects", href: ROUTES.projects, icon: "folder" },
  { label: "Playground", href: ROUTES.playground, icon: "playCircle" },
  { label: "Templates", href: ROUTES.templates, icon: "library" },
  { label: "Images", href: ROUTES.images, icon: "photoLibrary" },
  { label: "API Keys", href: ROUTES.apiKeys, icon: "vpnKey" },
  { label: "Billing", href: ROUTES.billing, icon: "payment" },
  { label: "Settings", href: ROUTES.settings, icon: "settings" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.adminOverview, icon: "dashboard" },
  { label: "Users", href: ROUTES.adminUsers, icon: "groups" },
  { label: "Images", href: ROUTES.adminImages, icon: "photoLibrary" },
] as const;
