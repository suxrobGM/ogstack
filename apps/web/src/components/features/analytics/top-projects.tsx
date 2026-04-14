import type { ReactElement } from "react";
import { Typography } from "@mui/material";
import { DataTable } from "@/components/ui/data/data-table";
import { EmptyState } from "@/components/ui/data/empty-state";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { fontFamilies } from "@/theme";

export interface TopProject {
  projectId: string;
  projectName: string;
  imageCount: number;
}

interface TopProjectsProps {
  projects: TopProject[];
}

export function TopProjects(props: TopProjectsProps): ReactElement {
  const { projects } = props;
  const sorted = [...projects].sort((a, b) => b.imageCount - a.imageCount).slice(0, 10);

  return (
    <>
      <SectionHeader title="Top projects" />
      {sorted.length === 0 ? (
        <EmptyState
          title="No projects to rank"
          description="Generate images to see which projects are most active."
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "name",
              header: "Project",
              render: (row) => <Typography variant="body2">{row.projectName}</Typography>,
            },
            {
              key: "count",
              header: "Images",
              render: (row) => (
                <Typography variant="body2" sx={{ fontFamily: fontFamilies.mono }}>
                  {row.imageCount.toLocaleString()}
                </Typography>
              ),
            },
          ]}
          rows={sorted}
          rowKey={(row) => row.projectId}
        />
      )}
    </>
  );
}
