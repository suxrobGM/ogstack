import { describe, expect, it } from "bun:test";
import { shouldWatermark } from "./watermark.service";

describe("shouldWatermark", () => {
  it("watermarks FREE plan", () => {
    expect(shouldWatermark("FREE")).toBe(true);
  });

  it("watermarks PRO plan", () => {
    expect(shouldWatermark("PRO")).toBe(true);
  });

  it("does not watermark BUSINESS plan", () => {
    expect(shouldWatermark("BUSINESS")).toBe(false);
  });

  it("does not watermark ENTERPRISE plan", () => {
    expect(shouldWatermark("ENTERPRISE")).toBe(false);
  });
});
