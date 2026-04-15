import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { accent, line, radii } from "@/theme";
import type { UsageStatsResponse } from "@/types/api";

interface UsageMeterProps {
  stats: UsageStatsResponse;
}

export function UsageMeter(props: UsageMeterProps): ReactElement {
  const { stats } = props;
  const hasAiLimit = stats.aiImageLimit > 0;
  const percent = hasAiLimit
    ? Math.min(100, Math.round((stats.aiImageCount / Math.max(stats.aiImageLimit, 1)) * 100))
    : 0;
  const warning = hasAiLimit && percent >= 80;

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
          <AutoAwesomeIcon sx={{ fontSize: 18, color: accent.primary }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            AI this month
          </Typography>
          <Typography variant="captionMuted">{stats.plan}</Typography>
        </Stack>
        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
          {hasAiLimit ? `${stats.aiImageCount} / ${stats.aiImageLimit}` : "—"}
        </Typography>
      </Stack>
      {hasAiLimit && (
        <LinearProgress
          variant="determinate"
          value={percent}
          color={warning ? "warning" : "primary"}
          sx={{ height: 6, borderRadius: 3 }}
        />
      )}
      <Typography variant="captionMuted">
        {stats.used} images generated · {stats.cacheHits} cache hits
        {stats.aiProImageLimit > 0 &&
          ` · Pro model: ${stats.aiProImageCount}/${stats.aiProImageLimit}`}
      </Typography>
    </Stack>
  );
}
