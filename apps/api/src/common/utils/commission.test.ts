import { describe, expect, it } from "bun:test";
import { calculateCommission, calculateHoursWorked, calculateNetAmount } from "./commission";

describe("calculateNetAmount", () => {
  it("should calculate net with 15% commission", () => {
    expect(calculateNetAmount(100000, 15)).toBe(85000);
  });

  it("should calculate net with 0% commission", () => {
    expect(calculateNetAmount(50000, 0)).toBe(50000);
  });

  it("should calculate net with 100% commission", () => {
    expect(calculateNetAmount(50000, 100)).toBe(0);
  });

  it("should handle decimal amounts correctly", () => {
    expect(calculateNetAmount(33333, 10)).toBe(29999.7);
  });
});

describe("calculateCommission", () => {
  it("should calculate commission amount", () => {
    expect(calculateCommission(100000, 15)).toBe(15000);
  });

  it("should return 0 for 0% rate", () => {
    expect(calculateCommission(50000, 0)).toBe(0);
  });
});

describe("calculateHoursWorked", () => {
  it("should calculate 8 hours from 09:00 to 17:00", () => {
    expect(calculateHoursWorked("09:00", "17:00")).toBe(8);
  });

  it("should handle partial hours", () => {
    expect(calculateHoursWorked("09:00", "13:30")).toBe(4.5);
  });

  it("should handle short shifts", () => {
    expect(calculateHoursWorked("14:00", "16:00")).toBe(2);
  });
});
