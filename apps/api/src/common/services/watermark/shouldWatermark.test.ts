import { describe, expect, it } from "bun:test";
import { Plan } from "@/generated/prisma";
import { shouldWatermark } from "./watermark.service";

describe("shouldWatermark", () => {
  it("applies watermark for FREE plan", () => {
    expect(shouldWatermark(Plan.FREE)).toBe(true);
  });

  it("applies watermark for PLUS plan", () => {
    expect(shouldWatermark(Plan.PLUS)).toBe(true);
  });

  it("does not watermark PRO plan", () => {
    expect(shouldWatermark(Plan.PRO)).toBe(false);
  });
});
