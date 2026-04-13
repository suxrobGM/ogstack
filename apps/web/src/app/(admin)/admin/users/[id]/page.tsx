import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { AdminUserActions } from "@/components/features/admin/admin-user-actions";
import { AdminUserApiKeys } from "@/components/features/admin/admin-user-api-keys";
import { AdminUserProfile } from "@/components/features/admin/admin-user-profile";
import { AdminUserProjects } from "@/components/features/admin/admin-user-projects";
import { AdminUserUsage } from "@/components/features/admin/admin-user-usage";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();
  const { data: user } = await client.api.admin.users({ id }).get();

  if (!user) notFound();

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <Stack spacing={4}>
      <PageHeader title={fullName || user.email} description={user.email} />

      <AdminUserProfile user={user} />

      <AdminUserActions
        userId={user.id}
        email={user.email}
        currentPlan={user.plan}
        suspended={user.suspended}
      />

      <AdminUserUsage usage={user.usage} />

      <AdminUserProjects userId={user.id} projects={user.projects} />

      <AdminUserApiKeys apiKeys={user.apiKeys} />
    </Stack>
  );
}
