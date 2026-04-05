import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function GithubRepo(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "60px",
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "12px",
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Repo icon + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="28" height="28" viewBox="0 0 16 16" fill={theme.muted}>
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
          </svg>
          <div style={{ fontSize: "22px", color: theme.muted, fontFamily: "monospace" }}>
            {metadata.siteName ?? new URL(metadata.url).hostname}
          </div>
        </div>

        <div style={{ fontSize: "48px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "22px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}

        {/* Language indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: accent,
            }}
          />
          <div style={{ fontSize: "16px", color: theme.muted }}>
            {new URL(metadata.url).hostname}
          </div>
        </div>
      </div>
    </div>
  );
}
