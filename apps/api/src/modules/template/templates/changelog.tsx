import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function Changelog(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Version badge + date */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              borderRadius: "6px",
              backgroundColor: accent,
              fontSize: "16px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            CHANGELOG
          </div>
          <div style={{ fontSize: "16px", color: theme.muted }}>{date}</div>
        </div>

        <div style={{ fontSize: "52px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "22px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>

      {metadata.siteName && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            fontSize: "18px",
            color: theme.muted,
          }}
        >
          {metadata.siteName}
        </div>
      )}
    </div>
  );
}
