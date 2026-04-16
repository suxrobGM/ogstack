import type { ReactElement } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

interface Problem {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

const PROBLEMS: Problem[] = [
  {
    icon: DesignServicesIcon,
    title: "The design tax",
    description:
      "Every blog post, doc, and changelog needs a preview image. Either engineering time, or a Figma stall, or an ugly default.",
  },
  {
    icon: BrokenImageIcon,
    title: "Ugly, mismatched defaults",
    description:
      "Platform-generated screenshots look like 2014. A great article with a broken preview dies in the feed.",
  },
  {
    icon: HistoryToggleOffIcon,
    title: "Stale content",
    description:
      "You change the title but the OG image stays frozen on the old copy. Caches in every platform make this worse.",
  },
  {
    icon: QueryStatsIcon,
    title: "Zero social hygiene insight",
    description:
      "Is `og:type` right? Are the Twitter card dimensions valid? Most teams find out when a VP shares the link.",
  },
];

export function ProblemsSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 620 }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Why OGStack
          </Typography>
          <Typography variant="h2">Stop hand-crafting preview images</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 580 }}>
            The old way: designer queues, stale screenshots, hope the crawler caches. The new way:
            paste a URL, get a designed image, move on.
          </Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <Grid key={p.title} size={{ xs: 12, sm: 6 }}>
                <Surface variant="quiet" padding={3.5} sx={{ height: "100%" }}>
                  <Stack direction="row" spacing={2.5} sx={{ alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(180,83,9,0.08)",
                        color: "accent.primary",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography variant="h5">{p.title}</Typography>
                      <Typography variant="body2Muted">{p.description}</Typography>
                    </Stack>
                  </Stack>
                </Surface>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
