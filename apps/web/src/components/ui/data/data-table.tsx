import type { ReactElement, ReactNode } from "react";
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Surface } from "../layout/surface";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  width?: number | string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: { title: string; description?: string; action?: ReactNode };
  onRowClick?: (row: T) => void;
  sx?: SxProps<Theme>;
}

/**
 * Quiet data table wrapper - renders MUI Table inside a flat Surface with
 * skeleton loading rows and an embedded EmptyState on empty result sets.
 *
 * Columns are generic over row type `T`; access either via `column.key` as
 * a row property, or supply a `render` function for custom cells.
 */
export function DataTable<T>(props: DataTableProps<T>): ReactElement {
  const { columns, rows, rowKey, loading, empty, onRowClick, sx } = props;

  if (!loading && rows.length === 0 && empty) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />;
  }

  return (
    <Surface padding={0} sx={sx}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? "left"}
                sx={{ width: column.width, px: 3 }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align ?? "left"} sx={{ px: 3 }}>
                      <Skeleton variant="text" width="60%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={
                    onRowClick
                      ? {
                          cursor: "pointer",
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align ?? "left"} sx={{ px: 3 }}>
                      {column.render ? column.render(row) : renderDefaultCell(row, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Surface>
  );
}

function renderDefaultCell<T>(row: T, key: string): ReactNode {
  const record = row as Record<string, unknown>;
  const value = record[key];
  if (value == null)
    return (
      <Box component="span" sx={{ opacity: 0.4 }}>
        -
      </Box>
    );
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}
