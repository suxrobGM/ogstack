"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CachedIcon from "@mui/icons-material/Cached";
import ImageIcon from "@mui/icons-material/Image";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { Box, Grid, LinearProgress, Link, Stack, Typography } from "@mui/material";
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
  const aiPercent =
    usage.aiImageLimit > 0 ? Math.min(100, (usage.aiImageCount / usage.aiImageLimit) * 100) : 0;

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Usage this period"
        description="Non-AI images are unmetered; AI images and audits count against your plan."
        actions={
          <Link href={ROUTES.analytics} variant="body2" underline="hover">
            View analytics
          </Link>
        }
      />
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}
            >
              <Typography variant="overlineMuted">AI images</Typography>
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <AutoAwesomeIcon fontSize="small" />
              </Box>
            </Stack>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.5, mb: 1 }}>
              <Typography
                sx={{
                  fontFamily: fontFamilies.mono,
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {usage.aiImageCount.toLocaleString()}
              </Typography>
              <Typography variant="body2Muted">
                / {usage.aiImageLimit > 0 ? usage.aiImageLimit.toLocaleString() : "-"}
              </Typography>
            </Stack>
            {usage.aiImageLimit > 0 ? (
              <LinearProgress
                variant="determinate"
                value={aiPercent}
                color={getProgressColor(aiPercent)}
                sx={{ height: 4, borderRadius: 3 }}
              />
            ) : (
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Not available
              </Typography>
            )}
            {usage.aiProImageLimit > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", mt: 1, display: "block" }}
              >
                Pro: {usage.aiProImageCount.toLocaleString()}/
                {usage.aiProImageLimit.toLocaleString()}
              </Typography>
            )}
          </Surface>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Images generated"
            value={usage.used.toLocaleString()}
            icon={<ImageIcon />}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={`AI audits (${usage.aiAuditLimit})`}
            value={`${usage.aiAuditCount.toLocaleString()} / ${usage.aiAuditLimit > 0 ? usage.aiAuditLimit.toLocaleString() : "-"}`}
            icon={<RateReviewIcon />}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Cache hits"
            value={usage.cacheHits.toLocaleString()}
            icon={<CachedIcon />}
            sx={{ height: "100%" }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
