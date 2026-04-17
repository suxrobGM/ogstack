"use client";

import { Suspense, useState, type ReactElement, type SyntheticEvent } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import { aiModelLabel } from "@ogstack/shared";
import { CodeBlock } from "@/components/ui/display/code-block";
import { Surface } from "@/components/ui/layout/surface";
import { textColors } from "@/theme";
import type { GenerateDto } from "@/types/api";

interface OutputPanelProps {
  result: GenerateDto | null;
  metaTag: string | null;
}

type TabId = "metadata" | "meta-tag" | "ai-prompt";

export function OutputPanel(props: OutputPanelProps): ReactElement {
  const { result, metaTag } = props;
  const [tab, setTab] = useState<TabId>("metadata");

  if (!result) {
    return <></>;
  }

  const hasMetadata = Boolean(result.source?.title || result.source?.description);
  const hasMetaTag = Boolean(metaTag);
  const hasAiPrompt = Boolean(result.ai?.prompt);

  if (!hasMetadata && !hasMetaTag && !hasAiPrompt) {
    return <></>;
  }

  const handleChange = (_: SyntheticEvent, value: TabId) => setTab(value);

  return (
    <Surface>
      <Stack spacing={2}>
        <Tabs value={tab} onChange={handleChange} variant="scrollable" allowScrollButtonsMobile>
          {hasMetadata && <Tab value="metadata" label="Metadata" />}
          {hasMetaTag && <Tab value="meta-tag" label="Meta Tag" />}
          {hasAiPrompt && (
            <Tab
              value="ai-prompt"
              label={`AI Prompt${aiModelLabel(result.ai?.model) ? ` · ${aiModelLabel(result.ai?.model)}` : ""}`}
            />
          )}
        </Tabs>

        <Box>
          {tab === "metadata" && hasMetadata && <MetadataView result={result} />}
          {tab === "meta-tag" && hasMetaTag && metaTag && <MetaTagView metaTag={metaTag} />}
          {tab === "ai-prompt" && hasAiPrompt && result.ai?.prompt && (
            <AiPromptView prompt={result.ai.prompt} />
          )}
        </Box>
      </Stack>
    </Surface>
  );
}

function MetadataView(props: { result: GenerateDto }): ReactElement {
  const { result } = props;
  return (
    <Stack spacing={1}>
      {result.source.favicon && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component="img" src={result.source.favicon} alt="" sx={{ width: 16, height: 16 }} />
          <Typography variant="captionMuted">Favicon</Typography>
        </Stack>
      )}
      {result.source.title && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <LanguageIcon sx={{ fontSize: 16, color: textColors.secondary }} />
          <Typography variant="body2">{result.source.title}</Typography>
        </Stack>
      )}
      {result.source.description && (
        <Typography variant="body2Muted" sx={{ pl: 3 }}>
          {result.source.description}
        </Typography>
      )}
    </Stack>
  );
}

function MetaTagView(props: { metaTag: string }): ReactElement {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={80} />}>
      <CodeBlock code={props.metaTag} language="html" />
    </Suspense>
  );
}

function AiPromptView(props: { prompt: string }): ReactElement {
  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {props.prompt}
    </Typography>
  );
}
