import type { ReactElement } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import { Box, Container, Grid, IconButton, Link, Stack, Typography } from "@mui/material";
import { API_DOCS_URL, DOCS_URL, ROUTES } from "@/lib/constants";
import { line } from "@/theme/palette";
import { fontFamilies } from "@/theme/typography";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: ROUTES.features },
      { label: "How it works", href: ROUTES.howItWorks },
      { label: "AI showcase", href: ROUTES.aiShowcase },
      { label: "Templates", href: ROUTES.templateGallery },
      { label: "Pricing", href: ROUTES.pricing },
      { label: "Audit", href: ROUTES.audit },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: ROUTES.about },
      { label: "Compare", href: ROUTES.compare },
      { label: "Contact", href: ROUTES.contact },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: DOCS_URL, external: true },
      { label: "API reference", href: API_DOCS_URL, external: true },
      { label: "GitHub", href: "https://github.com/suxrobgm/ogstack", external: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: ROUTES.privacy },
      { label: "Terms", href: ROUTES.terms },
    ],
  },
];

const COPYRIGHT_YEAR = 2026;

export function Footer(): ReactElement {
  return (
    <Box component="footer" sx={{ mt: { xs: 8, md: 12 }, borderTop: `1px solid ${line.divider}` }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} sx={{ maxWidth: 320 }}>
              <Typography
                sx={{
                  fontFamily: fontFamilies.body,
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: "-0.5px",
                  "& span": { color: "accent.primary" },
                }}
              >
                og<span>stack</span>
              </Typography>
              <Typography variant="body2Muted">
                Social preview images that read your page. One meta tag, AI-assisted design, every
                platform.
              </Typography>
            </Stack>
          </Grid>

          {COLUMNS.map((col) => (
            <Grid key={col.heading} size={{ xs: 6, sm: 3, md: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="overlineMuted" sx={{ fontSize: 11, letterSpacing: "0.14em" }}>
                  {col.heading}
                </Typography>
                <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {col.links.map((link) => (
                    <Box key={link.label} component="li">
                      <Link
                        href={link.href}
                        variant="body2"
                        underline="hover"
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        sx={{ color: "text.primary" }}
                      >
                        {link.label}
                      </Link>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ borderTop: `1px solid ${line.divider}` }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Typography variant="captionMuted">
              © {COPYRIGHT_YEAR} ogstack.dev — Crafted for developers.
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <XIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
