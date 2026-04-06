"use client";

import type { PropsWithChildren, ReactElement } from "react";
import { Box } from "@mui/material";

/**
 * Main dashboard shell with sidebar and top bar.
 * TODO: Add persistent sidebar navigation and top app bar.
 */
export function AppShell(props: PropsWithChildren): ReactElement {
  const { children } = props;

  return <Box sx={{ display: "flex", minHeight: "100vh" }}>{children}</Box>;
}
