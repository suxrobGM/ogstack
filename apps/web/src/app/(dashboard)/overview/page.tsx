import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { OverviewStats } from "@/components/features/overview/overview-stats";
import { QuickActions } from "@/components/features/overview/quick-actions";
import { RecentProjects } from "@/components/features/overview/recent-projects";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

export default async function OverviewPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data } = await client.api.projects.get({ query: { page: 1, limit: 5 } });

  const projects = data?.items ?? [];
  const projectCount = data?.pagination?.total ?? 0;

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's an overview of your account."
      />
      <OverviewStats projectCount={projectCount} />
      <QuickActions />
      <RecentProjects projects={projects} />
    </Stack>
  );
}
