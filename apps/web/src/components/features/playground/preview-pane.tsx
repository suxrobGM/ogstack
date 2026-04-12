"use client";

import { Suspense, type ReactElement } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { Surface } from "@/components/ui/layout/surface";
import { line, radii, surfaces, textColors } from "@/theme";
import type { GenerateDto } from "@/types/api";

interface PreviewPaneProps {
  result: GenerateDto | null;
  isGenerating: boolean;
  metaTag: string | null;
}

function PreviewSkeleton(): ReactElement {
  return (
    <Skeleton
      variant="rectangular"
      sx={{ width: "100%", aspectRatio: "1200 / 630", borderRadius: `${radii.sm}px` }}
    />
  );
}

function EmptyPreview(): ReactElement {
  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "1200 / 630",
        borderRadius: `${radii.sm}px`,
        border: `2px dashed ${line.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        backgroundColor: surfaces.elevated,
      }}
    >
      <ImageIcon sx={{ fontSize: 48, color: textColors.disabled }} />
      <Typography variant="body2Muted">Enter a URL and click Generate</Typography>
    </Box>
  );
}

export function PreviewPane(props: PreviewPaneProps): ReactElement {
  const { result, isGenerating, metaTag } = props;

  return (
    <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
      {/* Image preview */}
      <Surface variant="expressive">
        <Stack spacing={2}>
          <Typography variant="h6">Preview</Typography>

          {isGenerating ? (
            <PreviewSkeleton />
          ) : result ? (
            <Box
              component="img"
              src={result.imageUrl}
              alt="Generated OG image"
              sx={{
                width: "100%",
                aspectRatio: "1200 / 630",
                objectFit: "cover",
                borderRadius: `${radii.sm}px`,
                border: `1px solid ${line.border}`,
              }}
            />
          ) : (
            <EmptyPreview />
          )}

          {/* Generation stats */}
          {result && (
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              {result.cached && (
                <Typography variant="caption" color="text.secondary">
                  Served from cache
                </Typography>
              )}
              {result.generationMs != null && (
                <Typography variant="caption" color="text.secondary">
                  Generated in {result.generationMs}ms
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Surface>

      {/* Metadata */}
      {result?.metadata && (result.metadata.title || result.metadata.description) && (
        <Surface>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Extracted Metadata
            </Typography>
            {result.metadata.favicon && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  component="img"
                  src={result.metadata.favicon}
                  alt=""
                  sx={{ width: 16, height: 16 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Favicon
                </Typography>
              </Stack>
            )}
            {result.metadata.title && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <LanguageIcon sx={{ fontSize: 16, color: textColors.secondary }} />
                <Typography variant="body2">{result.metadata.title}</Typography>
              </Stack>
            )}
            {result.metadata.description && (
              <Typography variant="body2Muted" sx={{ pl: 3 }}>
                {result.metadata.description}
              </Typography>
            )}
          </Stack>
        </Surface>
      )}

      {/* Meta tag output */}
      {metaTag && (
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Meta Tag
          </Typography>
          <Suspense fallback={<Skeleton variant="rectangular" height={80} />}>
            <CodeBlock code={metaTag} language="html" />
          </Suspense>
        </Stack>
      )}

      {/* Download button */}
      {result && (
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          component="a"
          href={result.imageUrl}
          download="og-image.png"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Image
        </Button>
      )}
    </Stack>
  );
}
