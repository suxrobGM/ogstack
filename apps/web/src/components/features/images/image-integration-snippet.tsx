"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { FrameworkSnippetTabs } from "@/components/ui/display/framework-snippet-tabs";
import type { ImageItem } from "@/types/api";
import { buildImageFrameworkSnippets } from "@/utils/framework-snippets";
import { buildImageSnippet } from "@/utils/integration-snippet";

interface ImageIntegrationSnippetProps {
  image: ImageItem;
}

const DESCRIPTION_BY_KIND: Record<ImageItem["kind"], string> = {
  og: "Drop this into your page's <head> to serve this image. Pick your framework below.",
  blog_hero: "Copy this URL and paste it into your blog post or CMS.",
  icon_set: "Drop these tags into your page's <head> to install the full favicon set.",
};

export function ImageIntegrationSnippet(props: ImageIntegrationSnippetProps): ReactElement {
  const { image } = props;

  if (image.kind === "blog_hero") {
    const snippet = buildImageSnippet(image);
    if (!snippet) {
      return <></>;
    }

    return (
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Integration</Typography>
          <Typography variant="body2Muted">{DESCRIPTION_BY_KIND.blog_hero}</Typography>
        </Stack>
        <CodeBlock code={snippet.code} />
      </Stack>
    );
  }

  const snippets = buildImageFrameworkSnippets(image);
  if (snippets.length === 0) {
    return <></>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h6">Integration</Typography>
        <Typography variant="body2Muted">{DESCRIPTION_BY_KIND[image.kind]}</Typography>
      </Stack>
      <FrameworkSnippetTabs snippets={snippets} />
    </Stack>
  );
}
