"use client";

import type { ReactElement } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { SkeletonList } from "@/components/ui/feedback/skeleton-list";
import { Surface } from "@/components/ui/layout/surface";
import { useDebouncedValue } from "@/hooks";
import { usePageAnalysis } from "@/hooks/use-page-analysis";
import { accent, line } from "@/theme";

interface PageContentPanelProps {
  url: string;
  userPrompt?: string;
  fullOverride?: boolean;
  onApplyAccent?: (hex: string) => void;
}

export function PageContentPanel(props: PageContentPanelProps): ReactElement {
  const { url, userPrompt, fullOverride, onApplyAccent } = props;
  const debouncedUrl = useDebouncedValue(url, 600);
  const debouncedPrompt = useDebouncedValue(userPrompt ?? "", 600);

  const hasUrl = debouncedUrl.trim().length > 0;

  const query = usePageAnalysis({
    url: debouncedUrl,
    userPrompt: debouncedPrompt,
    fullOverride,
    enabled: hasUrl && !fullOverride,
  });

  if (!hasUrl || fullOverride) {
    return <></>;
  }

  return (
    <Surface>
      <Stack spacing={2}>
        <Header isLoading={query.isFetching} mode={query.data?.mode} />
        <PanelBody
          isLoading={query.isLoading}
          isError={query.isError}
          data={query.data}
          onApplyAccent={onApplyAccent}
        />
      </Stack>
    </Surface>
  );
}

interface PanelBodyProps {
  isLoading: boolean;
  isError: boolean;
  data: ReturnType<typeof usePageAnalysis>["data"];
  onApplyAccent?: (hex: string) => void;
}

function PanelBody(props: PanelBodyProps): ReactElement {
  const { isLoading, isError, data, onApplyAccent } = props;

  if (isLoading) {
    return <SkeletonList count={4} height={20} spacing={1} />;
  }

  if (isError) {
    return (
      <Alert severity="warning" icon={<WarningAmberIcon />}>
        Couldn&apos;t analyze this URL. It may be offline, behind auth, or blocking scrapers.
      </Alert>
    );
  }

  if (data) {
    return <ExtractionContent data={data} onApplyAccent={onApplyAccent} />;
  }

  return <></>;
}

function Header(props: { isLoading: boolean; mode: string | undefined }): ReactElement {
  const { isLoading, mode } = props;
  const isAi = mode === "ai";
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      {isAi ? (
        <AutoAwesomeIcon sx={{ fontSize: 20, color: accent.primary }} />
      ) : (
        <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
      )}
      <Typography variant="h6" sx={{ flex: 1 }}>
        Page content
      </Typography>
      {mode && (
        <Chip
          size="small"
          variant="outlined"
          label={isAi ? "AI enhanced" : "Classic scrape"}
          color={isAi ? "success" : "default"}
        />
      )}
      {isLoading && <CircularProgress size={16} />}
    </Stack>
  );
}

interface ExtractionContentProps {
  data: NonNullable<ReturnType<typeof usePageAnalysis>["data"]>;
  onApplyAccent?: (hex: string) => void;
}

function ExtractionContent(props: ExtractionContentProps): ReactElement {
  const { data, onApplyAccent } = props;
  const { metadata, ai, upgradeRequired } = data;

  const title = ai?.title ?? metadata.title;
  const description = ai?.description ?? metadata.description;

  return (
    <Stack spacing={2}>
      {metadata.isThinHtml && (
        <Alert severity="info">
          {metadata.renderedWithJs
            ? "This page uses JavaScript — rendered before analyzing."
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
          {title || "—"}
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
            {ai.topics.map((topic) => (
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
          Upgrade to Pro to unlock AI-extracted summaries, key points, and richer image prompts.
        </Alert>
      )}
    </Stack>
  );
}
