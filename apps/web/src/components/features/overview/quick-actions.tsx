import type { ReactElement } from "react";
import ArticleIcon from "@mui/icons-material/Article";
import FolderIcon from "@mui/icons-material/Folder";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Box, Grid, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
import { motion } from "@/theme/tokens";

const ACTIONS = [
  {
    icon: <FolderIcon />,
    title: "Projects",
    description: "Create and manage your projects",
    href: ROUTES.projects,
  },
  {
    icon: <VpnKeyIcon />,
    title: "API Keys",
    description: "Generate and manage API keys",
    href: ROUTES.apiKeys,
  },
  {
    icon: <ArticleIcon />,
    title: "Documentation",
    description: "Read the integration guides",
    href: ROUTES.docs,
  },
];

export function QuickActions(): ReactElement {
  return (
    <>
      <SectionHeader title="Quick actions" />
      <Grid container spacing={3}>
        {ACTIONS.map((action) => (
          <Grid key={action.title} size={{ xs: 12, sm: 4 }}>
            <Box
              component={NextLink}
              href={action.href}
              sx={{ textDecoration: "none", display: "block" }}
            >
              <Surface
                variant="quiet"
                padding={3}
                sx={{
                  cursor: "pointer",
                  transition: motion.standard,
                  "&:hover": {
                    borderColor: line.borderHi,
                    bgcolor: "aubergine.elevated",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ color: "accent.sunset" }}>{action.icon}</Box>
                  <Typography variant="h5">{action.title}</Typography>
                  <Typography variant="body2Muted">{action.description}</Typography>
                </Stack>
              </Surface>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
