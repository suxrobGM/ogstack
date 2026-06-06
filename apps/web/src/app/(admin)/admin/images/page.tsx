import type { ReactElement } from "react";
import { getAdminImages } from "@/api/queries";
import { AdminImageList } from "@/components/features/admin";

interface PageProps {
  searchParams: Promise<{ userId?: string; projectId?: string }>;
}

export default async function AdminImagesPage(props: PageProps): Promise<ReactElement> {
  const { userId, projectId } = await props.searchParams;
  const data = await getAdminImages({ page: 1, limit: 20, userId, projectId });
  return <AdminImageList data={data} userId={userId} projectId={projectId} />;
}
