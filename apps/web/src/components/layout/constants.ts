import { ROUTES } from "@/lib/constants";

export interface NavLeaf {
  label: string;
  href: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  icon: string;
  children: readonly NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const SIDEBAR_NAV_ITEMS: readonly NavEntry[] = [
  { label: "Overview", href: ROUTES.overview, icon: "dashboard" },
  { label: "Projects", href: ROUTES.projects, icon: "folder" },
  { label: "Playground", href: ROUTES.playground, icon: "playCircle" },
  {
    label: "Library",
    icon: "library",
    children: [
      { label: "Templates", href: ROUTES.templates, icon: "library" },
      { label: "Images", href: ROUTES.images, icon: "photoLibrary" },
      { label: "Audits", href: ROUTES.audits, icon: "verified" },
    ],
  },
  {
    label: "Account",
    icon: "settings",
    children: [
      { label: "API Keys", href: ROUTES.apiKeys, icon: "vpnKey" },
      { label: "Billing", href: ROUTES.billing, icon: "payment" },
      { label: "Settings", href: ROUTES.settings, icon: "settings" },
    ],
  },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.adminOverview, icon: "dashboard" },
  { label: "Users", href: ROUTES.adminUsers, icon: "groups" },
  { label: "Images", href: ROUTES.adminImages, icon: "photoLibrary" },
] as const;
