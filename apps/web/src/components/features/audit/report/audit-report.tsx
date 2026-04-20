import type { ReactElement } from "react";
import { Box, Divider, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies } from "@/theme/typography";
import type { PageAuditReportResponse } from "@/types/api";
import { withCacheBust } from "@/utils/url";
import { AiRecommendationsPanel, type AuditViewer } from "../ai-recommendations";
import { CtaBanner } from "./cta-banner";
import { IssueList } from "./issue-list";
import { PlatformPreviewGrid } from "./platform-preview-grid";
import { ScoreGauge } from "./score-gauge";

interface AuditReportProps {
  report: PageAuditReportResponse;
  viewer: AuditViewer;
}

export function AuditReport(props: AuditReportProps): ReactElement {
  const { report, viewer } = props;
  const failing = report.issues.filter((i) => !i.pass).length;
  const previewMetadata = { ...report.metadata, image: withCacheBust(report.metadata.image) };

  return (
    <Stack spacing={5}>
      <Surface>
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <ScoreGauge score={report.overallScore} letterGrade={report.letterGrade} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Stack spacing={1.5}>
              <Typography
                variant="body1Muted"
                sx={{
                  fontFamily: fontFamilies.mono,
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {report.url}
              </Typography>
              <Typography variant="h3">{report.metadata.title ?? "Untitled page"}</Typography>
              {report.metadata.description && (
                <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
                  {report.metadata.description}
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
                <Stat label="OG" value={`${report.categoryScores.og}/100`} />
                <Stat label="Twitter" value={`${report.categoryScores.twitter}/100`} />
                <Stat label="SEO" value={`${report.categoryScores.seo}/100`} />
                <Stat label="Issues" value={String(failing)} />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Surface>

      <AiRecommendationsPanel report={report} viewer={viewer} />

      <CtaBanner url={report.url} />

      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Platform previews
        </Typography>
        <Typography variant="body2Muted" sx={{ mb: 3, maxWidth: 640 }}>
          How this URL appears when shared. Titles and descriptions reflect each platform&apos;s
          truncation rules.
        </Typography>
        <PlatformPreviewGrid metadata={previewMetadata} />
      </Box>

      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Issue breakdown
        </Typography>
        <IssueList issues={report.issues} categoryScores={report.categoryScores} />
      </Box>
    </Stack>
  );
}

function Stat(props: { label: string; value: string }): ReactElement {
  const { label, value } = props;
  return (
    <Stack spacing={0.25}>
      <Typography variant="overline" sx={{ color: "text.disabled" }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: fontFamilies.mono, fontSize: "1.25rem", fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
