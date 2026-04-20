"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { Plan } from "@ogstack/shared";
import { AiChip } from "@/components/ui/display/ai-chip";
import { SkeletonList } from "@/components/ui/feedback/skeleton-list";
import { Surface } from "@/components/ui/layout/surface";
import { useAuth } from "@/providers/auth-provider";
import { accent, line } from "@/theme";
import type { PageAnalysisResponse } from "@/types/api";

interface PageContentPanelProps {
  data: PageAnalysisResponse | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onApplyAccent?: (hex: string) => void;
}

export function PageContentPanel(props: PageContentPanelProps): ReactElement {
  const { data, isLoading, isError, onApplyAccent } = props;
  const { user } = useAuth();
  const upgradeRequired = user?.plan === Plan.FREE;
  const metadata = data?.metadata;
  const ai = data?.ai;
  const isAi = Boolean(ai);
  const title = ai?.title ?? metadata?.title;
  const description = ai?.description ?? metadata?.description;

  const showError = !isLoading && (isError || !data || !metadata);
  const showContent = !isLoading && !isError && data && metadata;

  return (
    <Surface>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {isAi ? (
            <AutoAwesomeIcon sx={{ fontSize: 20, color: accent.primary }} />
          ) : (
            <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
          )}
          <Typography variant="h6" sx={{ flex: 1 }}>
            Page content
          </Typography>
          {data &&
            (isAi ? (
              <AiChip label="AI enhanced" />
            ) : (
              <Chip size="small" variant="outlined" label="Classic scrape" />
            ))}
          {isLoading && <CircularProgress size={16} />}
        </Stack>

        {isLoading && <SkeletonList count={4} height={20} spacing={1} />}

        {showError && (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            Couldn&apos;t analyze this URL. It may be offline, behind auth, or blocking scrapers.
          </Alert>
        )}

        {showContent && (
          <Stack spacing={2}>
            {metadata.isThinHtml && (
              <Alert severity="info">
                {metadata.renderedWithJs
                  ? "This page uses JavaScript - rendered before analyzing."
                  : "This page appears to require JavaScript. The preview may be limited."}
              </Alert>
            )}

            <Stack spacing={0.5}>
              <Typography
                variant="captionMuted"
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Title
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {title || "-"}
              </Typography>
            </Stack>

            {description && (
              <Stack spacing={0.5}>
                <Typography
                  variant="captionMuted"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Description
                </Typography>
                <Typography variant="body2">{description}</Typography>
              </Stack>
            )}

            {ai?.summary && (
              <Stack spacing={0.5}>
                <Typography
                  variant="captionMuted"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Summary
                </Typography>
                <Typography variant="body2">{ai.summary}</Typography>
              </Stack>
            )}

            {ai && ai.keyPoints.length > 0 && (
              <Stack spacing={0.5}>
                <Typography
                  variant="captionMuted"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Key points
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
                  {ai.keyPoints.map((point) => (
                    <Typography key={point} component="li" variant="body2">
                      {point}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            )}

            {ai && ai.topics.length > 0 && (
              <Stack spacing={0.5}>
                <Typography
                  variant="captionMuted"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Topics
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                  {ai.topics.map(({ topic }) => (
                    <Chip key={topic} label={topic} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Stack>
            )}

            {ai?.imagePrompt.suggestedAccent && onApplyAccent && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="captionMuted" sx={{ textTransform: "uppercase" }}>
                  Suggested accent
                </Typography>
                <Box
                  role="button"
                  onClick={() => onApplyAccent(ai.imagePrompt.suggestedAccent)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1px solid ${line.border}`,
                    backgroundColor: ai.imagePrompt.suggestedAccent,
                    cursor: "pointer",
                  }}
                  title={`Apply ${ai.imagePrompt.suggestedAccent}`}
                />
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {ai.imagePrompt.suggestedAccent}
                </Typography>
              </Stack>
            )}

            {upgradeRequired && (
              <Alert severity="info" icon={<AutoAwesomeIcon />}>
                Upgrade to Pro to unlock AI-extracted summaries, key points, and richer image
                prompts.
              </Alert>
            )}
          </Stack>
        )}
      </Stack>
    </Surface>
  );
}
