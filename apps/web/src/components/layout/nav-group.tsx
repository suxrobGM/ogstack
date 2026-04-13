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
  children: NavGroupChild[];
  collapsed?: boolean;
}

export function NavGroupItem(props: NavGroupProps): ReactElement {
  const { label, icon, children, collapsed = false } = props;
  const pathname = usePathname();
  const hasActiveChild = children.some(
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
              py: 0.5,
              px: 1.25,
              mb: 0.25,
              justifyContent: "center",
              minHeight: 34,
              "&.Mui-selected": {
                bgcolor: "rgba(180,83,9,0.08)",
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
                  minWidth: 0,
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
          <Typography
            variant="caption"
            sx={{ px: 1.5, py: 0.5, color: "text.secondary", display: "block" }}
          >
            {label}
          </Typography>
          <List dense onClick={() => setAnchorEl(null)}>
            {children.map((child) => (
              <NavItem
                key={child.href}
                label={child.label}
                href={child.href}
                icon={child.icon}
                active={pathname === child.href || pathname.startsWith(child.href + "/")}
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
          py: 0.5,
          px: 1.5,
          mb: 0.25,
          minHeight: 34,
          "&:hover": { bgcolor: "rgba(44,40,37,0.04)" },
        }}
      >
        {icon && (
          <ListItemIcon
            sx={{
              minWidth: 30,
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
          {children.map((child) => (
            <NavItem
              key={child.href}
              label={child.label}
              href={child.href}
              icon={child.icon}
              active={pathname === child.href || pathname.startsWith(child.href + "/")}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
