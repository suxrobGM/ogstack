import type { ReactElement } from "react";
import { Chip, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";
import type { AuthUser } from "@/types/api";
import { formatPeriod } from "@/utils/formatters";
import { planChipColor } from "@/utils/plan";

interface OverviewHeroProps {
  name: string;
  plan: AuthUser["plan"];
  period: string;
}

export function OverviewHero(props: OverviewHeroProps): ReactElement {
  const { name, plan, period } = props;
  const firstName = name.split(" ")[0] || name || "there";
  const periodLabel = formatPeriod(period);

  return (
    <Surface
      variant="expressive"
      padding={0}
      sx={{ px: { xs: 2.5, sm: 3.5, md: 4 }, py: { xs: 2.5, sm: 3.5, md: 4 } }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
        >
          <Typography variant="h3">Welcome back, {firstName}</Typography>
          <Chip label={plan} size="small" color={planChipColor(plan)} variant="filled" />
        </Stack>
        <Typography variant="body2Muted">
          Here&apos;s how your OG image generation is trending for {periodLabel}.
        </Typography>
      </Stack>
    </Surface>
  );
}
