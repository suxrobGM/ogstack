import type { ReactElement } from "react";
import { SocialPreviewTool } from "@/components/features/social-preview";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function SocialPreviewPage(): ReactElement {
  return (
    <>
      <PageHeader
        title="Social Preview"
        description="Paste a URL to see how it will render on Facebook, Twitter, LinkedIn, Slack, and more. No scoring, no cache - just a live fetch."
      />
      <SocialPreviewTool />
    </>
  );
}
