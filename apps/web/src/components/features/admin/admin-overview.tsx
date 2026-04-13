import type { ReactElement } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import ImageIcon from "@mui/icons-material/Image";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TodayIcon from "@mui/icons-material/Today";
import { Grid, Stack, Typography } from "@mui/material";
import { StatCard } from "@/components/ui/data/stat-card";
import { PageHeader } from "@/components/ui/layout/page-header";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import type { AdminStats } from "@/types/api";

interface AdminOverviewProps {
  stats: AdminStats;
}

export function AdminOverview(props: AdminOverviewProps): ReactElement {
  const { stats } = props;

  return (
    <Stack spacing={4}>
      <PageHeader title="Admin Overview" description="Platform-wide metrics and activity." />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon={<GroupsIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Suspended"
            value={stats.suspendedUsers}
            icon={<PersonOffIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Signups This Week"
            value={stats.signupsThisWeek}
            icon={<PersonAddIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Images Today"
            value={stats.imagesToday}
            icon={<TodayIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Images This Month"
            value={stats.imagesThisMonth}
            icon={<ImageIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <SectionHeader title="Plan Distribution" />
        <Surface padding={3}>
          <Stack spacing={1.5}>
            {(Object.keys(stats.planDistribution) as (keyof typeof stats.planDistribution)[]).map(
              (plan) => (
                <Stack
                  key={plan}
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="body2">{plan}</Typography>
                  <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {stats.planDistribution[plan]}
                  </Typography>
                </Stack>
              ),
            )}
          </Stack>
        </Surface>
      </Stack>
    </Stack>
  );
}
