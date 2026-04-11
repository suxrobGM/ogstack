"use client";

import type { ReactElement } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PaymentIcon from "@mui/icons-material/Payment";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Box, Divider, IconButton, List, Stack, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS } from "@/lib/constants";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";
import { FeedbackMenu } from "./feedback-menu";
import { NavItem } from "./nav-item";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 68;

const ICON_MAP: Record<string, ReactElement> = {
  dashboard: <DashboardIcon fontSize="small" />,
  folder: <FolderIcon fontSize="small" />,
  vpnKey: <VpnKeyIcon fontSize="small" />,
  payment: <PaymentIcon fontSize="small" />,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar(props: SidebarProps): ReactElement {
  const { collapsed, onToggle } = props;
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        flexShrink: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        bgcolor: "aubergine.surface",
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
        {!collapsed && <Typography variant="h5">OGStack</Typography>}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: line.divider }} />
      <List sx={{ flex: 1, px: collapsed ? 1 : 1.5, py: 2 }}>
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={ICON_MAP[item.icon]}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
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
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <UserMenu collapsed={collapsed} />
      </Box>
    </Box>
  );
}
