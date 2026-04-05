import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function BlogCard(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "60px",
        backgroundColor: theme.bg,
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      {/* Top: site name + author */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {metadata.favicon && (
          <img
            src={metadata.favicon}
            style={{ width: "32px", height: "32px", borderRadius: "4px" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {metadata.siteName && (
            <div style={{ fontSize: "18px", fontWeight: 600, color: theme.fg }}>
              {metadata.siteName}
            </div>
          )}
          {metadata.author && (
            <div style={{ fontSize: "16px", color: theme.muted }}>{metadata.author}</div>
          )}
        </div>
      </div>

      {/* Middle: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "48px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "22px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>

      {/* Bottom: accent bar */}
      <div
        style={{
          display: "flex",
          width: "80px",
          height: "4px",
          backgroundColor: accent,
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
