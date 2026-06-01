import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { ImagesGallery } from "@/components/features/images/images-gallery";
import { getImages, getProject } from "@/lib/api/queries";
import { ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectImagesPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const project = await getProject(id);

  if (!project) {
    redirect(ROUTES.projects);
  }

  const images = await getImages({ page: 1, limit: 24, projectId: project.id });

  return <ImagesGallery data={images ?? null} projects={[]} projectId={project.id} hideHeader />;
}
