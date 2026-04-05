import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function GradientLight(props: TemplateProps): ReactElement {
  const { accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(false, accent);
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
        background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.surface} 100%)`,
        borderBottom: `4px solid ${accent}`,
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "56px", fontWeight: 700, color: theme.fg, lineHeight: 1.2 }}>
          {heading}
        </div>
        {desc && (
          <div style={{ fontSize: "24px", color: theme.muted, lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>

      {metadata.siteName && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            fontSize: "20px",
            color: theme.muted,
          }}
        >
          {metadata.siteName}
        </div>
      )}
    </div>
  );
}
