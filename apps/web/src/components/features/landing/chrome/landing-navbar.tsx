"use client";

import { useEffect, useState, type ReactElement } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ROUTES } from "@/lib/constants";
import { line, surfaces } from "@/theme/palette";
import { fontFamilies } from "@/theme/typography";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: ROUTES.features },
  { label: "How it works", href: ROUTES.howItWorks },
  { label: "AI showcase", href: ROUTES.aiShowcase },
  { label: "Templates", href: ROUTES.templateGallery },
  { label: "Pricing", href: ROUTES.pricing },
  { label: "Docs", href: ROUTES.docs },
];

export function LandingNavbar(): ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        backgroundColor: scrolled ? `${surfaces.base}F2` : "transparent",
        backdropFilter: scrolled ? "saturate(140%) blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${line.divider}` : "1px solid transparent",
        transition: "background-color 200ms, border-color 200ms, backdrop-filter 200ms",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Logo />

          {!isMobile && (
            <Stack direction="row" spacing={3.5} sx={{ alignItems: "center" }}>
              {NAV_LINKS.map((link) => (
                <Typography
                  key={link.href}
                  variant="body1Muted"
                  component="a"
                  href={link.href}
                  sx={{
                    fontSize: 14,
                    textDecoration: "none",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          )}

          {!isMobile ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Button href={ROUTES.login} size="small" sx={{ color: "text.primary" }}>
                Log in
              </Button>
              <Button href={ROUTES.register} variant="contained" size="small">
                Get started
              </Button>
            </Stack>
          ) : (
            <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} edge="end">
              <MenuIcon />
            </IconButton>
          )}
        </Stack>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: "min(360px, 88vw)", bgcolor: "surfaces.base" } } }}
      >
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center", px: 3, py: 2 }}
          >
            <Logo />
            <IconButton aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          <Stack spacing={1} sx={{ px: 3, py: 3, flex: 1 }}>
            {NAV_LINKS.map((link) => (
              <Typography
                key={link.href}
                component="a"
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  fontSize: 18,
                  fontFamily: fontFamilies.body,
                  textDecoration: "none",
                  color: "text.primary",
                  py: 1,
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={1.5} sx={{ px: 3, py: 3 }}>
            <Button href={ROUTES.login} variant="outlined" fullWidth>
              Log in
            </Button>
            <Button href={ROUTES.register} variant="contained" fullWidth>
              Get started
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </Box>
  );
}

function Logo(): ReactElement {
  return (
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
  );
}
