import { describe, expect, it } from "bun:test";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("should return a bcrypt hash", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("should produce different hashes for the same input", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("should return true for matching password", async () => {
    const hash = await hashPassword("correct");
    expect(await verifyPassword("correct", hash)).toBe(true);
  });

  it("should return false for wrong password", async () => {
    const hash = await hashPassword("correct");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
