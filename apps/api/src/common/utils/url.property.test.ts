import { describe, expect, it } from "bun:test";
import fc from "fast-check";
import { BadRequestError } from "@/common/errors";
import { isPrivateIP, validateUrlForFetch } from "./url";

/**
 * Property-based tests for SSRF-guard logic in `url.ts`.
 *
 * These complement the example-based suite in `url.test.ts`. The example tests
 * cover specific boundaries (172.15 allowed, 172.16 blocked, …). The properties
 * below assert invariants that must hold for *any* input drawn from a range —
 * they're the backstop against a regression that slips past the examples.
 */

const octet = () => fc.integer({ min: 0, max: 255 });

const ipv4FromOctets = (a: number, b: number, c: number, d: number) => `${a}.${b}.${c}.${d}`;

describe("isPrivateIP — property-based", () => {
  it("blocks every IP in 10.0.0.0/8", () => {
    fc.assert(
      fc.property(octet(), octet(), octet(), (b, c, d) => {
        expect(isPrivateIP(ipv4FromOctets(10, b, c, d))).toBe(true);
      }),
    );
  });

  it("blocks every IP in 127.0.0.0/8 (loopback)", () => {
    fc.assert(
      fc.property(octet(), octet(), octet(), (b, c, d) => {
        expect(isPrivateIP(ipv4FromOctets(127, b, c, d))).toBe(true);
      }),
    );
  });

  it("blocks every IP in 169.254.0.0/16 (link-local)", () => {
    fc.assert(
      fc.property(octet(), octet(), (c, d) => {
        expect(isPrivateIP(ipv4FromOctets(169, 254, c, d))).toBe(true);
      }),
    );
  });

  it("blocks every IP in 192.168.0.0/16", () => {
    fc.assert(
      fc.property(octet(), octet(), (c, d) => {
        expect(isPrivateIP(ipv4FromOctets(192, 168, c, d))).toBe(true);
      }),
    );
  });

  it("blocks every IP in 172.16.0.0/12 (RFC1918)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 16, max: 31 }), octet(), octet(), (secondOctet, c, d) => {
        expect(isPrivateIP(ipv4FromOctets(172, secondOctet, c, d))).toBe(true);
      }),
    );
  });

  it("does NOT block IPs outside 172.16/12 in 172.x.x.x", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer({ min: 0, max: 15 }), fc.integer({ min: 32, max: 255 })),
        octet(),
        octet(),
        (secondOctet, c, d) => {
          expect(isPrivateIP(ipv4FromOctets(172, secondOctet, c, d))).toBe(false);
        },
      ),
    );
  });

  it("does not block public unicast addresses (first octet in 1..9, 11..126)", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer({ min: 1, max: 9 }), fc.integer({ min: 11, max: 126 })),
        octet(),
        octet(),
        octet(),
        (a, b, c, d) => {
          expect(isPrivateIP(ipv4FromOctets(a, b, c, d))).toBe(false);
        },
      ),
    );
  });

  it("returns false for any non-IP string without throwing", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => isPrivateIP(input)).not.toThrow();
        expect(isPrivateIP(input)).toBe(false);
      }),
    );
  });
});

describe("validateUrlForFetch — property-based", () => {
  it("rejects every URL with a scheme other than http(s)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("ftp", "file", "javascript", "data", "gopher", "ssh"),
        fc.domain(),
        async (scheme, host) => {
          await expect(validateUrlForFetch(`${scheme}://${host}/path`)).rejects.toBeInstanceOf(
            BadRequestError,
          );
        },
      ),
      { numRuns: 20 },
    );
  });

  it("rejects any URL pointing to an IP literal inside a private range", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("http", "https"),
        fc.oneof(
          fc.tuple(octet(), octet(), octet()).map(([b, c, d]) => ipv4FromOctets(10, b, c, d)),
          fc.tuple(octet(), octet()).map(([c, d]) => ipv4FromOctets(192, 168, c, d)),
          fc.tuple(octet(), octet()).map(([c, d]) => ipv4FromOctets(127, 0, c, d)),
          fc
            .tuple(fc.integer({ min: 16, max: 31 }), octet(), octet())
            .map(([b, c, d]) => ipv4FromOctets(172, b, c, d)),
        ),
        async (scheme, ip) => {
          await expect(validateUrlForFetch(`${scheme}://${ip}/`)).rejects.toBeInstanceOf(
            BadRequestError,
          );
        },
      ),
      { numRuns: 30 },
    );
  });

  it("always rejects `localhost` regardless of scheme casing or path", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("http", "https", "HTTP", "HTTPS", "Http", "Https"),
        fc.webPath(),
        async (scheme, path) => {
          await expect(validateUrlForFetch(`${scheme}://localhost${path}`)).rejects.toBeInstanceOf(
            BadRequestError,
          );
        },
      ),
      { numRuns: 15 },
    );
  });

  it("rejects unparseable URLs without panicking", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => {
          try {
            new URL(s);
            return false;
          } catch {
            return true;
          }
        }),
        async (junk) => {
          await expect(validateUrlForFetch(junk)).rejects.toBeInstanceOf(BadRequestError);
        },
      ),
      { numRuns: 20 },
    );
  });
});
