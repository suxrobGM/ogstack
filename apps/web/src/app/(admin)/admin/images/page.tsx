import type { ReactElement } from "react";
import { AdminImageList } from "@/components/features/admin/admin-image-list";
import { getServerClient } from "@/lib/api/server";

interface PageProps {
  searchParams: Promise<{ userId?: string; projectId?: string }>;
}

export default async function AdminImagesPage(props: PageProps): Promise<ReactElement> {
  const { userId, projectId } = await props.searchParams;
  const client = await getServerClient();
  const { data } = await client.api.admin.images.get({
    query: {
      page: 1,
      limit: 20,
      ...(userId && { userId }),
      ...(projectId && { projectId }),
    },
  });
  return <AdminImageList initialData={data} initialUserId={userId} initialProjectId={projectId} />;
}
