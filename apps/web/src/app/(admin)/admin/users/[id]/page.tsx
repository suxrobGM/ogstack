import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { notFound } from "next/navigation";
import {
  AdminUserActions,
  AdminUserApiKeys,
  AdminUserProfile,
  AdminUserProjects,
  AdminUserUsage,
} from "@/components/features/admin";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getAdminUser } from "@/lib/api/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const user = await getAdminUser(id);

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
