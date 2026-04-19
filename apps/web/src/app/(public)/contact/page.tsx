import type { ReactElement } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Container, Grid, Link, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { Surface } from "@/components/ui/layout/surface";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to OGStack. Email for sales, GitHub for issues, or the in-app feedback menu for product ideas and feature requests.",
  keywords: [
    "contact ogstack",
    "ogstack support",
    "ogstack sales",
    "og image api contact",
    "ogstack feedback",
  ],
  alternates: { canonical: "/contact" },
};

interface Channel {
  icon: SvgIconComponent;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

const CHANNELS: Channel[] = [
  {
    icon: EmailIcon,
    title: "Email",
    description:
      "Sales, partnerships, custom pricing, SSO, or SLA questions — we usually reply within one business day.",
    href: "mailto:hello@ogstack.dev",
    linkLabel: "hello@ogstack.dev",
  },
  {
    icon: GitHubIcon,
    title: "Issues & feature requests",
    description:
      "Bugs, edge cases, and feature ideas live on GitHub. Public, searchable, and faster than email.",
    href: "https://github.com/suxrobgm/ogstack/issues",
    linkLabel: "Open an issue",
  },
  {
    icon: ForumOutlinedIcon,
    title: "Product feedback",
    description: "Signed in? Use the feedback menu in the dashboard. It goes straight to the team.",
    href: "/register",
    linkLabel: "Sign in to leave feedback",
  },
];

export default function ContactPage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Contact
          </Typography>
          <Typography variant="h1">Talk to the team</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 620 }}>
            Pick the channel that fits what you're after. We read everything.
          </Typography>
        </Stack>
      </Container>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <Grid key={c.title} size={{ xs: 12, md: 4 }}>
                  <Surface variant="quiet" padding={3.5} sx={{ height: "100%" }}>
                    <Stack spacing={2}>
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
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h5">{c.title}</Typography>
                      <Typography variant="body2Muted">{c.description}</Typography>
                      <Link href={c.href} underline="hover" sx={{ fontSize: 14 }}>
                        {c.linkLabel}
                      </Link>
                    </Stack>
                  </Surface>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
