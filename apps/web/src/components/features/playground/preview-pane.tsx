"use client";

import type { ReactElement } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { line, radii, surfaces, textColors } from "@/theme";
import type { GenerateDto } from "@/types/api";

interface PreviewPaneProps {
  result: GenerateDto | null;
  isGenerating: boolean;
  onRegenerate: () => void;
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
  const { result, isGenerating, onRegenerate } = props;

  return (
    <Surface variant="expressive" sx={{ height: "100%" }}>
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

        {result?.ai?.fellBack && (
          <Alert severity="warning" variant="outlined">
            AI generation unavailable — rendered template fallback.
          </Alert>
        )}

        {result && !isGenerating && (
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            {result.cached && <Typography variant="captionMuted">Served from cache</Typography>}
            {result.generationMs != null && (
              <Typography variant="captionMuted">Generated in {result.generationMs}ms</Typography>
            )}
          </Stack>
        )}

        {result && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRegenerate}
              disabled={isGenerating}
              fullWidth
            >
              Regenerate
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              component="a"
              href={result.imageUrl}
              download="og-image.png"
              target="_blank"
              rel="noopener noreferrer"
              disabled={isGenerating}
              fullWidth
            >
              Download
            </Button>
          </Stack>
        )}
      </Stack>
    </Surface>
  );
}
