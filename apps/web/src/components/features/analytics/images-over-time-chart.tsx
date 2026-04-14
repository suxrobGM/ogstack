import type { ReactElement } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { accent, fontFamilies, surfaces } from "@/theme";

interface ChartPoint {
  label: string;
  tooltip: string;
  value: number;
}

interface ImagesOverTimeChartProps {
  title: string;
  points: ChartPoint[];
}

export function ImagesOverTimeChart(props: ImagesOverTimeChartProps): ReactElement {
  const { title, points } = props;
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <Stack spacing={2.5}>
      <SectionHeader title={title} />
      <Surface padding={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.5,
            height: 220,
            overflowX: "auto",
          }}
        >
          {points.map((point, i) => {
            const height = (point.value / max) * 100;
            return (
              <Tooltip key={`${point.label}-${i}`} title={point.tooltip} arrow>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: 6,
                    height: `${Math.max(2, height)}%`,
                    background: point.value === 0 ? surfaces.elevated : accent.primary,
                    borderRadius: 1,
                    transition: "opacity 120ms",
                    "&:hover": { opacity: 0.75 },
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
        <Stack direction="row" sx={{ justifyContent: "space-between", mt: 2 }}>
          <Typography variant="captionMuted" sx={{ fontFamily: fontFamilies.mono }}>
            {points[0]?.label ?? ""}
          </Typography>
          <Typography variant="captionMuted" sx={{ fontFamily: fontFamilies.mono }}>
            {points[points.length - 1]?.label ?? ""}
          </Typography>
        </Stack>
      </Surface>
    </Stack>
  );
}
