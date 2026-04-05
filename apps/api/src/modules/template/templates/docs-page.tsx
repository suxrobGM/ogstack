import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title, truncate } from "./utils";

export function DocsPage(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);
  const breadcrumb = truncate(new URL(metadata.url).pathname.replace(/\//g, " / "), 80);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      {/* Sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "8px",
          height: "100%",
          backgroundColor: accent,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "60px",
          backgroundColor: theme.bg,
          gap: "16px",
        }}
      >
        {breadcrumb && (
          <div
            style={{
              fontSize: "16px",
              color: accent,
              fontFamily: "monospace",
              letterSpacing: "0.5px",
            }}
          >
            {breadcrumb}
          </div>
        )}
        <div style={{ fontSize: "52px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "22px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}
        {metadata.siteName && (
          <div style={{ fontSize: "18px", color: theme.muted, marginTop: "16px" }}>
            {metadata.siteName}
          </div>
        )}
      </div>
    </div>
  );
}
