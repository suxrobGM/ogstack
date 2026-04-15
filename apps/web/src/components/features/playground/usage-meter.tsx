import type { ReactElement } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { accent, line, radii } from "@/theme";
import type { UsageStatsResponse } from "@/types/api";

interface UsageMeterProps {
  stats: UsageStatsResponse;
}

export function UsageMeter(props: UsageMeterProps): ReactElement {
  const { stats } = props;
  const unlimited = stats.aiImageLimit === -1;
  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((stats.aiImageCount / Math.max(stats.aiImageLimit, 1)) * 100));
  const warning = !unlimited && percent >= 80;

  return (
    <Stack
      spacing={1}
      sx={{
        border: `1px solid ${line.border}`,
        borderRadius: `${radii.sm}px`,
        padding: 1.5,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <BoltIcon sx={{ fontSize: 18, color: accent.primary }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            This month
          </Typography>
          <Typography variant="captionMuted">{stats.plan}</Typography>
        </Stack>
        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
          {unlimited
            ? `${stats.aiImageCount} used`
            : `${stats.aiImageCount} / ${stats.aiImageLimit}`}
        </Typography>
      </Stack>
      {!unlimited && (
        <LinearProgress
          variant="determinate"
          value={percent}
          color={warning ? "warning" : "primary"}
          sx={{ height: 6, borderRadius: 3 }}
        />
      )}
      <Typography variant="captionMuted">
        {stats.aiImageCount} AI · {stats.cacheHits} cache hits
      </Typography>
    </Stack>
  );
}
