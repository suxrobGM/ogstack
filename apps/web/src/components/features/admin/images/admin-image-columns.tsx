"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Checkbox, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import type { Column } from "@/components/ui/data/data-table";
import { AspectImage } from "@/components/ui/display/aspect-image";
import { iconSizes } from "@/theme";
import type { AdminImageItem } from "@/types/api";

interface BuildColumnsParams {
  selected: Set<string>;
  allPageSelected: boolean;
  somePageSelected: boolean;
  onToggleRow: (id: string) => void;
  onTogglePage: () => void;
  onDelete: (image: AdminImageItem) => void;
}

export function buildAdminImageColumns(params: BuildColumnsParams): Column<AdminImageItem>[] {
  const { selected, allPageSelected, somePageSelected, onToggleRow, onTogglePage, onDelete } =
    params;

  return [
    {
      key: "select",
      header: (
        <Checkbox
          size="small"
          checked={allPageSelected}
          indeterminate={somePageSelected}
          onChange={onTogglePage}
        />
      ),
      width: 48,
      render: (row) => (
        <Checkbox
          size="small"
          checked={selected.has(row.id)}
          onChange={() => onToggleRow(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "preview",
      header: "",
      width: 96,
      render: (row) =>
        row.cdnUrl ? (
          <AspectImage src={row.cdnUrl} alt="" sizes="80px" sx={{ width: 80, borderRadius: 1 }} />
        ) : (
          <Box sx={{ width: 80, height: 42, bgcolor: "surfaces.elevated", borderRadius: 1 }} />
        ),
    },
    {
      key: "sourceUrl",
      header: "Source URL",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 320,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.sourceUrl ?? "-"}
        </Typography>
      ),
    },
    {
      key: "userEmail",
      header: "User",
      render: (row) => <Typography variant="body2Muted">{row.userEmail}</Typography>,
    },
    {
      key: "projectName",
      header: "Project",
      render: (row) => <Typography variant="body2Muted">{row.projectName || "-"}</Typography>,
    },
    {
      key: "template",
      header: "Template",
      width: 140,
      render: (row) =>
        row.template ? <Chip size="small" label={row.template} variant="outlined" /> : "-",
    },
    {
      key: "serveCount",
      header: "Served",
      width: 90,
      align: "right",
      render: (row) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {row.serveCount}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: 120,
      render: (row) => (
        <Typography variant="body2Muted">{new Date(row.createdAt).toLocaleDateString()}</Typography>
      ),
    },
    {
      key: "actions",
      header: "",
      width: 60,
      align: "right",
      render: (row) => (
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(row)}>
            <DeleteIcon sx={{ fontSize: iconSizes.sm }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];
}
