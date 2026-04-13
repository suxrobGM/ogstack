import type { ReactElement } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { feedback } from "@/theme";
import { fontFamilies } from "@/theme/typography";
import type { AuditIssue } from "@/types/api";

interface IssueListProps {
  issues: AuditIssue[];
  categoryScores: { og: number; twitter: number; seo: number };
}

interface IssueRowProps {
  issue: AuditIssue;
}

const CATEGORY_LABELS: Record<string, string> = {
  og: "Open Graph",
  twitter: "Twitter / X",
  seo: "SEO",
};

function severityColor(severity: string, pass: boolean): string {
  if (pass) return feedback.success;
  if (severity === "critical") return feedback.error;
  if (severity === "warning") return feedback.warning;
  return feedback.info;
}

function IssueRow(props: IssueRowProps): ReactElement {
  const { issue } = props;
  const color = severityColor(issue.severity, issue.pass);
  const Icon = issue.pass
    ? CheckCircleIcon
    : issue.severity === "critical"
      ? ErrorIcon
      : WarningAmberIcon;

  return (
    <Accordion
      disableGutters
      sx={{
        "&::before": { display: "none" },
        boxShadow: "none",
        bgcolor: "transparent",
      }}
      defaultExpanded={!issue.pass && issue.severity === "critical"}
    >
      <AccordionSummary
        expandIcon={issue.pass ? null : <ExpandMoreIcon />}
        sx={{ px: 2, minHeight: 56 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", width: "100%" }}>
          <Icon sx={{ color, fontSize: 20 }} />
          <Typography sx={{ flex: 1, fontWeight: 500 }}>{issue.title}</Typography>
          <Chip
            label={issue.pass ? "pass" : issue.severity}
            size="small"
            sx={{
              bgcolor: `${color}1A`,
              color,
              textTransform: "capitalize",
              fontFamily: fontFamilies.mono,
              height: 22,
            }}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2, pl: 6, pr: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2Muted">{issue.message}</Typography>
          {!issue.pass && issue.fix && (
            <Box
              sx={{
                bgcolor: "surfaces.elevated",
                p: 1.5,
                borderRadius: 1,
                fontFamily: fontFamilies.mono,
                fontSize: 12,
                color: "text.primary",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {issue.fix}
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export function IssueList(props: IssueListProps): ReactElement {
  const { issues, categoryScores } = props;

  const byCategory = issues.reduce<Record<string, AuditIssue[]>>((acc, issue) => {
    (acc[issue.category] ||= []).push(issue);
    return acc;
  }, {});

  const orderedCategories = ["og", "twitter", "seo"] as const;

  return (
    <Stack spacing={4}>
      {orderedCategories.map((category) => {
        const categoryIssues = byCategory[category] ?? [];
        if (categoryIssues.length === 0) return null;
        const failing = categoryIssues.filter((i) => !i.pass).length;

        return (
          <Box key={category}>
            <SectionHeader
              title={CATEGORY_LABELS[category] ?? category}
              description={`${categoryIssues.length - failing} of ${categoryIssues.length} checks passing · Score ${categoryScores[category]}/100`}
            />
            <Stack sx={{ mt: 2 }}>
              {categoryIssues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
