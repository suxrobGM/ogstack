"use client";

import { use, type ReactElement } from "react";
import { Box } from "@mui/material";
import { codeToHtml } from "shiki";
import { fontFamilies, line, surfaces } from "@/theme";
import { Surface } from "../layout/surface";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  copyable?: boolean;
  dense?: boolean;
}

const highlightCache = new Map<string, Promise<string>>();

function getHighlightedHtml(code: string, language: string): Promise<string> {
  const cacheKey = `${language}:${code}`;
  const cached = highlightCache.get(cacheKey);
  if (cached) return cached;

  const promise = codeToHtml(code, {
    lang: language,
    theme: "github-light",
  });
  highlightCache.set(cacheKey, promise);
  return promise;
}

/**
 * Monospaced code block with syntax highlighting via Shiki.
 * Uses React 19 `use()` to suspend while highlighting resolves.
 */
export function CodeBlock(props: CodeBlockProps): ReactElement {
  const { code, language, copyable = true, dense = false } = props;

  const html = language ? use(getHighlightedHtml(code, language)) : null;

  return (
    <Surface padding={0} sx={{ position: "relative", overflow: "hidden" }}>
      {copyable && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={code} tooltip="Copy code" />
        </Box>
      )}
      {html ? (
        <Box
          dangerouslySetInnerHTML={{ __html: html }}
          sx={{
            "& pre": {
              margin: 0,
              padding: dense ? 2 : 3,
              paddingRight: copyable ? 6 : undefined,
              fontFamily: fontFamilies.mono,
              fontSize: "0.8125rem",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "auto",
              backgroundColor: `${surfaces.elevated} !important`,
              border: `1px solid ${line.divider}`,
              borderRadius: 1,
            },
            "& code": {
              fontFamily: fontFamilies.mono,
            },
          }}
        />
      ) : (
        <Box
          component="pre"
          sx={{
            margin: 0,
            padding: dense ? 2 : 3,
            paddingRight: copyable ? 6 : undefined,
            fontFamily: fontFamilies.mono,
            fontSize: "0.8125rem",
            lineHeight: 1.65,
            color: "text.primary",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "auto",
          }}
        >
          {code}
        </Box>
      )}
    </Surface>
  );
}
