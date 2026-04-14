import type { ReactElement } from "react";
import { Grid, Stack } from "@mui/material";
import { OverviewHero } from "@/components/features/overview/overview-hero";
import { QuickActions } from "@/components/features/overview/quick-actions";
import { RecentImages } from "@/components/features/overview/recent-images";
import { RecentProjects } from "@/components/features/overview/recent-projects";
import { UsageSummary } from "@/components/features/overview/usage-summary";
import { getServerClient } from "@/lib/api/server";

export default async function OverviewPage(): Promise<ReactElement> {
  const client = await getServerClient();

  const [userRes, projectsRes, usageRes, imagesRes] = await Promise.all([
    client.api.users.me.get(),
    client.api.projects.get({ query: { page: 1, limit: 5 } }),
    client.api.usage.stats.get({ query: {} }),
    client.api.images.get({ query: { page: 1, limit: 6 } }),
  ]);

  const user = userRes.data;
  const projects = projectsRes.data?.items ?? [];
  const usage = usageRes.data;
  const images = imagesRes.data?.items ?? [];

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <Stack spacing={4}>
      {user && usage && (
        <OverviewHero name={fullName || user.email} plan={user.plan} period={usage.period} />
      )}
      {usage && <UsageSummary usage={usage} />}
      <QuickActions />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentProjects projects={projects} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentImages images={images} />
        </Grid>
      </Grid>
    </Stack>
  );
}
