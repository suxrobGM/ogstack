"use client";

import type { ReactElement } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import ImageIcon from "@mui/icons-material/Image";
import InsightsIcon from "@mui/icons-material/Insights";
import { Box, Grid, LinearProgress, Link, Stack, Typography } from "@mui/material";
import { UNLIMITED_QUOTA } from "@ogstack/shared";
import { StatCard } from "@/components/ui/data/stat-card";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { fontFamilies } from "@/theme";
import type { UsageStatsResponse } from "@/types/api";
import { getProgressColor } from "@/utils/usage";

interface UsageSummaryProps {
  usage: UsageStatsResponse;
}

export function UsageSummary(props: UsageSummaryProps): ReactElement {
  const { usage } = props;
  const isUnlimited = usage.quota === UNLIMITED_QUOTA;
  const percent = isUnlimited ? 0 : Math.min(100, (usage.used / usage.quota) * 100);

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Usage this period"
        description="Images generated against your plan quota"
        actions={
          <Link href={ROUTES.analytics} variant="body2" underline="hover">
            View analytics
          </Link>
        }
      />
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
            >
              <Typography variant="overlineMuted">Images generated</Typography>
              <Box sx={{ color: "text.secondary" }}>
                <ImageIcon />
              </Box>
            </Stack>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.75, mb: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: fontFamilies.mono,
                  fontSize: "2.25rem",
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {usage.used.toLocaleString()}
              </Typography>
              <Typography variant="body2Muted">
                / {isUnlimited ? "Unlimited" : usage.quota.toLocaleString()}
              </Typography>
            </Stack>
            {isUnlimited ? (
              <Typography variant="caption" sx={{ color: "accent.primary" }}>
                Unlimited plan
              </Typography>
            ) : (
              <LinearProgress
                variant="determinate"
                value={percent}
                color={getProgressColor(percent)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
          </Surface>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="AI images"
            value={usage.aiImageCount.toLocaleString()}
            icon={<BoltIcon />}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Cache hits"
            value={usage.cacheHits.toLocaleString()}
            icon={<InsightsIcon />}
            sx={{ height: "100%" }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
