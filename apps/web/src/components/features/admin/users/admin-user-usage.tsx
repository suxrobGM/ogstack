import type { ReactElement } from "react";
import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import type { AdminUserDetail } from "@/types/api";

interface AdminUserUsageProps {
  usage: AdminUserDetail["usage"];
}

export function AdminUserUsage(props: AdminUserUsageProps): ReactElement {
  const { usage } = props;

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Usage"
        description="Monthly image generation history (last 12 months)."
      />
      <Surface padding={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }}>Period</TableCell>
              <TableCell align="right" sx={{ px: 3 }}>
                Images
              </TableCell>
              <TableCell align="right" sx={{ px: 3 }}>
                AI Images
              </TableCell>
              <TableCell align="right" sx={{ px: 3 }}>
                Cache Hits
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usage.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ px: 3, py: 4, textAlign: "center" }}>
                  <Typography variant="body2Muted">No usage recorded yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              usage.map((row) => (
                <TableRow key={row.period}>
                  <TableCell sx={{ px: 3 }}>{row.period}</TableCell>
                  <TableCell align="right" sx={{ px: 3 }}>
                    {row.imageCount}
                  </TableCell>
                  <TableCell align="right" sx={{ px: 3 }}>
                    {row.aiImageCount}
                  </TableCell>
                  <TableCell align="right" sx={{ px: 3 }}>
                    {row.cacheHits}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Surface>
    </Stack>
  );
}
