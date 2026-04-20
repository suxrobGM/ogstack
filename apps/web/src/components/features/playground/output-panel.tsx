"use client";

import { Suspense, useState, type ReactElement, type SyntheticEvent } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import { aiModelLabel } from "@ogstack/shared";
import Image from "next/image";
import { CodeBlock } from "@/components/ui/display/code-block";
import { FrameworkSnippetTabs } from "@/components/ui/display/framework-snippet-tabs";
import { Surface } from "@/components/ui/layout/surface";
import { textColors } from "@/theme";
import type { GenerateDto } from "@/types/api";
import type { FrameworkSnippet } from "@/utils/framework-snippets";
import type { IntegrationSnippet } from "@/utils/integration-snippet";

interface OutputPanelProps {
  result: GenerateDto | null;
  integration: IntegrationSnippet | null;
  frameworkSnippets: FrameworkSnippet[];
}

type TabId = "metadata" | "integration" | "ai-prompt";

export function OutputPanel(props: OutputPanelProps): ReactElement {
  const { result, integration, frameworkSnippets } = props;
  const [tab, setTab] = useState<TabId>("metadata");

  if (!result) {
    return <></>;
  }

  const hasMetadata = Boolean(result.source?.title || result.source?.description);
  const hasFrameworks = frameworkSnippets.length > 0;
  const hasIntegration = hasFrameworks || Boolean(integration);
  const hasAiPrompt = Boolean(result.ai?.prompt);

  if (!hasMetadata && !hasIntegration && !hasAiPrompt) {
    return <></>;
  }

  const integrationLabel = hasFrameworks ? "Integration" : (integration?.label ?? "Integration");
  const handleChange = (_: SyntheticEvent, value: TabId) => setTab(value);

  return (
    <Surface>
      <Stack spacing={2}>
        <Tabs value={tab} onChange={handleChange} variant="scrollable" allowScrollButtonsMobile>
          {hasMetadata && <Tab value="metadata" label="Metadata" />}
          {hasIntegration && <Tab value="integration" label={integrationLabel} />}
          {hasAiPrompt && (
            <Tab
              value="ai-prompt"
              label={`AI Prompt${aiModelLabel(result.ai?.model) ? ` · ${aiModelLabel(result.ai?.model)}` : ""}`}
            />
          )}
        </Tabs>

        <Box>
          {tab === "metadata" && hasMetadata && <MetadataView result={result} />}
          {tab === "integration" && hasFrameworks && (
            <FrameworkSnippetTabs snippets={frameworkSnippets} />
          )}
          {tab === "integration" && !hasFrameworks && integration && (
            <IntegrationView snippet={integration} />
          )}
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
          <Image src={result.source.favicon} alt="" width={16} height={16} unoptimized />
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

function IntegrationView(props: { snippet: IntegrationSnippet }): ReactElement {
  const { snippet } = props;
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={80} />}>
      <CodeBlock code={snippet.code} language={snippet.language === "html" ? "html" : undefined} />
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
