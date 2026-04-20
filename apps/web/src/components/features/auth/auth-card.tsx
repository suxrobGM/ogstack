import type { ReactElement, ReactNode } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: { text: string; linkText: string; href: string };
}

export function AuthCard(props: AuthCardProps): ReactElement {
  const { title, description, children, footer } = props;

  return (
    <Surface
      variant="expressive"
      padding={0}
      sx={{
        width: "100%",
        maxWidth: 440,
        px: { xs: 2.5, sm: 4, md: 5 },
        py: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {description && <Typography variant="body2Muted">{description}</Typography>}
        </Box>
        {children}
        {footer && (
          <Typography variant="body2Muted" sx={{ textAlign: "center" }}>
            {footer.text}{" "}
            <Link href={footer.href} underline="hover" sx={{ color: "accent.primary" }}>
              {footer.linkText}
            </Link>
          </Typography>
        )}
      </Stack>
    </Surface>
  );
}
