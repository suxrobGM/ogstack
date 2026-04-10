"use client";

import type { ReactElement } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import { Grid } from "@mui/material";
import { StatCard } from "@/components/ui/data/stat-card";

interface OverviewStatsProps {
  projectCount: number;
}

export function OverviewStats(props: OverviewStatsProps): ReactElement {
  const { projectCount } = props;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard label="Projects" value={projectCount} icon={<FolderIcon />} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard label="Images generated" value="--" icon={<ImageIcon />} />
      </Grid>
    </Grid>
  );
}
