import type { ReactElement } from "react";
import { Button, Container, Stack, Typography } from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { fontFamilies } from "@/theme/typography";

export function LandingNavbar(): ReactElement {
  return (
    <Container maxWidth="lg">
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          py: 2.5,
        }}
      >
        <Typography
          component="a"
          href={ROUTES.home}
          sx={{
            fontFamily: fontFamilies.body,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            color: "text.primary",
            "& span": { color: "accent.primary" },
          }}
        >
          og<span>stack</span>
        </Typography>
        <Stack direction="row" spacing={3.5} sx={{ alignItems: "center" }}>
          <Typography
            variant="body1Muted"
            component="a"
            href={ROUTES.audit}
            sx={{
              fontSize: 14,
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Audit
          </Typography>
          <Typography
            variant="body1Muted"
            component="a"
            href={ROUTES.docs}
            sx={{
              fontSize: 14,
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Docs
          </Typography>
          <Typography
            variant="body1Muted"
            component="a"
            href={`${ROUTES.home}#templates`}
            sx={{
              fontSize: 14,
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Templates
          </Typography>
          <Typography
            variant="body1Muted"
            component="a"
            href={`${ROUTES.home}#pricing`}
            sx={{
              fontSize: 14,
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Pricing
          </Typography>
          <Button href={ROUTES.register} variant="contained" size="small">
            Get started
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
