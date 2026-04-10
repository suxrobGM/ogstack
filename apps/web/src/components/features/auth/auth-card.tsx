"use client";

import type { ReactElement, ReactNode } from "react";
import { Box, Link as MuiLink, Stack, Typography } from "@mui/material";
import type { Route } from "next";
import NextLink from "next/link";
import { Surface } from "@/components/ui/layout/surface";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: { text: string; linkText: string; href: Route };
}

export function AuthCard(props: AuthCardProps): ReactElement {
  const { title, description, children, footer } = props;

  return (
    <Surface variant="expressive" padding={5} sx={{ width: "100%", maxWidth: 440 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          )}
        </Box>
        {children}
        {footer && (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
            {footer.text}{" "}
            <MuiLink
              href={footer.href}
              component={NextLink}
              underline="hover"
              sx={{ color: "accent.sunset" }}
            >
              {footer.linkText}
            </MuiLink>
          </Typography>
        )}
      </Stack>
    </Surface>
  );
}
