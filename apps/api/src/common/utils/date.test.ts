import { describe, expect, it } from "bun:test";
import { getPeriodStart } from "./date";

describe("getPeriodStart", () => {
  it("should return start of today for 'today'", () => {
    const result = getPeriodStart("today")!;
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("should return a date ~7 days ago for 'week'", () => {
    const result = getPeriodStart("week")!;
    const diff = Date.now() - result.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(diff - sevenDaysMs)).toBeLessThan(100);
  });

  it("should return a date ~30 days ago for 'month'", () => {
    const result = getPeriodStart("month")!;
    const diff = Date.now() - result.getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(Math.abs(diff - thirtyDaysMs)).toBeLessThan(100);
  });

  it("should return null for 'all'", () => {
    expect(getPeriodStart("all")).toBeNull();
  });

  it("should return null for unknown period", () => {
    expect(getPeriodStart("unknown")).toBeNull();
  });
});
