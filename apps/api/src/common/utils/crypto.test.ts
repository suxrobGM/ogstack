import { describe, expect, it } from "bun:test";
import { generateApiKey, generatePublicId, generateRandomToken, hashSha256 } from "./crypto";

describe("generatePublicId", () => {
  it("should return a 12-character hex string", () => {
    const id = generatePublicId();
    expect(id).toHaveLength(12);
    expect(id).toMatch(/^[0-9a-f]{12}$/);
  });

  it("should return unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generatePublicId()));
    expect(ids.size).toBe(50);
  });
});

describe("generateRandomToken", () => {
  it("should return a 64-character hex string", () => {
    const token = generateRandomToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should return unique values", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateRandomToken()));
    expect(tokens.size).toBe(50);
  });
});

describe("generateApiKey", () => {
  it("should return raw key with og_live_ prefix", () => {
    const { raw } = generateApiKey();
    expect(raw.startsWith("og_live_")).toBe(true);
  });

  it("should return a truncated prefix ending with ...", () => {
    const { prefix } = generateApiKey();
    expect(prefix.startsWith("og_live_")).toBe(true);
    expect(prefix.endsWith("...")).toBe(true);
  });

  it("should return unique raw keys", () => {
    const keys = new Set(Array.from({ length: 20 }, () => generateApiKey().raw));
    expect(keys.size).toBe(20);
  });
});

describe("hashSha256", () => {
  it("should return a 64-character hex digest", async () => {
    const hash = await hashSha256("hello");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should produce deterministic output", async () => {
    const a = await hashSha256("test-input");
    const b = await hashSha256("test-input");
    expect(a).toBe(b);
  });

  it("should produce different output for different input", async () => {
    const a = await hashSha256("input-a");
    const b = await hashSha256("input-b");
    expect(a).not.toBe(b);
  });
});
