import type { ReactElement } from "react";
import { ImagesGallery } from "@/components/features/images/images-gallery";
import { getServerClient } from "@/lib/api/server";

export default async function ImagesPage(): Promise<ReactElement> {
  const client = await getServerClient();
  const [listRes, projectsRes] = await Promise.all([
    client.api.images.get({ query: { page: 1, limit: 24 } }),
    client.api.projects.get({ query: { page: 1, limit: 100 } }),
  ]);

  return (
    <ImagesGallery initialData={listRes.data ?? null} projects={projectsRes.data?.items ?? []} />
  );
}
