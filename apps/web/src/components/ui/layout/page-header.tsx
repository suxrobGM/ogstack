import type { ReactElement, ReactNode } from "react";
import { Box } from "@mui/material";
import { SectionHeader } from "./section-header";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

/**
 * Page-level header block. Renders optional breadcrumbs, title + description,
 * and a right-aligned actions row. Sits at the top of dashboard pages.
 */
export function PageHeader(props: PageHeaderProps): ReactElement {
  const { title, description, actions, breadcrumbs } = props;

  return (
    <Box
      sx={(t) => ({
        pt: 5,
        pb: 4,
        borderBottom: `1px solid ${t.palette.line.divider}`,
        mb: 4,
      })}
    >
      {breadcrumbs && <Box sx={{ mb: 2 }}>{breadcrumbs}</Box>}
      <SectionHeader title={title} description={description} actions={actions} />
    </Box>
  );
}
