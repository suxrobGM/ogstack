"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { accent } from "@/theme";
import { radii } from "@/theme/tokens";
import { NavItem } from "./nav-item";

interface NavGroupChild {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface NavGroupProps {
  label: string;
  icon?: ReactNode;
  items: NavGroupChild[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavGroupItem(props: NavGroupProps): ReactElement {
  const { label, icon, items, collapsed = false, onNavigate } = props;
  const pathname = usePathname();
  const hasActiveChild = items.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/"),
  );
  const [expanded, setExpanded] = useState(hasActiveChild);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (collapsed) {
    return (
      <>
        <Tooltip title={label} placement="right" arrow>
          <ListItemButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            selected={hasActiveChild}
            sx={{
              borderRadius: `${radii.md}px`,
              px: 1.5,
              mb: 0.5,
              justifyContent: "center",
            }}
          >
            {icon && (
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  color: hasActiveChild ? "accent.primary" : "text.secondary",
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
            )}
          </ListItemButton>
        </Tooltip>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { ml: 0.5, minWidth: 180, p: 1 } } }}
        >
          <Typography variant="captionMuted" sx={{ px: 1.5, py: 0.5, display: "block" }}>
            {label}
          </Typography>
          <List dense onClick={() => setAnchorEl(null)}>
            {items.map((child) => (
              <NavItem
                key={child.href}
                label={child.label}
                href={child.href}
                icon={child.icon}
                active={pathname === child.href || pathname.startsWith(child.href + "/")}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Popover>
      </>
    );
  }

  return (
    <Box>
      <ListItemButton
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          borderRadius: `${radii.md}px`,
          px: 2,
          mb: 0.5,
        }}
      >
        {icon && (
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: hasActiveChild ? "accent.primary" : "text.secondary",
            }}
          >
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: hasActiveChild ? 600 : 400 }}>
              {label}
            </Typography>
          }
        />
        {expanded ? (
          <ExpandLessIcon fontSize="small" sx={{ color: "text.secondary" }} />
        ) : (
          <ExpandMoreIcon fontSize="small" sx={{ color: "text.secondary" }} />
        )}
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List
          disablePadding
          sx={{
            pl: 2,
            borderLeft: `1px solid ${accent.primary}22`,
            ml: 2,
          }}
        >
          {items.map((child) => (
            <NavItem
              key={child.href}
              label={child.label}
              href={child.href}
              icon={child.icon}
              active={pathname === child.href || pathname.startsWith(child.href + "/")}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
