import { describe, expect, it } from "bun:test";
import fc from "fast-check";
import {
  hostMatchesDomain,
  isValidDomain,
  isValidHttpUrl,
  isValidIpAddress,
  parseDomainList,
} from "./validators";

/**
 * Property-based tests for the shared validator/parser utilities.
 *
 * The example-based `validators.test.ts` fixes specific inputs; these properties
 * assert invariants that must hold across *ranges* of inputs — the kind of
 * assertion that's easy to overlook when writing examples by hand.
 */

const octet = () => fc.integer({ min: 0, max: 255 });
const ipv4 = () =>
  fc.tuple(octet(), octet(), octet(), octet()).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

describe("isValidIpAddress — properties", () => {
  it("accepts every well-formed IPv4 literal", () => {
    fc.assert(
      fc.property(ipv4(), (ip) => {
        expect(isValidIpAddress(ip)).toBe(true);
      }),
    );
  });

  it("rejects any string containing whitespace", () => {
    fc.assert(
      fc.property(ipv4(), fc.constantFrom(" ", "\t", "\n"), (ip, ws) => {
        expect(isValidIpAddress(`${ws}${ip}`)).toBe(false);
        expect(isValidIpAddress(`${ip}${ws}`)).toBe(false);
      }),
    );
  });

  it("rejects IPs with out-of-range octets (256..999)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 256, max: 999 }), octet(), octet(), octet(), (bad, b, c, d) => {
        expect(isValidIpAddress(`${bad}.${b}.${c}.${d}`)).toBe(false);
      }),
    );
  });
});

describe("isValidDomain — properties", () => {
  const label = () =>
    fc
      .string({
        unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")),
        minLength: 1,
        maxLength: 20,
      })
      .filter((s) => s.length > 0);

  const domainOfNLabels = (n: number) =>
    fc.array(label(), { minLength: n, maxLength: n }).map((parts) => parts.join("."));

  it("accepts a domain with 2+ valid labels", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 4 }), (n) => {
        fc.assert(
          fc.property(domainOfNLabels(n), (d) => {
            expect(isValidDomain(d)).toBe(true);
          }),
          { numRuns: 20 },
        );
      }),
      { numRuns: 3 },
    );
  });

  it("rejects single-label hostnames", () => {
    fc.assert(
      fc.property(label(), (single) => {
        expect(isValidDomain(single)).toBe(false);
      }),
    );
  });

  it("rejects any domain whose first character is a hyphen", () => {
    fc.assert(
      fc.property(domainOfNLabels(2), (d) => {
        expect(isValidDomain(`-${d}`)).toBe(false);
      }),
    );
  });
});

describe("hostMatchesDomain — properties", () => {
  const validDomain = () =>
    fc.constantFrom("example.com", "ogstack.dev", "docs.ogstack.dev", "foo.bar.example.co");

  it("is reflexive for any valid domain", () => {
    fc.assert(
      fc.property(validDomain(), (d) => {
        expect(hostMatchesDomain(d, d)).toBe(true);
      }),
    );
  });

  it("matches any subdomain of the given domain", () => {
    fc.assert(
      fc.property(
        validDomain(),
        fc.constantFrom("www", "api", "cdn", "app", "staging"),
        (d, sub) => {
          expect(hostMatchesDomain(`${sub}.${d}`, d)).toBe(true);
        },
      ),
    );
  });

  it("does NOT match the domain from a shorter (parent) domain — prevents suffix attacks", () => {
    // A malicious host "evilsite.com" must not match against domain "site.com".
    fc.assert(
      fc.property(
        fc.constantFrom("example.com", "ogstack.dev"),
        fc.constantFrom("evil", "attack", "spoof"),
        (d, prefix) => {
          const host = `${prefix}${d}`;
          expect(hostMatchesDomain(host, d)).toBe(false);
        },
      ),
    );
  });

  it("is case-insensitive", () => {
    fc.assert(
      fc.property(validDomain(), (d) => {
        expect(hostMatchesDomain(d.toUpperCase(), d)).toBe(true);
        expect(hostMatchesDomain(d, d.toUpperCase())).toBe(true);
      }),
    );
  });
});

describe("isValidHttpUrl — properties", () => {
  it("rejects any input with embedded whitespace", () => {
    fc.assert(
      fc.property(fc.constantFrom(" ", "\t", "\n"), (ws) => {
        expect(isValidHttpUrl(`https://example${ws}.com`)).toBe(false);
      }),
    );
  });

  it("rejects empty and whitespace-only input", () => {
    fc.assert(
      fc.property(fc.string({ unit: fc.constantFrom(" ", "\t", "\n") }), (s) => {
        expect(isValidHttpUrl(s)).toBe(false);
      }),
    );
  });

  it("rejects non-http(s) schemes", () => {
    fc.assert(
      fc.property(fc.constantFrom("ftp", "file", "data", "javascript", "gopher"), (scheme) => {
        expect(isValidHttpUrl(`${scheme}://example.com`)).toBe(false);
      }),
    );
  });
});

describe("parseDomainList — properties", () => {
  it("output contains no duplicates", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom("a.com", "b.com", "c.com"), { minLength: 1 }), (arr) => {
        const input = arr.join(",");
        const out = parseDomainList(input);
        expect(new Set(out).size).toBe(out.length);
      }),
    );
  });

  it("every output entry is trimmed and lowercased", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("Example.Com", "OGSTACK.DEV", "docs.ogstack.DEV"), {
          minLength: 1,
          maxLength: 5,
        }),
        (arr) => {
          // Pad each with whitespace to test trimming too.
          const input = arr.map((d) => `  ${d}\t`).join(",");
          const out = parseDomainList(input);
          for (const entry of out) {
            expect(entry).toBe(entry.toLowerCase().trim());
          }
        },
      ),
    );
  });

  it("produces only non-empty entries regardless of separator noise", () => {
    fc.assert(
      fc.property(fc.constantFrom("a.com,,b.com", "a.com,\n,b.com", ",a.com,,,b.com,"), (s) => {
        const out = parseDomainList(s);
        expect(out.every((e) => e.length > 0)).toBe(true);
      }),
    );
  });
});
