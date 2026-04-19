import type { Route } from "next";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
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
  analytics: "/analytics" as Route,
  templates: "/templates" as Route,
  images: "/images" as Route,
  audit: "/audit" as Route,
  auditDetail: (id: string) => `/audit/${id}` as Route,
  audits: "/audits" as Route,
  auditsDetail: (id: string) => `/audits/${id}` as Route,
  pricing: "/pricing" as Route,
  features: "/features" as Route,
  howItWorks: "/how-it-works" as Route,
  aiShowcase: "/ai-showcase" as Route,
  templateGallery: "/template-gallery" as Route,
  compare: "/compare" as Route,
  about: "/about" as Route,
  contact: "/contact" as Route,
  privacy: "/privacy" as Route,
  terms: "/terms" as Route,
  adminOverview: "/admin/overview" as Route,
  adminUsers: "/admin/users" as Route,
  adminUserDetail: (id: string) => `/admin/users/${id}` as Route,
  adminImages: "/admin/images" as Route,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:5002";
export const API_DOCS_URL = `${DOCS_URL}/swagger`;
