import type { CSSProperties, ReactElement } from "react";
import { describe, expect, it } from "bun:test";
import { Text, TEXT } from "./text";

function extractStyle(el: ReactElement): CSSProperties {
  const props = (el as unknown as { props: { style: CSSProperties } }).props;
  return props.style;
}

describe("Text", () => {
  it("applies default 'body' variant styles", () => {
    const el = Text({ children: "hi" });
    const style = extractStyle(el);
    expect(style.fontSize).toBe(22);
    expect(style.fontWeight).toBe(400);
  });

  it("applies specified variant styles", () => {
    const el = Text({ children: "hi", variant: "h1" });
    const style = extractStyle(el);
    expect(style.fontSize).toBe(72);
    expect(style.fontWeight).toBe(800);
  });

  it("overrides color, size, weight via props", () => {
    const el = Text({ children: "hi", color: "red", size: 42, weight: 900 });
    const style = extractStyle(el);
    expect(style.color).toBe("red");
    expect(style.fontSize).toBe(42);
    expect(style.fontWeight).toBe(900);
  });

  it("applies italic prop", () => {
    const el = Text({ children: "hi", italic: true });
    expect(extractStyle(el).fontStyle).toBe("italic");
  });

  it("uses serif family when serif flag set", () => {
    const el = Text({ children: "hi", serif: true });
    expect(extractStyle(el).fontFamily).toBe("Instrument Serif");
  });

  it("uses mono family when mono flag set", () => {
    const el = Text({ children: "hi", mono: true });
    expect(extractStyle(el).fontFamily).toBe("JetBrains Mono");
  });

  it("aligns center and sets justifyContent", () => {
    const style = extractStyle(Text({ children: "hi", align: "center" }));
    expect(style.textAlign).toBe("center");
    expect(style.justifyContent).toBe("center");
  });

  it("aligns right and sets flex-end", () => {
    const style = extractStyle(Text({ children: "hi", align: "right" }));
    expect(style.textAlign).toBe("right");
    expect(style.justifyContent).toBe("flex-end");
  });

  it("aligns left without changing justifyContent", () => {
    const style = extractStyle(Text({ children: "hi", align: "left" }));
    expect(style.textAlign).toBe("left");
    expect(style.justifyContent).toBeUndefined();
  });

  it("accepts maxWidth as number (adds px)", () => {
    expect(extractStyle(Text({ children: "hi", maxWidth: 500 })).maxWidth).toBe("500px");
  });

  it("accepts maxWidth as string (passes through)", () => {
    expect(extractStyle(Text({ children: "hi", maxWidth: "50%" })).maxWidth).toBe("50%");
  });

  it("merges explicit style prop on top", () => {
    const style = extractStyle(Text({ children: "hi", style: { color: "blue" } }));
    expect(style.color).toBe("blue");
  });

  it("exports TEXT variant dictionary", () => {
    expect(Object.keys(TEXT)).toContain("body");
    expect(Object.keys(TEXT)).toContain("h1");
    expect(Object.keys(TEXT)).toContain("mono");
  });
});
