"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar, Box, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { useAuth } from "@/hooks";
import { motion, radii } from "@/theme/tokens";

export function UserMenu(): ReactElement {
  const { user, logout, isLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          borderRadius: `${radii.md}px`,
          cursor: "pointer",
          transition: motion.fast,
          "&:hover": { bgcolor: "aubergine.hi" },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.875rem",
            fontWeight: 600,
            bgcolor: "accent.violet",
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="captionMuted" noWrap>
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={handleLogout} disabled={isLoading}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
