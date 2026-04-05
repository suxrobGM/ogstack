import type { ReactElement } from "react";
import type { TemplateProps } from "./types";
import { logoStyles, resolveTheme, title } from "./utils";

export function Minimal(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "100px",
        backgroundColor: theme.bg,
        position: "relative",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <div
        style={{
          fontSize: "56px",
          fontWeight: 600,
          color: theme.fg,
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        {heading}
      </div>
    </div>
  );
}
