"use client";

import type { ReactElement } from "react";
import { Link, ListItemButton, ListItemText, Typography } from "@mui/material";
import { accent } from "@/theme/palette";
import { radii } from "@/theme/tokens";

interface NavItemProps {
  label: string;
  href: string;
  active: boolean;
}

export function NavItem(props: NavItemProps): ReactElement {
  const { label, href, active } = props;

  return (
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
          px: 2,
          "&.Mui-selected": {
            bgcolor: "rgba(16,185,129,0.12)",
            borderLeft: `2px solid ${accent.sunset}`,
            boxShadow: "inset 0 0 16px rgba(16,185,129,0.06)",
            "&:hover": { bgcolor: "rgba(16,185,129,0.16)" },
          },
          "&:hover:not(.Mui-selected)": {
            bgcolor: "rgba(250,250,250,0.04)",
          },
        }}
      >
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400 }}>
              {label}
            </Typography>
          }
        />
      </ListItemButton>
    </Link>
  );
}
