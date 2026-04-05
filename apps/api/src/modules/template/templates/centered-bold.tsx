import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { description, logoStyles, resolveTheme, title } from "./utils";

export function CenteredBold(props: TemplateProps): ReactElement {
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
        padding: "80px",
        backgroundColor: theme.bg,
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
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

      {/* Subtle accent line */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "4px",
          backgroundColor: accent,
        }}
      />
    </div>
  );
}
