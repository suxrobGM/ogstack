import type { ReactElement } from "react";
import { Stack } from "@mui/material";
import { ImagesOverTimeChart } from "@/components/features/analytics/images-over-time-chart";
import {
  PeriodSelector,
  type AnalyticsRange,
} from "@/components/features/analytics/period-selector";
import { PeriodSummary } from "@/components/features/analytics/period-summary";
import { TemplateBreakdown } from "@/components/features/analytics/template-breakdown";
import { TopProjects, type TopProject } from "@/components/features/analytics/top-projects";
import { PageHeader } from "@/components/ui/layout/page-header";
import { getServerClient } from "@/lib/api/server";
import type { ImageItem } from "@/types/api";
import { formatPeriod } from "@/utils/formatters";

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

function parseRange(value: string | undefined): AnalyticsRange {
  if (value === "3m" || value === "12m" || value === "all") return value;
  return "30d";
}

function rangeToDateRange(range: AnalyticsRange): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  if (range === "30d") from.setUTCDate(from.getUTCDate() - 30);
  else if (range === "3m") from.setUTCMonth(from.getUTCMonth() - 3);
  else if (range === "12m") from.setUTCMonth(from.getUTCMonth() - 12);
  else from.setUTCMonth(from.getUTCMonth() - 24);
  return { from, to };
}

function aggregateTemplates(images: ImageItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const img of images) {
    const name = img.template?.name;
    if (!name) continue;
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

function aggregateTopProjects(images: ImageItem[]): TopProject[] {
  const counts = new Map<string, TopProject>();
  for (const img of images) {
    if (!img.projectId) continue;
    const existing = counts.get(img.projectId);
    if (existing) {
      existing.imageCount += 1;
    } else {
      counts.set(img.projectId, {
        projectId: img.projectId,
        projectName: img.projectName ?? img.projectId,
        imageCount: 1,
      });
    }
  }
  return Array.from(counts.values());
}

function averageGenerationMs(images: ImageItem[]): number | null {
  const values = images
    .map((i) => i.generationMs)
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default async function AnalyticsPage(props: AnalyticsPageProps): Promise<ReactElement> {
  const params = await props.searchParams;
  const range = parseRange(params.range);
  const useDaily = range === "30d";

  const client = await getServerClient();

  const dateRange = rangeToDateRange(range);

  const [usageRes, imagesRes, dailyRes, historyRes] = await Promise.all([
    client.api.usage.stats.get({ query: {} }),
    client.api.images.get({ query: { page: 1, limit: 100 } }),
    useDaily ? client.api.usage.daily.get({ query: dateRange }) : Promise.resolve({ data: null }),
    !useDaily
      ? client.api.usage.history.get({ query: dateRange })
      : Promise.resolve({ data: null }),
  ]);

  const usage = usageRes.data;
  const images = imagesRes.data?.items ?? [];
  const daily = dailyRes.data ?? [];
  const history = historyRes.data ?? [];

  const points = useDaily
    ? daily.map((d) => {
        const iso = d.date.toISOString().slice(0, 10);
        return {
          label: iso.slice(5),
          tooltip: `${iso} — ${d.imageCount} image${d.imageCount === 1 ? "" : "s"}`,
          value: d.imageCount,
        };
      })
    : history.map((h) => ({
        label: h.period,
        tooltip: `${formatPeriod(h.period)} — ${h.imageCount} image${h.imageCount === 1 ? "" : "s"}`,
        value: h.imageCount,
      }));

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Analytics"
        description="Usage trends for your account."
        actions={<PeriodSelector value={range} />}
      />
      {usage && <PeriodSummary usage={usage} avgGenerationMs={averageGenerationMs(images)} />}
      <ImagesOverTimeChart
        title={useDaily ? "Images per day" : "Images per month"}
        points={points}
      />
      <TemplateBreakdown counts={aggregateTemplates(images)} />
      <TopProjects projects={aggregateTopProjects(images)} />
    </Stack>
  );
}
