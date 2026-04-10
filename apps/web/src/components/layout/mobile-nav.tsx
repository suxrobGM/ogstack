"use client";

import type { ReactElement } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Box, Divider, List, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS } from "@/lib/constants";
import { line } from "@/theme/palette";
import { FeedbackMenu } from "./feedback-menu";
import { NavItem } from "./nav-item";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

const ICON_MAP: Record<string, ReactElement> = {
  dashboard: <DashboardIcon fontSize="small" />,
  folder: <FolderIcon fontSize="small" />,
  vpnKey: <VpnKeyIcon fontSize="small" />,
};

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav(props: MobileNavProps): ReactElement {
  const { onClose } = props;
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onClick={onClose}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5">OGStack</Typography>
      </Box>
      <Divider sx={{ borderColor: line.divider }} />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={ICON_MAP[item.icon]}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
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
