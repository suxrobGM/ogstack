import type { ReactElement } from "react";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import { AiChip } from "@/components/ui/display/ai-chip";
import { Surface } from "@/components/ui/layout/surface";
import { accent, iconSizes } from "@/theme";
import { IconList } from "./icon-list";
import { PanelHeader } from "./panel-header";
import type { AiInsights } from "./sample-data";
import { SuggestionBlock } from "./suggestion-block";

interface InsightsViewProps {
  insights: AiInsights;
}

const SUGGESTION_FIELDS = [
  { key: "suggestedOgTitle", label: "Suggested og:title", limit: 60 },
  { key: "suggestedOgDescription", label: "Suggested og:description", limit: 160 },
  { key: "suggestedTwitterTitle", label: "Suggested twitter:title", limit: 70 },
  { key: "suggestedTwitterDescription", label: "Suggested twitter:description", limit: 200 },
] as const;

export function InsightsView(props: InsightsViewProps): ReactElement {
  const { insights } = props;
  return (
    <Surface>
      <Stack spacing={3}>
        <PanelHeader
          badge={
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={`Severity: ${insights.severity}`} />
              <AiChip label="AI review" />
            </Stack>
          }
        />

        <Stack spacing={2}>
          {SUGGESTION_FIELDS.map((field) => {
            const value = insights[field.key];
            return (
              <SuggestionBlock
                key={field.key}
                label={field.label}
                value={value}
                hint={`${value.length}/${field.limit} chars`}
              />
            );
          })}
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            Tone & audience
          </Typography>
          <Typography variant="body2">{insights.toneAssessment}</Typography>
          <Box>
            <Chip size="small" label={`Audience fit: ${insights.audienceFit}`} />
          </Box>
        </Stack>

        <Divider />

        <IconList
          label="Content gaps"
          icon={<LightbulbIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }} />}
          items={insights.contentGaps}
        />

        <Divider />

        <IconList
          label="Click-through tips"
          icon={
            <TipsAndUpdatesIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }} />
          }
          items={insights.socialCtrTips}
        />

        <Divider />

        <Box>
          <Chip size="small" variant="outlined" label={`Confidence: ${insights.confidence}`} />
        </Box>
      </Stack>
    </Surface>
  );
}
