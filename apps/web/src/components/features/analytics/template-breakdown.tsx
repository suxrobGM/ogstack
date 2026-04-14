import type { ReactElement } from "react";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { EmptyState } from "@/components/ui/data/empty-state";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { fontFamilies } from "@/theme";

interface TemplateBreakdownProps {
  counts: Record<string, number>;
}

export function TemplateBreakdown(props: TemplateBreakdownProps): ReactElement {
  const { counts } = props;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, c]) => c));

  return (
    <Stack spacing={2.5}>
      <SectionHeader title="Template usage" />
      {entries.length === 0 ? (
        <EmptyState title="No template data" description="Generate images to see a breakdown." />
      ) : (
        <Surface padding={3}>
          <Stack spacing={2}>
            {entries.map(([template, count]) => (
              <Box key={template}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2">{template}</Typography>
                  <Typography variant="body2Muted" sx={{ fontFamily: fontFamilies.mono }}>
                    {count.toLocaleString()}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(count / max) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
          </Stack>
        </Surface>
      )}
    </Stack>
  );
}
