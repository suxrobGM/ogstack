"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/display/user-avatar";
import { useAuth } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { iconSizes, motion, radii } from "@/theme/tokens";
import { planChipColor } from "@/utils/plan";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu(props: UserMenuProps): ReactElement {
  const { collapsed = false } = props;
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleNavigate = (route: string) => {
    handleClose();
    router.push(route as Route);
  };

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const trigger = (
    <Box
      onClick={handleOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 1,
        p: 0.5,
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: `${radii.md}px`,
        cursor: "pointer",
        transition: motion.fast,
        "&:hover": { bgcolor: "surfaces.hover" },
      }}
    >
      <UserAvatar name={fullName} email={user?.email} size={32} />
      {!collapsed && (
        <>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: "0.8125rem" }}>
                {fullName}
              </Typography>
              {user?.plan && (
                <Chip
                  label={user.plan}
                  size="small"
                  color={planChipColor(user.plan)}
                  variant="filled"
                  sx={{ fontSize: "0.6rem", height: 18 }}
                />
              )}
            </Stack>
            <Typography variant="captionMuted" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <UnfoldMoreIcon sx={{ fontSize: iconSizes.xs, color: "text.disabled", flexShrink: 0 }} />
        </>
      )}
    </Box>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title={fullName || "Account"} placement="right" arrow>
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1.5, alignItems: "center" }}>
          <UserAvatar name={fullName} email={user?.email} size={36} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {fullName}
            </Typography>
            <Typography variant="captionMuted" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleNavigate(ROUTES.settingsProfile)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate(ROUTES.settingsSecurity)}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} disabled={isLoading} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
