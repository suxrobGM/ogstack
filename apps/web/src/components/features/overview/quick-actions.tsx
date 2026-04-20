"use client";

import type { ReactElement } from "react";
import ArticleIcon from "@mui/icons-material/Article";
import FolderIcon from "@mui/icons-material/Folder";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Box, Grid, Link, Stack, Typography } from "@mui/material";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { DOCS_URL, ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";

const ACTIONS = [
  {
    icon: <PlayCircleIcon />,
    title: "Playground",
    description: "Preview templates against any URL",
    href: ROUTES.playground,
  },
  {
    icon: <FolderIcon />,
    title: "Projects",
    description: "Create and manage your projects",
    href: ROUTES.projects,
  },
  {
    icon: <VpnKeyIcon />,
    title: "API keys",
    description: "Generate and manage API keys",
    href: ROUTES.apiKeys,
  },
  {
    icon: <ArticleIcon />,
    title: "Documentation",
    description: "Read the integration guides",
    href: DOCS_URL,
    external: true,
  },
];

export function QuickActions(): ReactElement {
  return (
    <Stack spacing={2.5}>
      <SectionHeader title="Quick actions" />
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {ACTIONS.map((action) => (
          <Grid key={action.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Link
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              sx={{ display: "block", height: "100%" }}
            >
              <Surface
                variant="quiet"
                padding={3}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: motion.standard,
                  "&:hover": {
                    borderColor: line.borderHi,
                    bgcolor: "surfaces.elevated",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ color: "accent.primary" }}>{action.icon}</Box>
                  <Typography variant="h5" sx={{ color: "accent.primary" }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2Muted">{action.description}</Typography>
                </Stack>
              </Surface>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
