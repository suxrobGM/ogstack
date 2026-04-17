"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import type { ImageItem } from "@/types/api";
import { buildImageSnippet } from "@/utils/integration-snippet";

interface ImageIntegrationSnippetProps {
  image: ImageItem;
}

const DESCRIPTION_BY_KIND: Record<ImageItem["kind"], string> = {
  og: "Drop this meta tag into the page's <head> to serve this image.",
  blog_hero: "Copy this URL and paste it into your blog post or CMS.",
  icon_set: "Drop these tags into the page's <head> to install the full favicon set.",
};

export function ImageIntegrationSnippet(props: ImageIntegrationSnippetProps): ReactElement | null {
  const { image } = props;
  const snippet = buildImageSnippet(image);
  if (!snippet) return null;

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h6">Integration</Typography>
        <Typography variant="body2Muted">{DESCRIPTION_BY_KIND[image.kind]}</Typography>
      </Stack>
      <CodeBlock code={snippet.code} language={snippet.language === "html" ? "html" : undefined} />
    </Stack>
  );
}
