"use client";

import type { ReactElement } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Box, Divider, List, Stack, Typography } from "@mui/material";
import { isAdminRole } from "@ogstack/shared";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons/app-logo";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { line } from "@/theme/palette";
import { isNavGroup } from "./constants";
import { FeedbackMenu } from "./feedback-menu";
import { NavGroupItem } from "./nav-group";
import { NavItem } from "./nav-item";
import { NotificationBell } from "./notification-bell";
import type { ShellConfig } from "./shell-config";
import { UserMenu } from "./user-menu";

interface MobileNavProps {
  onClose: () => void;
  config: ShellConfig;
}

export function MobileNav(props: MobileNavProps): ReactElement {
  const { onClose, config } = props;
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }} onClick={onClose}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack spacing={0.25}>
          <AppLogo />
          {config.subtitle && <Typography variant="overlineMuted">{config.subtitle}</Typography>}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: line.divider }} />
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {config.navItems.map((item) => {
          if (isNavGroup(item)) {
            return (
              <NavGroupItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                children={item.children.map((child) => ({
                  label: child.label,
                  href: child.href,
                  icon: child.icon,
                }))}
              />
            );
          }
          return (
            <NavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          );
        })}
        {config.showAdminLink && isAdmin && (
          <NavItem
            label="Admin Panel"
            href={ROUTES.adminOverview}
            icon={<AdminPanelSettingsIcon fontSize="small" />}
            active={false}
          />
        )}
      </List>
      <Divider sx={{ borderColor: line.divider }} />
      <List sx={{ px: 1.5, py: 1 }} onClick={(e) => e.stopPropagation()}>
        <FeedbackMenu />
        <NotificationBell />
      </List>
      <Divider sx={{ borderColor: line.divider }} />
      <Box sx={{ p: 1.5 }} onClick={(e) => e.stopPropagation()}>
        <UserMenu />
      </Box>
    </Box>
  );
}
