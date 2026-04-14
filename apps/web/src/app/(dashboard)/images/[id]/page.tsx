import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { ImageDetail } from "@/components/features/images/image-detail";
import { getServerClient } from "@/lib/api/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ImageDetailPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const client = await getServerClient();
  const { data, error } = await client.api.images({ id }).get();

  if (error || !data) {
    notFound();
  }

  return <ImageDetail image={data} />;
}
