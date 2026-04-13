import type { ReactElement } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function Loading(): ReactElement {
  return (
    <>
      <PageHeader
        title="Audits"
        description="Grade your pages' OG and SEO readiness, and see platform previews."
      />
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    </>
  );
}
