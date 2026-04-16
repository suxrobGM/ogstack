"use client";

import { Suspense, useState, type ChangeEvent, type KeyboardEvent, type ReactElement } from "react";
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { CodeBlock } from "@/components/ui/display/code-block";
import { ROUTES } from "@/lib/constants";
import { line, surfaces } from "@/theme/palette";
import { radii } from "@/theme/tokens";
import { fontFamilies } from "@/theme/typography";
import { buildOgImageUrl, buildOgMetaTag, templateThumbnailUrl } from "@/utils/og-image";
import { normalizeUrlInput } from "@/utils/url";

const DEFAULT_URL = "https://my-blog.com/building-with-bun";

const TEMPLATES = [
  "gradient_dark",
  "gradient_light",
  "split_hero",
  "blog_card",
  "centered_bold",
  "docs_page",
  "minimal",
] as const;

const DEMO_PUBLIC_ID = process.env.NEXT_PUBLIC_DEMO_PROJECT_ID;

function demoImageUrl(url: string, template: string): string | null {
  if (!DEMO_PUBLIC_ID) return null;
  return buildOgImageUrl(DEMO_PUBLIC_ID, new URLSearchParams({ url, template }));
}

export function LandingPlayground(): ReactElement {
  const router = useRouter();

  const [url, setUrl] = useState(DEFAULT_URL);
  const [template, setTemplate] = useState<string>(TEMPLATES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ url: string; template: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDemo = Boolean(DEMO_PUBLIC_ID);
  const canGenerate = url.trim().length > 0;

  const handleGenerate = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // No demo project configured — route the CTA to register so the user can
    // try the real playground rather than leaving them with a disabled button.
    if (!hasDemo) {
      router.push(ROUTES.register);
      return;
    }

    const built = demoImageUrl(trimmed, template);
    if (!built) return;
    setError(null);
    setIsLoading(true);
    setGenerated({ url: trimmed, template });
    setImageUrl(`${built}&_t=${Date.now()}`);
  };

  const generatedImageUrl = generated ? demoImageUrl(generated.url, generated.template) : null;
  const metaTag = generatedImageUrl && !error ? buildOgMetaTag(generatedImageUrl) : null;

  return (
    <Box
      sx={{
        bgcolor: surfaces.card,
        borderRadius: `${radii.lg}px`,
        border: `1px solid ${line.border}`,
        overflow: "hidden",
      }}
    >
      {/* Browser bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 0.75,
          px: 2,
          py: 1.5,
          bgcolor: surfaces.elevated,
          borderBottom: `1px solid ${line.border}`,
        }}
      >
        {["#FECACA", "#FEF08A", "#BBF7D0"].map((bg, i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: bg,
              border: `1.5px solid ${["#F87171", "#FACC15", "#4ADE80"][i]}`,
            }}
          />
        ))}
        <Typography
          sx={{
            flex: 1,
            textAlign: "center",
            fontFamily: fontFamilies.mono,
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          ogstack.dev/playground
        </Typography>
      </Stack>

      {/* Input row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ p: 2, gap: 1, borderBottom: `1px solid ${line.border}` }}
      >
        <Box
          component="input"
          value={url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(normalizeUrlInput(e.target.value))}
          placeholder="https://example.com/your-page"
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && canGenerate) handleGenerate();
          }}
          sx={{
            flex: 1,
            px: 1.75,
            py: 1.25,
            bgcolor: surfaces.base,
            border: `1px solid ${line.border}`,
            borderRadius: "8px",
            fontFamily: fontFamilies.mono,
            fontSize: 13,
            color: "text.primary",
            outline: "none",
            "&:focus": { borderColor: "accent.primary" },
          }}
        />
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          sx={{ flexShrink: 0 }}
        >
          {isLoading ? "Generating..." : hasDemo ? "Generate" : "Try it free"}
        </Button>
      </Stack>

      {/* Template selector */}
      <Stack
        direction="row"
        sx={{
          gap: 0.75,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${line.border}`,
          overflowX: "auto",
        }}
      >
        {TEMPLATES.map((slug) => {
          const selected = slug === template;
          return (
            <Box
              key={slug}
              onClick={() => setTemplate(slug)}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "6px",
                fontFamily: fontFamilies.mono,
                fontSize: 12,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 120ms",
                ...(selected
                  ? { bgcolor: "accent.primary", color: "#fff" }
                  : {
                      border: `1px solid ${line.border}`,
                      color: "text.secondary",
                      "&:hover": { borderColor: "accent.primary", color: "text.primary" },
                    }),
              }}
            >
              {slug}
            </Box>
          );
        })}
      </Stack>

      {/* Preview area */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            aspectRatio: "1200/630",
            borderRadius: `${radii.md}px`,
            overflow: "hidden",
            position: "relative",
            bgcolor: surfaces.elevated,
            backgroundImage: imageUrl ? undefined : `url(${templateThumbnailUrl(template)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageUrl && (
            <Box
              component="img"
              key={imageUrl}
              src={imageUrl}
              alt="Generated OG preview"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError("Preview generation failed. Try a different URL.");
                setImageUrl(null);
                setGenerated(null);
              }}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </Box>
      </Box>

      {/* Meta tag snippet — shown once a preview has been generated so users
          can copy the exact tag they'd paste into their own <head>. */}
      {metaTag && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography
            variant="body1Muted"
            sx={{
              fontFamily: fontFamilies.mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 1,
            }}
          >
            Drop this into your &lt;head&gt;
          </Typography>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" height={72} sx={{ borderRadius: `${radii.sm}px` }} />
            }
          >
            <CodeBlock code={metaTag} language="html" />
          </Suspense>
        </Box>
      )}

      {(!DEMO_PUBLIC_ID || error) && (
        <Box
          sx={{
            px: 3,
            pb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="captionMuted">
            {error ?? "Live preview is disabled. Sign up to try the full playground."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
