import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function ProductLaunch(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        height: "100%",
        padding: "60px",
        background: `linear-gradient(180deg, ${theme.bg} 0%, ${accent}15 100%)`,
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            borderRadius: "20px",
            backgroundColor: `${accent}22`,
            border: `1px solid ${accent}44`,
            fontSize: "16px",
            color: accent,
            fontWeight: 600,
          }}
        >
          NEW RELEASE
        </div>

        <div
          style={{
            fontSize: "60px",
            fontWeight: 800,
            color: theme.fg,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {heading}
        </div>
        {desc && (
          <div
            style={{
              fontSize: "24px",
              color: theme.muted,
              lineHeight: 1.4,
              maxWidth: "800px",
              textAlign: "center",
            }}
          >
            {desc}
          </div>
        )}
      </div>
    </div>
  );
}
