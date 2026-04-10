"use client";

import type { ReactElement } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { radii } from "@/theme/tokens";

interface NotificationBellProps {
  collapsed?: boolean;
}

export function NotificationBell(props: NotificationBellProps): ReactElement {
  const { collapsed = false } = props;
  const unreadCount = 0;

  const icon = (
    <Badge
      badgeContent={unreadCount}
      max={99}
      invisible={unreadCount === 0}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.6rem",
          height: 16,
          minWidth: 16,
          bgcolor: "accent.sunset",
          color: "#052e16",
        },
      }}
    >
      <NotificationsIcon fontSize="small" />
    </Badge>
  );

  if (collapsed) {
    return (
      <Tooltip title="Notifications" placement="right" arrow>
        <IconButton
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <ListItemButton sx={{ borderRadius: `${radii.md}px`, px: 2, mb: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>{icon}</ListItemIcon>
      <ListItemText primary={<Typography variant="body2">Notifications</Typography>} />
    </ListItemButton>
  );
}
