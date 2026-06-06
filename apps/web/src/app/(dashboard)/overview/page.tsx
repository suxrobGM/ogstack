import type { ReactElement } from "react";
import { Grid, Stack } from "@mui/material";
import { getCurrentUser, getImages, getProjects, getUsageStats } from "@/api/queries";
import { OverviewHero } from "@/components/features/overview/overview-hero";
import { QuickActions } from "@/components/features/overview/quick-actions";
import { RecentImages } from "@/components/features/overview/recent-images";
import { RecentProjects } from "@/components/features/overview/recent-projects";
import { UsageSummary } from "@/components/features/overview/usage-summary";

export default async function OverviewPage(): Promise<ReactElement> {
  const [user, projectsData, usage, imagesData] = await Promise.all([
    getCurrentUser(),
    getProjects({ page: 1, limit: 5 }),
    getUsageStats(),
    getImages({ page: 1, limit: 6 }),
  ]);

  const projects = projectsData?.items ?? [];
  const images = imagesData?.items ?? [];

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      {user && usage && (
        <OverviewHero name={fullName || user.email} plan={user.plan} period={usage.period} />
      )}
      {usage && <UsageSummary usage={usage} />}
      <QuickActions />
      <Grid container spacing={{ xs: 2, md: 3 }}>
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
