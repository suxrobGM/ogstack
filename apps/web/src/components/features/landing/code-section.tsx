import type { ReactElement } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { radii, shadows } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";

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
            <Box
              sx={{
                bgcolor: "#2C2825",
                color: "#d6d3d1",
                p: 3.5,
                borderRadius: `${radii.md}px`,
                fontFamily: fontFamilies.mono,
                fontSize: 13,
                lineHeight: 2,
                boxShadow: shadows.lg,
                "& .tag": { color: "#F97316" },
                "& .attr": { color: "#93c5fd" },
                "& .str": { color: "#86efac" },
              }}
            >
              <Box component="span" className="tag">
                &lt;meta
              </Box>
              <br />
              {"  "}
              <Box component="span" className="attr">
                property
              </Box>
              =
              <Box component="span" className="str">
                &quot;og:image&quot;
              </Box>
              <br />
              {"  "}
              <Box component="span" className="attr">
                content
              </Box>
              =
              <Box component="span" className="str">
                &quot;https://api.ogstack.dev/og/
              </Box>
              <br />
              {"    "}
              <Box component="span" className="str">
                pk_abc123
              </Box>
              <br />
              {"    "}
              <Box component="span" className="str">
                ?url=https://my-site.com
              </Box>
              <br />
              {"    "}
              <Box component="span" className="str">
                &amp;template=gradient_dark&quot;
              </Box>
              <br />
              <Box component="span" className="tag">
                /&gt;
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
