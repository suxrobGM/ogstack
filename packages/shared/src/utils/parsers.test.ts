import { describe, expect, it } from "bun:test";
import { parseNumericIds } from "./parsers";

describe("parseNumericIds", () => {
  it("parses a comma-separated list of positive integers", () => {
    expect(parseNumericIds("1,2,3")).toEqual([1, 2, 3]);
  });

  it("parses numeric strings with whitespace padding", () => {
    expect(parseNumericIds(" 1 , 2 , 3 ")).toEqual([1, 2, 3]);
  });

  it("filters out non-numeric segments", () => {
    expect(parseNumericIds("1,abc,2,NaN,3")).toEqual([1, 2, 3]);
  });

  it("filters out zero and negative values", () => {
    expect(parseNumericIds("0,1,-5,2")).toEqual([1, 2]);
  });

  it("returns an empty array for empty or nullish input", () => {
    expect(parseNumericIds("")).toEqual([]);
    expect(parseNumericIds(null)).toEqual([]);
    expect(parseNumericIds(undefined)).toEqual([]);
  });
});
