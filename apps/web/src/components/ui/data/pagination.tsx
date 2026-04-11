import type { ReactElement } from "react";
import { Button, Stack, Typography } from "@mui/material";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Simple previous/next pagination with page indicator.
 * Only renders when there are multiple pages.
 */
export function Pagination(props: PaginationProps): ReactElement {
  const { page, totalPages, onPageChange } = props;

  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
      <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <Typography variant="body2Muted" sx={{ fontVariantNumeric: "tabular-nums" }}>
        Page {page} of {totalPages}
      </Typography>
      <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </Stack>
  );
}
