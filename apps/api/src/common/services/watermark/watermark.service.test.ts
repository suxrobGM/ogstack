import { describe, expect, it } from "bun:test";
import { shouldWatermark } from "./watermark.service";

describe("shouldWatermark", () => {
  it("watermarks FREE plan", () => {
    expect(shouldWatermark("FREE")).toBe(true);
  });

  it("watermarks PLUS plan", () => {
    expect(shouldWatermark("PLUS")).toBe(true);
  });

  it("does not watermark PRO plan", () => {
    expect(shouldWatermark("PRO")).toBe(false);
  });
});
