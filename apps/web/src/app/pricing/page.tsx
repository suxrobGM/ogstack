import type { ReactElement } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { PricingSection } from "@/components/features/landing/pricing-section";
import { line } from "@/theme/palette";

export default function PricingPage(): ReactElement {
  return (
    <Box sx={{ bgcolor: "surfaces.base", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: 2 }}>
        <Typography
          variant="overline"
          sx={{ color: "accent.primary", display: "block", textAlign: "center", mb: 2 }}
        >
          Pricing
        </Typography>
        <Typography variant="h1" sx={{ textAlign: "center", mb: 2 }}>
          Simple, transparent pricing
        </Typography>
      </Container>

      <PricingSection />

      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: 6, borderTop: `1px solid ${line.divider}` }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Need custom pricing?
          </Typography>
          <Typography variant="body1Muted" sx={{ mb: 3, maxWidth: 520, mx: "auto" }}>
            For high-volume usage, SSO, custom domain, or SLA agreements, get in touch for a
            tailored quote.
          </Typography>
          <Button variant="outlined" href="mailto:sales@ogstack.dev">
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
