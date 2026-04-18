"use client";

import { useState, type ReactElement } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import CachedIcon from "@mui/icons-material/Cached";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { AspectImage, IconPreview } from "@/components/ui/display";
import { Surface } from "@/components/ui/layout/surface";
import { feedback, line, radii, surfaces, textColors } from "@/theme";
import type { GenerateDto } from "@/types/api";
import { downloadImage } from "@/utils/download";

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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      await downloadImage(result.id, result.kind === "icon_set" ? "favicons" : "image");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Surface variant="expressive" sx={{ height: "100%" }}>
      <Stack spacing={2}>
        <Typography variant="h6">Preview</Typography>

        {isGenerating ? (
          <PreviewSkeleton />
        ) : result ? (
          result.kind === "icon_set" ? (
            <IconPreview src={result.imageUrl} alt="Generated favicon" bordered />
          ) : (
            <AspectImage
              src={result.imageUrl}
              alt="Generated OG image"
              sx={{ borderRadius: `${radii.sm}px`, border: `1px solid ${line.border}` }}
            />
          )
        ) : (
          <EmptyPreview />
        )}

        {result?.ai?.fellBack && (
          <Alert severity="warning" variant="outlined">
            AI generation unavailable — rendered template fallback.
          </Alert>
        )}

        {result && !isGenerating && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              {result.cached ? (
                <Chip
                  icon={<CachedIcon />}
                  label="Served from cache"
                  sx={{
                    backgroundColor: `${feedback.info}14`,
                    color: feedback.info,
                    border: `1px solid ${feedback.info}40`,
                    "& .MuiChip-icon": { color: feedback.info },
                  }}
                />
              ) : (
                <Chip
                  icon={<BoltIcon />}
                  label="Freshly generated"
                  sx={{
                    backgroundColor: `${feedback.success}14`,
                    color: feedback.success,
                    border: `1px solid ${feedback.success}40`,
                    "& .MuiChip-icon": { color: feedback.success },
                  }}
                />
              )}
              {result.generationMs != null && (
                <Chip
                  variant="outlined"
                  label={`${result.generationMs}ms`}
                  sx={{ fontFamily: "var(--font-jetbrains-mono)", color: textColors.secondary }}
                />
              )}
            </Stack>

            {result.cached && (
              <Alert severity="info" icon={<RefreshIcon fontSize="small" />}>
                Same inputs as before — click <strong>Regenerate</strong> to force a fresh image.
              </Alert>
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
              onClick={handleDownload}
              disabled={isGenerating || isDownloading}
              fullWidth
            >
              {result.kind === "icon_set" ? "Download .zip" : "Download"}
            </Button>
          </Stack>
        )}
      </Stack>
    </Surface>
  );
}
