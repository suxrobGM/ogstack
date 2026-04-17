"use client";

import { useState, type ReactElement, type SyntheticEvent } from "react";
import { Box, Container, Grid, Tab, Tabs, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";

const SNIPPETS = {
  basic: `<meta
  property="og:image"
  content="https://api.ogstack.dev/og/pk_abc123?url=https://my-site.com/post&template=editorial"
/>`,
  ai: `<meta
  property="og:image"
  content="https://api.ogstack.dev/og/pk_abc123?url=https://my-site.com/post&ai=true"
/>`,
  post: `await fetch("https://api.ogstack.dev/v1/generate", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_live_...",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    projectId: "prj_123",
    url: "https://my-site.com/post",
    ai: true
  })
});`,
};

type SnippetKey = keyof typeof SNIPPETS;

const LANG: Record<SnippetKey, string> = {
  basic: "html",
  ai: "html",
  post: "typescript",
};

export function CodeSection(): ReactElement {
  const [tab, setTab] = useState<SnippetKey>("basic");
  const onChange = (_e: SyntheticEvent, next: SnippetKey) => setTab(next);

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              One line. Every platform.
            </Typography>
            <Typography variant="body1Muted" sx={{ lineHeight: 1.7 }}>
              Add the meta tag and crawlers on X, LinkedIn, Slack, and Discord render your custom
              preview automatically. Flip one flag to hand the art direction over to the AI.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Tabs
              value={tab}
              onChange={onChange}
              sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, fontSize: 13 } }}
            >
              <Tab value="basic" label="Meta tag" />
              <Tab value="ai" label="With AI" />
              <Tab value="post" label="POST (server)" />
            </Tabs>
            <CodeBlock code={SNIPPETS[tab]} language={LANG[tab]} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
