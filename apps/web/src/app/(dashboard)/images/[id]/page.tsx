import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getImage } from "@/api/queries";
import { ImageDetail } from "@/components/features/images/image-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ImageDetailPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const data = await getImage(id);

  if (!data) {
    notFound();
  }

  return <ImageDetail image={data} />;
}
