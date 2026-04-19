"use client";

import type { ReactElement } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, Divider, IconButton, List, Stack, Tooltip, Typography } from "@mui/material";
import { isAdminRole } from "@ogstack/shared";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons/app-logo";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";
import { isNavGroup } from "./constants";
import { FeedbackMenu } from "./feedback-menu";
import { NavGroupItem } from "./nav-group";
import { NavItem } from "./nav-item";
import { NotificationBell } from "./notification-bell";
import type { ShellConfig } from "./shell-config";
import { UserMenu } from "./user-menu";

export const SIDEBAR_WIDTH_EXPANDED = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  config: ShellConfig;
}

export function Sidebar(props: SidebarProps): ReactElement {
  const { collapsed, onToggle, config } = props;
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        flexShrink: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        bgcolor: "surfaces.elevated",
        borderRight: `1px solid ${line.border}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: `width ${motion.standard}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: collapsed ? 1.5 : 3,
          pb: collapsed ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Stack spacing={0.25}>
            <AppLogo />
            {config.subtitle && <Typography variant="overlineMuted">{config.subtitle}</Typography>}
          </Stack>
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: line.divider }} />

      {config.headerAction && (
        <>
          <Box sx={{ px: collapsed ? 1 : 2, py: 1.5 }}>
            {collapsed ? (
              <Tooltip title={config.headerAction.label} placement="right" arrow>
                <IconButton
                  component={NextLink}
                  href={config.headerAction.href as never}
                  size="small"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                href={config.headerAction.href as never}
                size="small"
                fullWidth
                startIcon={<ArrowBackIcon fontSize="small" />}
                sx={{ justifyContent: "flex-start", color: "text.secondary" }}
              >
                {config.headerAction.label}
              </Button>
            )}
          </Box>
          <Divider sx={{ borderColor: line.divider }} />
        </>
      )}

      <List sx={{ flex: 1, px: collapsed ? 0.5 : 1, py: 1, overflow: "auto" }}>
        {config.navItems.map((item) => {
          if (isNavGroup(item)) {
            return (
              <NavGroupItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
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
              collapsed={collapsed}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          );
        })}
        {config.showAdminLink && isAdmin && (
          <NavItem
            label="Admin Panel"
            href={ROUTES.adminOverview}
            icon={<AdminPanelSettingsIcon fontSize="small" />}
            collapsed={collapsed}
            active={false}
          />
        )}
      </List>
      <Divider sx={{ borderColor: line.divider }} />
      {collapsed ? (
        <Stack sx={{ alignItems: "center", gap: 0.5, py: 1.5 }}>
          <FeedbackMenu collapsed />
          <NotificationBell collapsed />
        </Stack>
      ) : (
        <List sx={{ px: 1.5, py: 1 }}>
          <FeedbackMenu />
          <NotificationBell />
        </List>
      )}
      <Divider sx={{ borderColor: line.divider }} />
      <Box sx={{ p: collapsed ? 0.5 : 1 }}>
        <UserMenu collapsed={collapsed} />
      </Box>
    </Box>
  );
}
