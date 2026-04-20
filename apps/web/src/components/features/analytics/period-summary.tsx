import type { ReactElement } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import ImageIcon from "@mui/icons-material/Image";
import InsightsIcon from "@mui/icons-material/Insights";
import TimerIcon from "@mui/icons-material/Timer";
import { Grid } from "@mui/material";
import { StatCard } from "@/components/ui/data/stat-card";
import type { UsageStatsResponse } from "@/types/api";

interface PeriodSummaryProps {
  usage: UsageStatsResponse;
  avgGenerationMs: number | null;
}

export function PeriodSummary(props: PeriodSummaryProps): ReactElement {
  const { usage, avgGenerationMs } = props;
  const avgLabel = avgGenerationMs ? `${Math.round(avgGenerationMs)}ms` : "-";

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard label="Images" value={usage.used.toLocaleString()} icon={<ImageIcon />} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="AI images"
          value={usage.aiImageCount.toLocaleString()}
          icon={<BoltIcon />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Cache hits"
          value={usage.cacheHits.toLocaleString()}
          icon={<InsightsIcon />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard label="Avg generation" value={avgLabel} icon={<TimerIcon />} />
      </Grid>
    </Grid>
  );
}
