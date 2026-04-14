"use client";

import type { ReactElement } from "react";
import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { UNLIMITED_QUOTA } from "@ogstack/shared";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies } from "@/theme";
import type { UsageStatsResponse } from "@/types/api";
import { getProgressColor } from "@/utils/usage";

interface UsageQuotasProps {
  usage: UsageStatsResponse;
}

export function UsageQuotas(props: UsageQuotasProps): ReactElement {
  const { usage } = props;
  const isUnlimited = usage.quota === UNLIMITED_QUOTA;
  const percent = isUnlimited ? 0 : Math.min(100, (usage.used / usage.quota) * 100);

  return (
    <Box>
      <Typography variant="overlineMuted" sx={{ mb: 2, display: "block" }}>
        Current Usage
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Typography variant="body2Muted" sx={{ mb: 1 }}>
              Images Generated
            </Typography>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.5, mb: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: fontFamilies.mono,
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {usage.used.toLocaleString()}
              </Typography>
              <Typography variant="body2Muted">
                / {isUnlimited ? "Unlimited" : usage.quota.toLocaleString()}
              </Typography>
            </Stack>
            {!isUnlimited && (
              <LinearProgress
                variant="determinate"
                value={percent}
                color={getProgressColor(percent)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
            {isUnlimited && (
              <Typography variant="caption" sx={{ color: "accent.primary" }}>
                Unlimited plan
              </Typography>
            )}
          </Surface>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Typography variant="body2Muted" sx={{ mb: 1 }}>
              AI Images
            </Typography>
            <Typography
              sx={{
                fontFamily: fontFamilies.mono,
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {usage.aiImageCount.toLocaleString()}
            </Typography>
          </Surface>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Typography variant="body2Muted" sx={{ mb: 1 }}>
              Cache Hits
            </Typography>
            <Typography
              sx={{
                fontFamily: fontFamilies.mono,
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {usage.cacheHits.toLocaleString()}
            </Typography>
          </Surface>
        </Grid>
      </Grid>
    </Box>
  );
}
