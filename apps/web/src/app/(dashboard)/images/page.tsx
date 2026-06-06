import type { ReactElement } from "react";
import { getImages, getProjects } from "@/api/queries";
import { ImagesGallery } from "@/components/features/images/images-gallery";

export default async function ImagesPage(): Promise<ReactElement> {
  const [images, projectsData] = await Promise.all([
    getImages({ page: 1, limit: 24 }),
    getProjects({ page: 1, limit: 100 }),
  ]);

  return <ImagesGallery data={images ?? null} projects={projectsData?.items ?? []} />;
}
