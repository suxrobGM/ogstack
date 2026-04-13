"use client";

import type { ReactElement } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { Box, Button, Divider, IconButton, List, Stack, Tooltip, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";
import { FeedbackMenu } from "./feedback-menu";
import { NavItem } from "./nav-item";
import { NotificationBell } from "./notification-bell";
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from "./sidebar";
import { UserMenu } from "./user-menu";

const ICON_MAP: Record<string, ReactElement> = {
  dashboard: <DashboardIcon fontSize="small" />,
  groups: <GroupsIcon fontSize="small" />,
  photoLibrary: <PhotoLibraryIcon fontSize="small" />,
};

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar(props: AdminSidebarProps): ReactElement {
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
            <Typography variant="h5">OGStack</Typography>
            <Typography variant="overlineMuted">Admin</Typography>
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

      <Box sx={{ px: collapsed ? 1 : 2, py: 1.5 }}>
        {collapsed ? (
          <Tooltip title="Back to Dashboard" placement="right" arrow>
            <IconButton component={NextLink} href={ROUTES.overview} size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            component={NextLink}
            href={ROUTES.overview}
            size="small"
            fullWidth
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{ justifyContent: "flex-start", color: "text.secondary" }}
          >
            Back to Dashboard
          </Button>
        )}
      </Box>
      <Divider sx={{ borderColor: line.divider }} />

      <List sx={{ flex: 1, px: collapsed ? 1 : 1.5, py: 2, overflow: "auto" }}>
        {ADMIN_NAV_ITEMS.map((item) => (
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
      <Box sx={{ p: collapsed ? 0.5 : 1 }}>
        <UserMenu collapsed={collapsed} />
      </Box>
    </Box>
  );
}
