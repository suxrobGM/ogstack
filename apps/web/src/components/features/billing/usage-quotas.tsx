"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CachedIcon from "@mui/icons-material/Cached";
import ImageIcon from "@mui/icons-material/Image";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies } from "@/theme";
import type { UsageStatsResponse } from "@/types/api";
import { getProgressColor } from "@/utils/usage";

interface UsageQuotasProps {
  usage: UsageStatsResponse;
}

interface MeterProps {
  label: string;
  used: number;
  limit: number;
  icon: ReactElement;
  hint?: string;
}

function Meter(props: MeterProps): ReactElement {
  const { label, used, limit, icon, hint } = props;
  const hasLimit = limit > 0;
  const percent = hasLimit ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <Surface padding={3} sx={{ height: "100%" }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}
      >
        <Typography variant="body2Muted">{label}</Typography>
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.5, mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: fontFamilies.mono,
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {used.toLocaleString()}
        </Typography>
        <Typography variant="body2Muted">/ {hasLimit ? limit.toLocaleString() : "-"}</Typography>
      </Stack>
      {hasLimit ? (
        <LinearProgress
          variant="determinate"
          value={percent}
          color={getProgressColor(percent)}
          sx={{ height: 6, borderRadius: 3 }}
        />
      ) : (
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          Not available on your plan
        </Typography>
      )}
      {hint && (
        <Typography variant="caption" sx={{ color: "text.disabled", mt: 1, display: "block" }}>
          {hint}
        </Typography>
      )}
    </Surface>
  );
}

export function UsageQuotas(props: UsageQuotasProps): ReactElement {
  const { usage } = props;

  return (
    <Box>
      <Typography variant="overlineMuted" sx={{ mb: 2, display: "block" }}>
        Current Usage
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}
            >
              <Typography variant="body2Muted">Images generated</Typography>
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <ImageIcon />
              </Box>
            </Stack>
            <Typography
              sx={{
                fontFamily: fontFamilies.mono,
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              {usage.used.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: "accent.primary", mt: 1, display: "block" }}>
              Unlimited on every plan
            </Typography>
          </Surface>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Meter
            label="AI images"
            used={usage.aiImageCount}
            limit={usage.aiImageLimit}
            icon={<AutoAwesomeIcon />}
            hint={
              usage.aiProImageLimit > 0
                ? `${usage.aiProImageCount.toLocaleString()} / ${usage.aiProImageLimit.toLocaleString()} Pro model`
                : undefined
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Meter
            label="AI audits"
            used={usage.aiAuditCount}
            limit={usage.aiAuditLimit}
            icon={<RateReviewIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Surface padding={3} sx={{ height: "100%" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}
            >
              <Typography variant="body2Muted">Cache hits</Typography>
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <CachedIcon />
              </Box>
            </Stack>
            <Typography
              sx={{
                fontFamily: fontFamilies.mono,
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              {usage.cacheHits.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", mt: 1, display: "block" }}>
              Never counted toward quota
            </Typography>
          </Surface>
        </Grid>
      </Grid>
    </Box>
  );
}
