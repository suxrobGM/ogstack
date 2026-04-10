import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  variant?: "quiet" | "expressive";
  actions?: ReactNode;
}

/**
 * Section intro block — optional mono overline + display title + description.
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
          <Typography
            variant="overline"
            sx={(t) => ({ color: t.palette.accent.sunset, display: "block", mb: 1.5 })}
          >
            {overline}
          </Typography>
        )}
        <Typography
          variant="h2"
          sx={
            isExpressive
              ? (t) => ({
                  backgroundImage: t.gradients.heroText,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                })
              : undefined
          }
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            sx={(t) => ({
              mt: 1.5,
              color: t.palette.text.secondary,
              maxWidth: 560,
            })}
          >
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
