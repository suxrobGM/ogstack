import type { ReactElement } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Metadata } from "next";
import { FinalCtaSection } from "@/components/features/landing";
import { Surface } from "@/components/ui/layout/surface";

export const metadata: Metadata = {
  title: "Compare OGStack vs. alternatives",
  description:
    "How OGStack compares to Vercel OG, Cloudinary, and manual screenshots for generating Open Graph images - features, pricing, and AI capabilities side-by-side.",
  keywords: [
    "ogstack vs vercel og",
    "ogstack vs cloudinary",
    "og image comparison",
    "best og image generator",
    "vercel og alternative",
    "cloudinary alternative",
    "og image api comparison",
  ],
  alternates: { canonical: "/compare" },
};

type Cell = boolean | "partial" | string;

interface Row {
  label: string;
  cells: [Cell, Cell, Cell, Cell];
}

const COLUMNS = ["OGStack", "Vercel OG", "Cloudinary", "Manual screenshots"] as const;

const ROWS: Row[] = [
  { label: "Single meta tag integration", cells: [true, false, false, false] },
  { label: "Content-aware AI image generation", cells: [true, false, false, false] },
  { label: "AI audit recommendations", cells: [true, false, false, false] },
  { label: "AI page analysis", cells: [true, false, false, false] },
  {
    label: "Pre-built templates",
    cells: ["Crafted library", "Build your own", "Build your own", false],
  },
  { label: "Global CDN caching", cells: [true, true, true, false] },
  { label: "Sub-500ms template render", cells: [true, true, "partial", false] },
  { label: "Unlimited non-AI renders", cells: [true, false, false, false] },
  { label: "SSRF-safe scraping", cells: [true, false, false, false] },
  { label: "Per-project domain allowlist", cells: [true, false, false, false] },
  { label: "Playground & public audit", cells: [true, false, false, false] },
  { label: "Free tier", cells: [true, true, "partial", true] },
];

export default function ComparePage(): ReactElement {
  return (
    <>
      <Container maxWidth="md" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <Typography variant="overline" sx={{ color: "accent.primary" }}>
            Compare
          </Typography>
          <Typography variant="h1">OGStack vs. the alternatives</Typography>
          <Typography variant="body1Muted" sx={{ maxWidth: 640 }}>
            Every team solves Open Graph differently. Here&apos;s an honest side-by-side of what you
            get - and don&apos;t - across the common options.
          </Typography>
        </Stack>
      </Container>

      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Surface variant="quiet" padding={0} sx={{ overflow: "auto" }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220, fontWeight: 600 }}>Feature</TableCell>
                  {COLUMNS.map((col, i) => (
                    <TableCell
                      key={col}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        ...(i === 0 && { color: "accent.primary" }),
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ROWS.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    {row.cells.map((cell, idx) => (
                      <TableCell key={idx} align="center">
                        <CellRender value={cell} highlight={idx === 0} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Surface>
          <Typography variant="captionMuted" sx={{ mt: 2, display: "block" }}>
            Data reflects publicly documented features as of this writing. Vercel OG, Cloudinary,
            and manual-screenshot workflows remain great for specific use cases - OGStack is
            designed for teams who&apos;d rather not build the AI + scraping + template pipeline
            themselves.
          </Typography>
        </Container>
      </Box>

      <FinalCtaSection />
    </>
  );
}

interface CellRenderProps {
  value: Cell;
  highlight?: boolean;
}

function CellRender(props: CellRenderProps): ReactElement {
  const { value, highlight } = props;
  if (value === true) {
    return (
      <CheckIcon sx={{ color: highlight ? "accent.primary" : "success.main", fontSize: 20 }} />
    );
  }
  if (value === false) {
    return <CloseIcon sx={{ color: "text.disabled", fontSize: 20 }} />;
  }
  if (value === "partial") {
    return <RemoveIcon sx={{ color: "warning.main", fontSize: 20 }} />;
  }
  return (
    <Typography variant="body2" sx={{ fontWeight: highlight ? 600 : 400 }}>
      {value}
    </Typography>
  );
}
