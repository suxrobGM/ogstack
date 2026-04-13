import type { ReactElement } from "react";

interface WatermarkBadgeProps {
  width: number;
  height: number;
}

export function WatermarkBadge(props: WatermarkBadgeProps): ReactElement {
  const { width, height } = props;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: `${width}px`,
        height: `${height}px`,
        padding: "0 10px",
        gap: "6px",
        borderRadius: "999px",
        backgroundColor: "rgba(0, 0, 0, 0.42)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "5px",
          height: "5px",
          borderRadius: "999px",
          backgroundColor: "rgba(255,255,255,0.85)",
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        ogstack.dev
      </div>
    </div>
  );
}
