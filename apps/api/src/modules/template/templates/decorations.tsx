import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Box, Dot, Row, Stack } from "./layout";
import { Text, TEXT } from "./text";
import { withAlpha } from "./utils";

/**
 * Atmospheric radial glow. Satori has no `filter: blur`, so we stack
 * radial-gradients with varying stops to fake a soft light.
 */
export function RadialGlow(props: {
  color: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size?: string;
  intensity?: number;
}): ReactElement {
  const { color, top, left, right, bottom, size = "800px", intensity = 0.55 } = props;
  const outer = withAlpha(color, intensity);
  const mid = withAlpha(color, intensity * 0.4);
  const pos: CSSProperties = {};
  if (top !== undefined) pos.top = top;
  if (left !== undefined) pos.left = left;
  if (right !== undefined) pos.right = right;
  if (bottom !== undefined) pos.bottom = bottom;
  return (
    <Box
      absolute
      width={size}
      height={size}
      style={{
        ...pos,
        background: `radial-gradient(circle at center, ${outer} 0%, ${mid} 30%, rgba(0,0,0,0) 65%)`,
      }}
    />
  );
}

/** Dot grid overlay — SVG `<pattern>` embedded as data URI. */
export function DotGrid(props: {
  color: string;
  opacity?: number;
  spacing?: number;
  radius?: number;
}): ReactElement {
  const { color, opacity = 0.18, spacing = 28, radius = 1.4 } = props;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="dots" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><circle cx="${spacing / 2}" cy="${spacing / 2}" r="${radius}" fill="${color}" fill-opacity="${opacity}"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg>`;
  const encoded = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return (
    <Box
      absolute
      top={0}
      left={0}
      width="100%"
      height="100%"
      style={{ backgroundImage: `url(${encoded})`, backgroundSize: "cover" }}
    />
  );
}

export function LineGrid(props: {
  color: string;
  opacity?: number;
  spacing?: number;
}): ReactElement {
  const { color, opacity = 0.08, spacing = 64 } = props;
  const stroke = withAlpha(color, opacity);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="lines" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="${stroke}" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#lines)"/></svg>`;
  const encoded = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return (
    <Box
      absolute
      top={0}
      left={0}
      width="100%"
      height="100%"
      style={{ backgroundImage: `url(${encoded})` }}
    />
  );
}

export function Pill(props: {
  children: ReactNode;
  color: string;
  textColor: string;
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md";
  style?: CSSProperties;
}): ReactElement {
  const { children, color, textColor, variant = "soft", size = "md", style } = props;
  const pad = size === "sm" ? "6px 12px" : "8px 18px";
  const fontSize = size === "sm" ? "14px" : "16px";

  let bg = "transparent";
  let border = `1px solid ${color}`;
  if (variant === "solid") bg = color;
  else if (variant === "soft") {
    bg = withAlpha(color, 0.16);
    border = `1px solid ${withAlpha(color, 0.28)}`;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: pad,
        borderRadius: "999px",
        backgroundColor: bg,
        border,
        color: textColor,
        fontSize,
        fontWeight: 600,
        letterSpacing: "0.02em",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Kicker(props: { children: ReactNode; color: string; size?: number }): ReactElement {
  const { children, color, size } = props;
  return (
    <Text variant="kicker" color={color} size={size ?? 15} weight={600}>
      {children}
    </Text>
  );
}

export function GradientHeading(props: {
  children: ReactNode;
  from: string;
  to: string;
  size: number;
  weight?: number;
  style?: CSSProperties;
}): ReactElement {
  const { children, from, to, size, weight = 800, style } = props;
  return (
    <div
      style={{
        display: "flex",
        fontSize: `${size}px`,
        fontWeight: weight,
        lineHeight: 1.02,
        letterSpacing: "-0.035em",
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AvatarCircle(props: {
  src?: string;
  initial: string;
  size?: number;
  bg: string;
  fg: string;
  border?: string;
}): ReactElement {
  const { src, initial, size = 56, bg, fg, border } = props;
  if (src) {
    return (
      <img
        src={src}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "999px",
          border: border ?? "none",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "999px",
        backgroundColor: bg,
        color: fg,
        fontSize: `${size * 0.44}px`,
        fontWeight: 700,
        border: border ?? "none",
      }}
    >
      {initial.toUpperCase()}
    </div>
  );
}

export function CornerMarks(props: { color: string; size?: number }): ReactElement {
  const { color, size = 18 } = props;
  const thickness = 2;
  const box: CSSProperties = {
    display: "flex",
    position: "absolute",
    width: `${size}px`,
    height: `${size}px`,
  };
  const h = { display: "flex", height: `${thickness}px`, backgroundColor: color };
  const v = { display: "flex", width: `${thickness}px`, backgroundColor: color };
  return (
    <>
      <div style={{ ...box, top: "36px", left: "36px" }}>
        <div style={{ ...h, width: "100%", position: "absolute", top: 0, left: 0 }} />
        <div style={{ ...v, height: "100%", position: "absolute", top: 0, left: 0 }} />
      </div>
      <div style={{ ...box, top: "36px", right: "36px" }}>
        <div style={{ ...h, width: "100%", position: "absolute", top: 0, right: 0 }} />
        <div style={{ ...v, height: "100%", position: "absolute", top: 0, right: 0 }} />
      </div>
      <div style={{ ...box, bottom: "36px", left: "36px" }}>
        <div style={{ ...h, width: "100%", position: "absolute", bottom: 0, left: 0 }} />
        <div style={{ ...v, height: "100%", position: "absolute", bottom: 0, left: 0 }} />
      </div>
      <div style={{ ...box, bottom: "36px", right: "36px" }}>
        <div style={{ ...h, width: "100%", position: "absolute", bottom: 0, right: 0 }} />
        <div style={{ ...v, height: "100%", position: "absolute", bottom: 0, right: 0 }} />
      </div>
    </>
  );
}

export function StatChip(props: {
  label: string;
  value: string;
  color: string;
  muted: string;
  border: string;
}): ReactElement {
  const { label, value, color, muted, border } = props;
  return (
    <Stack
      gap={4}
      padding="14px 20px"
      radius={12}
      border={`1px solid ${border}`}
      style={{ minWidth: "140px" }}
    >
      <Text variant="monoLabel" color={muted}>
        {label}
      </Text>
      <Text size={22} color={color} weight={700}>
        {value}
      </Text>
    </Stack>
  );
}

export function LabelValue(props: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}): ReactElement {
  return (
    <Stack gap={3}>
      <Text variant="monoLabel" size={11} color={props.labelColor}>
        {props.label}
      </Text>
      <Text size={16} color={props.valueColor} weight={600}>
        {props.value}
      </Text>
    </Stack>
  );
}
