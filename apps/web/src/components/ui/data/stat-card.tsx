import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Surface } from "../layout/surface";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  variant?: "quiet" | "expressive";
}

/**
 * Metric tile — label + large mono value + optional trend delta.
 * Used for overview dashboards, billing summaries, analytics.
 */
export function StatCard(props: StatCardProps): ReactElement {
  const { label, value, delta, trend = "neutral", icon, variant = "quiet" } = props;

  return (
    <Surface variant={variant} padding={3}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
      >
        <Typography variant="overline" sx={(t) => ({ color: t.palette.text.disabled })}>
          {label}
        </Typography>
        {icon && <Box sx={(t) => ({ color: t.palette.text.disabled })}>{icon}</Box>}
      </Stack>
      <Typography
        sx={(t) => ({
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "2.25rem",
          fontWeight: 500,
          lineHeight: 1,
          color: t.palette.text.primary,
          letterSpacing: "-0.02em",
        })}
      >
        {value}
      </Typography>
      {delta && (
        <Typography
          sx={(t) => ({
            mt: 1.5,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.75rem",
            color:
              trend === "up"
                ? t.palette.success.main
                : trend === "down"
                  ? t.palette.error.main
                  : t.palette.text.disabled,
          })}
        >
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"} {delta}
        </Typography>
      )}
    </Surface>
  );
}
