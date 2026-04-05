import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function SplitHero(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      {/* Left: text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "55%",
          padding: "60px",
          backgroundColor: theme.bg,
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "22px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}
        {metadata.siteName && (
          <div style={{ fontSize: "18px", color: accent, marginTop: "8px" }}>
            {metadata.siteName}
          </div>
        )}
      </div>

      {/* Right: pattern area */}
      <div
        style={{
          display: "flex",
          width: "45%",
          background: `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {metadata.ogImage ? (
          <img
            src={metadata.ogImage}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              backgroundColor: `${accent}44`,
            }}
          />
        )}
      </div>
    </div>
  );
}
