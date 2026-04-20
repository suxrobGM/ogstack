import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { fontFamilies } from "@/theme";
import { Surface } from "../layout/surface";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  variant?: "quiet" | "expressive";
  sx?: SxProps<Theme>;
}

/**
 * Metric tile - label + large value + optional trend delta.
 * Used for overview dashboards, billing summaries, analytics.
 */
export function StatCard(props: StatCardProps): ReactElement {
  const { label, value, delta, trend = "neutral", icon, variant = "quiet", sx } = props;

  return (
    <Surface variant={variant} padding={3} sx={sx}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
      >
        <Typography variant="overlineMuted">{label}</Typography>
        {icon && <Box sx={{ color: "text.secondary" }}>{icon}</Box>}
      </Stack>
      <Typography
        sx={{
          fontFamily: fontFamilies.mono,
          fontSize: "2.25rem",
          fontWeight: 500,
          lineHeight: 1,
          color: "text.primary",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </Typography>
      {delta && (
        <Typography
          sx={{
            mt: 1.5,
            fontFamily: fontFamilies.mono,
            fontSize: "0.75rem",
            fontWeight: 500,
            color:
              trend === "up" ? "success.main" : trend === "down" ? "error.main" : "text.disabled",
          }}
        >
          {trend === "up" ? "\u25B2" : trend === "down" ? "\u25BC" : "\u2022"} {delta}
        </Typography>
      )}
    </Surface>
  );
}
