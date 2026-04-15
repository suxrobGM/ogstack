import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { feedback } from "@/theme";
import { fontFamilies } from "@/theme/typography";

interface ScoreGaugeProps {
  score: number;
  letterGrade: string;
  size?: number;
}

function gradeColor(score: number): string {
  if (score >= 90) return feedback.success;
  if (score >= 70) return feedback.info;
  if (score >= 50) return feedback.warning;
  return feedback.error;
}

export function ScoreGauge(props: ScoreGaugeProps): ReactElement {
  const { score, letterGrade, size = 180 } = props;
  const color = gradeColor(score);
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <Stack sx={{ alignItems: "center" }} spacing={1.5}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <Stack
          sx={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: fontFamilies.mono,
              fontSize: size * 0.32,
              fontWeight: 600,
              lineHeight: 1,
              color,
            }}
          >
            {score}
          </Typography>
          <Typography variant="captionMuted" sx={{ mt: 0.5 }}>
            out of 100
          </Typography>
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
        <Typography variant="overlineMuted">Grade</Typography>
        <Typography
          sx={{
            fontFamily: fontFamilies.mono,
            fontSize: "2rem",
            fontWeight: 600,
            color,
            lineHeight: 1,
          }}
        >
          {letterGrade}
        </Typography>
      </Stack>
    </Stack>
  );
}
