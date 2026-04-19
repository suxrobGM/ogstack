import { ROUTES } from "@/lib/constants";
import { ADMIN_NAV_ITEMS, SIDEBAR_NAV_ITEMS, type NavEntry } from "./constants";

export type ShellVariant = "dashboard" | "admin";

export interface HeaderAction {
  label: string;
  href: string;
  icon: "arrowBack";
}

export interface ShellConfig {
  subtitle?: string;
  navItems: readonly NavEntry[];
  headerAction?: HeaderAction;
  showAdminLink: boolean;
}

export function getShellConfig(variant: ShellVariant): ShellConfig {
  if (variant === "admin") {
    return {
      subtitle: "Admin",
      navItems: ADMIN_NAV_ITEMS,
      headerAction: { label: "Back to Dashboard", href: ROUTES.overview, icon: "arrowBack" },
      showAdminLink: false,
    };
  }
  return {
    navItems: SIDEBAR_NAV_ITEMS,
    showAdminLink: true,
  };
}
