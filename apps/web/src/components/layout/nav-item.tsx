"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Link,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { accent } from "@/theme";
import { radii } from "@/theme/tokens";

interface NavItemProps {
  label: string;
  href: string;
  active: boolean;
  icon?: ReactNode;
  collapsed?: boolean;
}

export function NavItem(props: NavItemProps): ReactElement {
  const { label, href, active, icon, collapsed = false } = props;

  const button = (
    <Link
      href={href}
      sx={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        mb: 0.5,
        borderRadius: `${radii.md}px`,
        "&:hover": { textDecoration: "none" },
      }}
    >
      <ListItemButton
        selected={active}
        sx={{
          borderRadius: `${radii.md}px`,
          py: 1,
          px: collapsed ? 1.5 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          minHeight: 40,
          "&.Mui-selected": {
            bgcolor: "rgba(180,83,9,0.08)",
            borderLeft: collapsed ? "none" : `2px solid ${accent.primary}`,
            "&:hover": { bgcolor: "rgba(180,83,9,0.12)" },
          },
          "&:hover:not(.Mui-selected)": {
            bgcolor: "rgba(44,40,37,0.04)",
          },
        }}
      >
        {icon && (
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 36,
              color: active ? "accent.primary" : "text.secondary",
              justifyContent: "center",
            }}
          >
            {icon}
          </ListItemIcon>
        )}
        {!collapsed && (
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400 }}>
                {label}
              </Typography>
            }
          />
        )}
      </ListItemButton>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip title={label} placement="right" arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}
