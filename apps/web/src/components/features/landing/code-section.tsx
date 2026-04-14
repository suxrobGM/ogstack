import { type ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";

const SNIPPET = `<meta
  property="og:image"
  content="https://api.ogstack.dev/og/pk_abc123?url=https://my-site.com&template=gradient_dark"
/>`;

export function CodeSection(): ReactElement {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              One line. Every platform.
            </Typography>
            <Typography variant="body1Muted" sx={{ lineHeight: 1.7 }}>
              Add the meta tag, share your link, and Twitter, LinkedIn, Slack, and Discord all
              render your custom preview automatically.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CodeBlock code={SNIPPET} language="html" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
