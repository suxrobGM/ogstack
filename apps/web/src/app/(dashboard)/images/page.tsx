import type { ReactElement } from "react";
import { ImagesGallery } from "@/components/features/images/images-gallery";
import { getImages, getProjects } from "@/lib/api/queries";

export default async function ImagesPage(): Promise<ReactElement> {
  const [images, projectsData] = await Promise.all([
    getImages({ page: 1, limit: 24 }),
    getProjects({ page: 1, limit: 100 }),
  ]);

  return <ImagesGallery data={images ?? null} projects={projectsData?.items ?? []} />;
}
