"use client";

import { useState, type ReactElement, type SyntheticEvent } from "react";
import { Box, Container, Grid, Tab, Tabs, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { FrameworkSnippetTabs } from "@/components/ui/display/framework-snippet-tabs";
import { buildFrameworkSnippets } from "@/utils/framework-snippets";

const DEMO_OG_URL =
  "https://api.ogstack.dev/og/pk_abc123?url=https://my-site.com/post&template=editorial";

const POST_SNIPPET = `await fetch("https://api.ogstack.dev/v1/generate", {
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
});`;

type Mode = "tag" | "post";

export function CodeSection(): ReactElement {
  const [mode, setMode] = useState<Mode>("tag");
  const onChange = (_e: SyntheticEvent, next: Mode) => setMode(next);

  const frameworkSnippets = buildFrameworkSnippets({ kind: "og", ogUrl: DEMO_OG_URL });

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              One line. Every framework.
            </Typography>
            <Typography variant="body1Muted" sx={{ lineHeight: 1.7 }}>
              Pick your stack — Next.js, Nuxt, SvelteKit, Remix, Vue, Angular, plain HTML — and copy
              the snippet. Crawlers on X, LinkedIn, Slack, and Discord render your custom preview
              automatically. Need server-side control? Switch to POST.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Tabs
              value={mode}
              onChange={onChange}
              sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, fontSize: 13 } }}
            >
              <Tab value="tag" label="Meta tag" />
              <Tab value="post" label="POST (server)" />
            </Tabs>
            {mode === "tag" ? (
              <FrameworkSnippetTabs snippets={frameworkSnippets} />
            ) : (
              <CodeBlock code={POST_SNIPPET} language="typescript" />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
