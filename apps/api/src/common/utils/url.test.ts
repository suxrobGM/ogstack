import { beforeEach, describe, expect, it, mock } from "bun:test";
import { isPrivateIP, validateUrlForFetch } from "./url";

mock.module("node:dns/promises", () => ({
  lookup: mock(() => Promise.resolve({ address: "93.184.216.34", family: 4 })),
}));

const { lookup: mockLookup } = await import("node:dns/promises");

describe("isPrivateIP", () => {
  it("should block 10.x.x.x range", () => {
    expect(isPrivateIP("10.0.0.1")).toBe(true);
    expect(isPrivateIP("10.255.255.255")).toBe(true);
  });

  it("should block 127.x.x.x loopback", () => {
    expect(isPrivateIP("127.0.0.1")).toBe(true);
    expect(isPrivateIP("127.0.0.2")).toBe(true);
  });

  it("should block 169.254.x.x link-local", () => {
    expect(isPrivateIP("169.254.1.1")).toBe(true);
  });

  it("should block 192.168.x.x range", () => {
    expect(isPrivateIP("192.168.0.1")).toBe(true);
    expect(isPrivateIP("192.168.255.255")).toBe(true);
  });

  it("should block 172.16-31.x.x range", () => {
    expect(isPrivateIP("172.16.0.1")).toBe(true);
    expect(isPrivateIP("172.31.255.255")).toBe(true);
  });

  it("should allow 172.15.x.x and 172.32.x.x", () => {
    expect(isPrivateIP("172.15.0.1")).toBe(false);
    expect(isPrivateIP("172.32.0.1")).toBe(false);
  });

  it("should block 0.x.x.x range", () => {
    expect(isPrivateIP("0.0.0.0")).toBe(true);
  });

  it("should allow public IPs", () => {
    expect(isPrivateIP("8.8.8.8")).toBe(false);
    expect(isPrivateIP("93.184.216.34")).toBe(false);
    expect(isPrivateIP("1.1.1.1")).toBe(false);
  });

  it("should block IPv6 loopback", () => {
    expect(isPrivateIP("::1")).toBe(true);
  });

  it("should block IPv6 mapped loopback", () => {
    expect(isPrivateIP("::ffff:127.0.0.1")).toBe(true);
  });

  it("should block IPv6 link-local", () => {
    expect(isPrivateIP("fe80::1")).toBe(true);
  });

  it("should block IPv6 unique local (fc00/fd00)", () => {
    expect(isPrivateIP("fc00::1")).toBe(true);
    expect(isPrivateIP("fd00::1")).toBe(true);
  });
});

describe("validateUrlForFetch", () => {
  beforeEach(() => {
    (mockLookup as ReturnType<typeof mock>).mockResolvedValue({
      address: "93.184.216.34",
      family: 4,
    });
  });

  it("should accept valid HTTPS URLs", async () => {
    const url = await validateUrlForFetch("https://example.com");
    expect(url.hostname).toBe("example.com");
  });

  it("should accept valid HTTP URLs", async () => {
    const url = await validateUrlForFetch("http://example.com");
    expect(url.hostname).toBe("example.com");
  });

  it("should reject invalid URLs", async () => {
    await expect(validateUrlForFetch("not-a-url")).rejects.toThrow("isn't valid");
  });

  it("should reject non-HTTP schemes", async () => {
    await expect(validateUrlForFetch("ftp://example.com")).rejects.toThrow("http:// and https://");
    await expect(validateUrlForFetch("file:///etc/passwd")).rejects.toThrow("http:// and https://");
    await expect(validateUrlForFetch("javascript:alert(1)")).rejects.toThrow(
      "http:// and https://",
    );
  });

  it("should reject localhost", async () => {
    await expect(validateUrlForFetch("http://localhost")).rejects.toThrow("Localhost");
    await expect(validateUrlForFetch("http://localhost:3000")).rejects.toThrow("Localhost");
  });

  it("should reject private IP addresses directly in URL", async () => {
    await expect(validateUrlForFetch("http://10.0.0.1")).rejects.toThrow("Private IP addresses");
    await expect(validateUrlForFetch("http://192.168.1.1")).rejects.toThrow("Private IP addresses");
    await expect(validateUrlForFetch("http://127.0.0.1")).rejects.toThrow("Private IP addresses");
    await expect(validateUrlForFetch("http://172.16.0.1")).rejects.toThrow("Private IP addresses");
  });

  it("should reject URLs that resolve to private IPs via DNS", async () => {
    (mockLookup as ReturnType<typeof mock>).mockResolvedValue({
      address: "192.168.1.1",
      family: 4,
    });

    await expect(validateUrlForFetch("https://evil.example.com")).rejects.toThrow(
      "resolves to a private network address",
    );
  });

  it("should allow URLs that resolve to public IPs", async () => {
    const url = await validateUrlForFetch("https://example.com/page");
    expect(url.pathname).toBe("/page");
  });
});
