"use client";

import type { ReactElement } from "react";
import { Box, Divider, List, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_ITEMS } from "@/lib/constants";
import { line } from "@/theme/palette";
import { NavItem } from "./nav-item";
import { UserMenu } from "./user-menu";

const SIDEBAR_WIDTH = 260;

export function Sidebar(): ReactElement {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "aubergine.surface",
        borderRight: `1px solid ${line.border}`,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
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
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </List>
      <Divider sx={{ borderColor: line.divider }} />
      <Box sx={{ p: 1.5 }}>
        <UserMenu />
      </Box>
    </Box>
  );
}
