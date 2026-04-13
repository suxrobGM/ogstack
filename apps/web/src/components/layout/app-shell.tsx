"use client";

import { useState, type PropsWithChildren, type ReactElement } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";
import { MobileNav } from "./mobile-nav";
import { getShellConfig, type ShellVariant } from "./shell-config";
import { Sidebar, SIDEBAR_WIDTH_EXPANDED } from "./sidebar";

interface AppShellProps extends PropsWithChildren {
  variant?: ShellVariant;
}

export function AppShell(props: AppShellProps): ReactElement {
  const { children, variant = "dashboard" } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = getShellConfig(variant);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          bgcolor: "surfaces.card",
          borderBottom: `1px solid ${line.border}`,
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ color: "text.primary", mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5">{config.mobileTitle}</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH_EXPANDED,
            bgcolor: "surfaces.elevated",
            borderRight: `1px solid ${line.border}`,
            backgroundImage: "none",
          },
        }}
      >
        <MobileNav onClose={() => setMobileOpen(false)} config={config} />
      </Drawer>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} config={config} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "surfaces.base",
          p: { xs: 2, md: 4 },
          pt: { xs: 9, md: 4 },
          overflow: "auto",
          transition: `margin-left ${motion.standard}`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
