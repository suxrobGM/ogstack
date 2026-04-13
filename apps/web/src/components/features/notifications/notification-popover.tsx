"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentIcon from "@mui/icons-material/Payment";
import SpeedIcon from "@mui/icons-material/Speed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { ROUTES } from "@/lib/constants";
import { radii } from "@/theme/tokens";
import { formatRelativeTime } from "@/utils/formatters";

interface NotificationPopoverProps {
  collapsed?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: ReactElement; color: string }> = {
  USAGE_ALERT: { icon: <SpeedIcon fontSize="small" />, color: "info.main" },
  QUOTA_EXCEEDED: { icon: <WarningAmberIcon fontSize="small" />, color: "warning.main" },
  BILLING_EVENT: { icon: <PaymentIcon fontSize="small" />, color: "success.main" },
  SYSTEM_ANNOUNCEMENT: { icon: <CampaignIcon fontSize="small" />, color: "primary.main" },
};

export function NotificationPopover(props: NotificationPopoverProps): ReactElement {
  const { collapsed = false } = props;
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (id: string, actionUrl?: string | null) => {
    markAsRead.mutate([id]);
    if (actionUrl) {
      router.push(actionUrl as never);
      handleClose();
    }
  };

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
          bgcolor: "accent.primary",
          color: "#FFFFFF",
        },
      }}
    >
      <NotificationsIcon fontSize="small" />
    </Badge>
  );

  const trigger = collapsed ? (
    <Tooltip title="Notifications" placement="right" arrow>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  ) : (
    <ListItemButton onClick={handleOpen} sx={{ borderRadius: `${radii.md}px`, px: 2 }}>
      <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>{icon}</ListItemIcon>
      <ListItemText primary={<Typography variant="body2">Notifications</Typography>} />
    </ListItemButton>
  );

  return (
    <>
      {trigger}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
        slotProps={{
          paper: { sx: { width: 360, maxHeight: 480 } },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllAsRead.mutate()}
              sx={{ textTransform: "none", fontSize: "0.75rem" }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {isLoading ? "Loading..." : "No notifications yet"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 340, overflow: "auto" }}>
            {notifications.map((notification) => {
              const config = TYPE_CONFIG[notification.type] ?? {
                icon: <CampaignIcon fontSize="small" />,
                color: "primary.main",
              };
              const isUnread = !notification.readAt;

              return (
                <Box
                  key={notification.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    borderLeft: isUnread ? 3 : 0,
                    borderColor: "accent.primary",
                    bgcolor: isUnread ? "rgba(16, 185, 129, 0.04)" : "transparent",
                    "&:hover": { bgcolor: "surfaces.hover" },
                  }}
                  onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                >
                  <Box sx={{ color: config.color, mt: 0.25, mr: 1.5, flexShrink: 0 }}>
                    {config.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isUnread ? 600 : 400, lineHeight: 1.3 }}
                      noWrap
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {formatRelativeTime(notification.createdAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(notification.id);
                    }}
                    sx={{
                      ml: 0.5,
                      mt: -0.25,
                      color: "text.disabled",
                      "&:hover": { color: "text.secondary" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}

        <Divider />
        <Box sx={{ p: 1.5, textAlign: "center" }}>
          <Button
            size="small"
            fullWidth
            onClick={() => {
              router.push(ROUTES.notifications as never);
              handleClose();
            }}
            sx={{ textTransform: "none" }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}
