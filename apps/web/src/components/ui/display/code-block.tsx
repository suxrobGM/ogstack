import type { ReactElement } from "react";
import { Box } from "@mui/material";
import { Surface } from "../layout/surface";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  copyable?: boolean;
  dense?: boolean;
}

/**
 * Plain monospaced code block for API snippets and config examples.
 *
 * No syntax highlighting — keeps the bundle dependency-free. The `language`
 * prop is applied as a className hint for future highlighter integration.
 */
export function CodeBlock(props: CodeBlockProps): ReactElement {
  const { code, language, copyable = true, dense = false } = props;

  return (
    <Surface padding={0} sx={{ position: "relative", overflow: "hidden" }}>
      {copyable && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={code} tooltip="Copy code" />
        </Box>
      )}
      <Box
        component="pre"
        className={language ? `language-${language}` : undefined}
        sx={(t) => ({
          margin: 0,
          padding: dense ? 2 : 3,
          paddingRight: copyable ? 6 : undefined,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "0.8125rem",
          lineHeight: 1.65,
          color: t.palette.text.primary,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "auto",
        })}
      >
        {code}
      </Box>
    </Surface>
  );
}
