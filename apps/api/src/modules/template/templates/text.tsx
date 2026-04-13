import type { CSSProperties, ReactElement, ReactNode } from "react";

export const TEXT = {
  display: {
    fontSize: 88,
    fontWeight: 800,
    letterSpacing: "-0.035em",
    lineHeight: 1.04,
  },
  displayLg: {
    fontSize: 112,
    fontWeight: 800,
    letterSpacing: "-0.045em",
    lineHeight: 1.02,
  },
  h1: {
    fontSize: 72,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.06,
  },
  h2: {
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
  },
  h3: {
    fontSize: 48,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  body: {
    fontSize: 22,
    fontWeight: 400,
    lineHeight: 1.45,
  },
  bodyLg: {
    fontSize: 26,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  small: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  kicker: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
  },
  mono: {
    fontSize: 15,
    fontFamily: "JetBrains Mono",
    letterSpacing: "0.06em",
  },
  monoLabel: {
    fontSize: 12,
    fontFamily: "JetBrains Mono",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
  },
  serif: {
    fontFamily: "Instrument Serif",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
  },
  serifItalic: {
    fontFamily: "Instrument Serif",
    fontStyle: "italic",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
  },
} as const satisfies Record<string, CSSProperties>;

export type TextVariant = keyof typeof TEXT;

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  size?: number;
  weight?: number;
  italic?: boolean;
  serif?: boolean;
  mono?: boolean;
  align?: "left" | "center" | "right";
  maxWidth?: number | string;
  style?: CSSProperties;
}

export function Text(props: TextProps): ReactElement {
  const {
    children,
    variant = "body",
    color,
    size,
    weight,
    italic,
    serif,
    mono,
    align,
    maxWidth,
    style,
  } = props;

  const variantStyles = TEXT[variant] as CSSProperties;
  const extra: CSSProperties = {};
  if (color !== undefined) extra.color = color;
  if (size !== undefined) extra.fontSize = size;
  if (weight !== undefined) extra.fontWeight = weight;
  if (italic) extra.fontStyle = "italic";
  if (serif) extra.fontFamily = "Instrument Serif";
  if (mono) extra.fontFamily = "JetBrains Mono";
  if (align) {
    extra.textAlign = align;
    if (align === "center") extra.justifyContent = "center";
    else if (align === "right") extra.justifyContent = "flex-end";
  }
  if (maxWidth !== undefined)
    extra.maxWidth = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;

  return (
    <div
      style={{
        display: "flex",
        ...variantStyles,
        ...extra,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
