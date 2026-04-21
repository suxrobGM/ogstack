import { describe, expect, it } from "bun:test";
import { createEmptyMetadata } from "@/common/services/scraper";
import {
  description,
  formattedDate,
  logoStyles,
  luminance,
  prettyHost,
  prettyPath,
  readableOn,
  resolveTheme,
  scaleTokens,
  title,
  truncate,
  withAlpha,
} from "./utils";

describe("withAlpha", () => {
  it("converts hex to rgba with alpha", () => {
    expect(withAlpha("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
  });

  it("expands 3-char hex", () => {
    expect(withAlpha("#f00", 1)).toBe("rgba(255, 0, 0, 1)");
  });
});

describe("luminance and readableOn", () => {
  it("returns white text on dark background", () => {
    expect(readableOn("#000000")).toBe("#ffffff");
  });

  it("returns dark text on bright background", () => {
    expect(readableOn("#ffffff")).toBe("#0b0b10");
  });

  it("luminance is normalized 0..1", () => {
    expect(luminance("#000000")).toBeCloseTo(0);
    expect(luminance("#ffffff")).toBeCloseTo(1);
  });
});

describe("resolveTheme", () => {
  it("returns dark theme colors", () => {
    const theme = resolveTheme(true, "#ff00ff");
    expect(theme.bg).toBe("#0a0a0f");
    expect(theme.fg).toBe("#f5f5f7");
    expect(theme.accent).toBe("#ff00ff");
  });

  it("returns light theme colors", () => {
    const theme = resolveTheme(false, "#00ff00");
    expect(theme.bg).toBe("#ffffff");
    expect(theme.fg).toBe("#0a0a0f");
  });
});

describe("logoStyles", () => {
  it("positions top-left", () => {
    const s = logoStyles("top-left");
    expect(s.top).toBe("44px");
    expect(s.left).toBe("60px");
  });

  it("positions top-right", () => {
    const s = logoStyles("top-right");
    expect(s.top).toBe("44px");
    expect(s.right).toBe("60px");
  });

  it("positions bottom-left", () => {
    const s = logoStyles("bottom-left");
    expect(s.bottom).toBe("44px");
    expect(s.left).toBe("60px");
  });

  it("positions bottom-right", () => {
    const s = logoStyles("bottom-right");
    expect(s.bottom).toBe("44px");
    expect(s.right).toBe("60px");
  });
});

describe("truncate", () => {
  it("returns empty for nullish input", () => {
    expect(truncate(null, 10)).toBe("");
    expect(truncate(undefined, 10)).toBe("");
  });

  it("leaves short text unchanged", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("truncates with ellipsis and trims trailing whitespace", () => {
    expect(truncate("hello world and more", 10)).toBe("hello worl…");
  });
});

describe("prettyHost", () => {
  it("strips leading www.", () => {
    expect(prettyHost("https://www.example.com/page")).toBe("example.com");
  });

  it("returns input when URL parsing fails", () => {
    expect(prettyHost("not-a-url")).toBe("not-a-url");
  });
});

describe("prettyPath", () => {
  it("returns empty for root path", () => {
    expect(prettyPath("https://example.com/")).toBe("");
  });

  it("strips trailing slash", () => {
    expect(prettyPath("https://example.com/posts/")).toBe("/posts");
  });

  it("returns empty for invalid url", () => {
    expect(prettyPath("not-a-url")).toBe("");
  });
});

describe("title", () => {
  it("falls back to domain+path when no metadata title", () => {
    const metadata = createEmptyMetadata("https://example.com/posts/hello");
    const result = title({ metadata } as unknown as Parameters<typeof title>[0], 200);
    expect(result).toBe("example.com/posts/hello");
  });

  it("uses og title when present", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.ogTitle = "OG Title";
    const result = title({ metadata } as unknown as Parameters<typeof title>[0]);
    expect(result).toBe("OG Title");
  });
});

describe("description", () => {
  it("prefers og description", () => {
    const metadata = createEmptyMetadata("https://example.com");
    metadata.ogDescription = "og desc";
    expect(description({ metadata } as unknown as Parameters<typeof description>[0])).toBe(
      "og desc",
    );
  });
});

describe("formattedDate", () => {
  it("returns a non-empty formatted date string", () => {
    const s = formattedDate();
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("scaleTokens", () => {
  it("returns 'og' shape for ~16:10 aspect", () => {
    const t = scaleTokens({ width: 1200, height: 800 });
    expect(t.shape).toBe("og");
    expect(t.pad).toBe(60);
  });

  it("returns 'wide' for ~2:1 aspect", () => {
    const t = scaleTokens({ width: 1920, height: 960 });
    expect(t.shape).toBe("wide");
    expect(t.pad).toBe(112);
  });

  it("returns 'ultrawide' for 21:9 canvas", () => {
    const t = scaleTokens({ width: 2520, height: 1080 });
    expect(t.shape).toBe("ultrawide");
  });
});
