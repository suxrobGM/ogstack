import { describe, expect, it } from "bun:test";
import {
  aiModelLabel,
  isValidDomain,
  isValidHttpUrl,
  isValidIpAddress,
  parseDomainList,
} from "./validators";

describe("isValidIpAddress", () => {
  it("accepts canonical IPv4 addresses", () => {
    expect(isValidIpAddress("127.0.0.1")).toBe(true);
    expect(isValidIpAddress("192.168.1.1")).toBe(true);
    expect(isValidIpAddress("255.255.255.255")).toBe(true);
    expect(isValidIpAddress("0.0.0.0")).toBe(true);
  });

  it("rejects out-of-range octets", () => {
    expect(isValidIpAddress("256.0.0.1")).toBe(false);
    expect(isValidIpAddress("192.168.1.999")).toBe(false);
  });

  it("rejects malformed shapes", () => {
    expect(isValidIpAddress("192.168.1")).toBe(false);
    expect(isValidIpAddress("192.168.1.1.1")).toBe(false);
    expect(isValidIpAddress("")).toBe(false);
    expect(isValidIpAddress("not-an-ip")).toBe(false);
    expect(isValidIpAddress("::1")).toBe(false);
  });
});

describe("isValidDomain", () => {
  it("accepts multi-label domains", () => {
    expect(isValidDomain("example.com")).toBe(true);
    expect(isValidDomain("sub.example.co.uk")).toBe(true);
    expect(isValidDomain("x-y.z-w.org")).toBe(true);
    expect(isValidDomain("Example.COM")).toBe(true);
  });

  it("rejects single-label hostnames", () => {
    expect(isValidDomain("localhost")).toBe(false);
    expect(isValidDomain("example")).toBe(false);
  });

  it("rejects leading hyphens and invalid characters", () => {
    expect(isValidDomain("-bad.com")).toBe(false);
    expect(isValidDomain("bad.-com")).toBe(false);
    expect(isValidDomain("foo.com$")).toBe(false);
    expect(isValidDomain("foo bar.com")).toBe(false);
    expect(isValidDomain("")).toBe(false);
  });
});

describe("isValidHttpUrl", () => {
  it("accepts well-formed http(s) URLs", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com/path?q=1")).toBe(true);
    expect(isValidHttpUrl("https://sub.example.co.uk/page")).toBe(true);
    expect(isValidHttpUrl("http://127.0.0.1:3000")).toBe(true);
    expect(isValidHttpUrl("http://localhost:3000")).toBe(true);
  });

  it("rejects empty or whitespace-only input", () => {
    expect(isValidHttpUrl("")).toBe(false);
    expect(isValidHttpUrl("   ")).toBe(false);
  });

  it("rejects URLs containing whitespace anywhere", () => {
    expect(isValidHttpUrl("https://example.com ads")).toBe(false);
    expect(isValidHttpUrl(" https://example.com")).toBe(false);
    expect(isValidHttpUrl("https://exa mple.com")).toBe(false);
  });

  it("rejects non-http schemes", () => {
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects URLs with junk authorities that WHATWG would otherwise accept", () => {
    expect(isValidHttpUrl("https://depvault.com$")).toBe(false);
    expect(isValidHttpUrl("https://foo!bar.com")).toBe(false);
  });

  it("rejects non-URL strings", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("example.com")).toBe(false);
  });
});

describe("parseDomainList", () => {
  it("splits on commas and newlines", () => {
    expect(parseDomainList("a.com,b.com\nc.com")).toEqual(["a.com", "b.com", "c.com"]);
  });

  it("trims, lowercases, and de-duplicates entries", () => {
    expect(parseDomainList("  Foo.COM , foo.com\nBAR.com")).toEqual(["foo.com", "bar.com"]);
  });

  it("drops empty segments", () => {
    expect(parseDomainList(",a.com,,\n,b.com")).toEqual(["a.com", "b.com"]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseDomainList("")).toEqual([]);
  });
});

describe("aiModelLabel", () => {
  it("returns null for missing input", () => {
    expect(aiModelLabel(null)).toBeNull();
    expect(aiModelLabel(undefined)).toBeNull();
    expect(aiModelLabel("")).toBeNull();
  });

  it("maps any model ID containing 'pro' to 'Pro'", () => {
    expect(aiModelLabel("fal-ai/flux-2-pro")).toBe("Pro");
    expect(aiModelLabel("FLUX-2-PRO")).toBe("Pro");
  });

  it("defaults to 'Standard' for other model IDs", () => {
    expect(aiModelLabel("fal-ai/flux-2")).toBe("Standard");
    expect(aiModelLabel("some-other-model")).toBe("Standard");
  });
});
