import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { accent } from "@/theme";

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  variant?: "quiet" | "expressive";
  actions?: ReactNode;
}

/**
 * Section intro block - optional mono overline + display title + description.
 * Expressive variant applies the hero text gradient to the title.
 */
export function SectionHeader(props: SectionHeaderProps): ReactElement {
  const { overline, title, description, variant = "quiet", actions } = props;
  const isExpressive = variant === "expressive";

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 2, md: 4 }}
      sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {overline && (
          <Typography variant="overline" sx={{ color: accent.primary, display: "block", mb: 1.5 }}>
            {overline}
          </Typography>
        )}
        <Typography variant="h4" sx={isExpressive ? { color: accent.primary } : undefined}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2Muted" sx={{ mt: 1.5, maxWidth: 560 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
