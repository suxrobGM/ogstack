import type { ReactElement } from "react";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import SchemaIcon from "@mui/icons-material/SchemaOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
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

const CANONICAL_HEALTH_COLOR: Record<
  AiInsights["discoverability"]["canonicalHealth"],
  "success" | "warning" | "error"
> = {
  ok: "success",
  missing: "error",
  suspicious: "warning",
};

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

        {insights.priorityActions.length > 0 && (
          <>
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: "text.disabled" }}>
                Priority actions
              </Typography>
              <Stack spacing={1.25}>
                {insights.priorityActions.map((action) => (
                  <Stack
                    key={action.title}
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <FlagIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "3px" }} />
                    <Stack spacing={0.25} sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Chip size="small" variant="outlined" label={`Impact: ${action.impact}`} />
                      </Stack>
                      <Typography variant="body2Muted">{action.rationale}</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Divider />
          </>
        )}

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

        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            Search snippet
          </Typography>
          <SuggestionBlock
            label="Suggested <title>"
            value={insights.searchSnippet.suggestedTitle}
            hint={`${insights.searchSnippet.suggestedTitle.length}/60 chars`}
          />
          <SuggestionBlock
            label="Suggested meta description"
            value={insights.searchSnippet.suggestedMetaDescription}
            hint={`${insights.searchSnippet.suggestedMetaDescription.length}/160 chars`}
          />
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

        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            Discoverability
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
            <Chip
              size="small"
              color={CANONICAL_HEALTH_COLOR[insights.discoverability.canonicalHealth]}
              label={`Canonical: ${insights.discoverability.canonicalHealth}`}
            />
          </Stack>
          {insights.discoverability.schemaOrgRecommendations.length > 0 && (
            <IconList
              label="Schema.org recommendations"
              icon={
                <SchemaIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }} />
              }
              items={insights.discoverability.schemaOrgRecommendations}
            />
          )}
          {insights.discoverability.structuredDataGaps.length > 0 && (
            <IconList
              label="Structured data gaps"
              icon={
                <LightbulbIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }} />
              }
              items={insights.discoverability.structuredDataGaps}
            />
          )}
          {insights.discoverability.hreflangRecommendations.length > 0 && (
            <IconList
              label="hreflang recommendations"
              icon={
                <LightbulbIcon sx={{ fontSize: iconSizes.xs, color: accent.primary, mt: "2px" }} />
              }
              items={insights.discoverability.hreflangRecommendations}
            />
          )}
        </Stack>

        {insights.keywordOpportunities.length > 0 && (
          <>
            <Divider />
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <SearchIcon sx={{ fontSize: iconSizes.xs, color: accent.primary }} />
                <Typography variant="overline" sx={{ color: "text.disabled" }}>
                  Keyword opportunities
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {insights.keywordOpportunities.map((keyword) => (
                  <Chip key={keyword} size="small" variant="outlined" label={keyword} />
                ))}
              </Stack>
            </Stack>
          </>
        )}

        <Divider />

        <Box>
          <Chip size="small" variant="outlined" label={`Confidence: ${insights.confidence}`} />
        </Box>
      </Stack>
    </Surface>
  );
}
