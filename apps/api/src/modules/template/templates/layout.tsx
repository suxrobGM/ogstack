import type { CSSProperties, ReactElement, ReactNode } from "react";

type Align = "start" | "center" | "end" | "baseline" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";

const ALIGN: Record<Align, CSSProperties["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

const JUSTIFY: Record<Justify, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

/** Pixel value or raw CSS length string. */
type Len = number | string;
const px = (v: Len | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

interface BaseProps {
  children?: ReactNode;
  style?: CSSProperties;
  bg?: string;
  padding?: Len;
  paddingX?: Len;
  paddingY?: Len;
  width?: Len;
  height?: Len;
  maxWidth?: Len;
  maxHeight?: Len;
  radius?: Len;
  border?: string;
  /** Absolute-positioning shortcuts. */
  absolute?: boolean;
  top?: Len;
  left?: Len;
  right?: Len;
  bottom?: Len;
  /** Layout. */
  flex?: number;
  gap?: number;
}

function layoutStyle(props: BaseProps): CSSProperties {
  const s: CSSProperties = {};
  if (props.bg !== undefined) s.backgroundColor = props.bg;
  if (props.padding !== undefined) s.padding = px(props.padding);
  if (props.paddingX !== undefined) {
    s.paddingLeft = px(props.paddingX);
    s.paddingRight = px(props.paddingX);
  }
  if (props.paddingY !== undefined) {
    s.paddingTop = px(props.paddingY);
    s.paddingBottom = px(props.paddingY);
  }
  if (props.width !== undefined) s.width = px(props.width);
  if (props.height !== undefined) s.height = px(props.height);
  if (props.maxWidth !== undefined) s.maxWidth = px(props.maxWidth);
  if (props.maxHeight !== undefined) s.maxHeight = px(props.maxHeight);
  if (props.radius !== undefined) s.borderRadius = px(props.radius);
  if (props.border !== undefined) s.border = props.border;
  if (props.absolute) s.position = "absolute";
  if (props.top !== undefined) s.top = px(props.top);
  if (props.left !== undefined) s.left = px(props.left);
  if (props.right !== undefined) s.right = px(props.right);
  if (props.bottom !== undefined) s.bottom = px(props.bottom);
  if (props.flex !== undefined) s.flex = props.flex;
  if (props.gap !== undefined) s.gap = `${props.gap}px`;
  return s;
}

/** Root template container (1200×630 canvas). */
export function Canvas(
  props: Omit<BaseProps, "width" | "height" | "absolute"> & { children: ReactNode },
): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        padding: px(props.padding ?? 60),
        ...layoutStyle({ ...props, padding: undefined }),
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

/** Vertical flex column. */
export function Stack(props: BaseProps & { align?: Align; justify?: Justify }): ReactElement {
  const { children, align, justify, style, ...rest } = props;
  const layout: CSSProperties = { display: "flex", flexDirection: "column" };
  if (align) layout.alignItems = ALIGN[align];
  if (justify) layout.justifyContent = JUSTIFY[justify];
  return <div style={{ ...layout, ...layoutStyle(rest), ...style }}>{children}</div>;
}

/** Horizontal flex row. */
export function Row(
  props: BaseProps & { align?: Align; justify?: Justify; wrap?: boolean },
): ReactElement {
  const { children, align = "center", justify, wrap, style, ...rest } = props;
  const layout: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: ALIGN[align],
  };
  if (justify) layout.justifyContent = JUSTIFY[justify];
  if (wrap) layout.flexWrap = "wrap";
  return <div style={{ ...layout, ...layoutStyle(rest), ...style }}>{children}</div>;
}

/** Generic flex box — use when Stack/Row don't express the intent. */
export function Box(props: BaseProps): ReactElement {
  const { children, style, ...rest } = props;
  return <div style={{ display: "flex", ...layoutStyle(rest), ...style }}>{children}</div>;
}

/** Thin horizontal/vertical rule. */
export function Rule(props: {
  color: string;
  vertical?: boolean;
  length?: Len;
  thickness?: number;
  flex?: number;
  style?: CSSProperties;
}): ReactElement {
  const { color, vertical, length, thickness = 1, flex, style } = props;
  const base: CSSProperties = { display: "flex", backgroundColor: color };
  if (flex !== undefined) base.flex = flex;
  if (vertical) {
    base.width = `${thickness}px`;
    base.height = length !== undefined ? px(length) : "100%";
  } else {
    base.height = `${thickness}px`;
    base.width = length !== undefined ? px(length) : "100%";
  }
  return <div style={{ ...base, ...style }} />;
}

/** Flex spacer that fills remaining space. */
export function Spacer(): ReactElement {
  return <div style={{ display: "flex", flex: 1 }} />;
}

/** Small filled circle (commonly used as accent dot / status). */
export function Dot(props: { color: string; size?: number; style?: CSSProperties }): ReactElement {
  const { color, size = 8, style } = props;
  return (
    <div
      style={{
        display: "flex",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "999px",
        backgroundColor: color,
        ...style,
      }}
    />
  );
}
