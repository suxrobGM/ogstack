import type { ReactElement } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { AuditLanding } from "@/components/features/audit/form";

export const metadata: Metadata = {
  title: "OG Audit - Score your Open Graph & SEO readiness",
  description:
    "Paste any URL to grade its Open Graph tags, Twitter card, and SEO hygiene. See how it previews across X, Facebook, LinkedIn, Slack, Telegram, Discord, and Instagram.",
  keywords: [
    "og audit",
    "open graph checker",
    "twitter card validator",
    "seo audit tool",
    "link preview tester",
    "social share preview",
    "og tag checker",
    "meta tag audit",
    "free og audit",
  ],
  alternates: { canonical: "/audit" },
};

export default function PublicAuditPage(): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Free tool
          </Typography>
          <Typography variant="h1" sx={{ mt: 2, mb: 2 }}>
            Audit your Open Graph &amp; SEO
          </Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 560, mx: "auto" }}>
            Paste a URL. We grade your OG tags, Twitter card, and SEO hygiene - and show you exactly
            how the page will appear on X, Facebook, LinkedIn, Slack, Telegram, Discord, and
            Instagram.
          </Typography>
        </Box>
        <Box sx={{ width: "100%", maxWidth: 640, mx: "auto", alignSelf: "center" }}>
          <AuditLanding />
        </Box>
      </Stack>
    </Container>
  );
}
