import { describe, expect, it } from "bun:test";
import {
  clearAuthCookies,
  clearOAuthStateCookie,
  getOAuthStateCookie,
  parseExpiry,
  setAuthCookies,
  setOAuthStateCookie,
} from "./cookie";

function createMockCookieJar() {
  const jar: Record<string, { value: unknown; options: Record<string, unknown> }> = {};

  return new Proxy(
    {},
    {
      get(_target, name: string) {
        if (!jar[name]) {
          jar[name] = { value: undefined, options: {} };
        }
        return {
          get value() {
            return jar[name]!.value;
          },
          set value(v: unknown) {
            jar[name]!.value = v;
          },
          set(opts: Record<string, unknown>) {
            jar[name]!.options = opts;
          },
          get options() {
            return jar[name]!.options;
          },
        };
      },
    },
  ) as Record<string, { value: unknown; set: (opts: Record<string, unknown>) => void }>;
}

describe("parseExpiry", () => {
  it("should parse seconds", () => {
    expect(parseExpiry("30s", 0)).toBe(30);
  });

  it("should parse minutes", () => {
    expect(parseExpiry("15m", 0)).toBe(900);
  });

  it("should parse hours", () => {
    expect(parseExpiry("2h", 0)).toBe(7200);
  });

  it("should parse days", () => {
    expect(parseExpiry("1d", 0)).toBe(86400);
  });

  it("should parse weeks", () => {
    expect(parseExpiry("1w", 0)).toBe(604800);
  });

  it("should default to seconds when no unit", () => {
    expect(parseExpiry("60", 0)).toBe(60);
  });

  it("should return fallback for undefined", () => {
    expect(parseExpiry(undefined, 42)).toBe(42);
  });

  it("should return fallback for invalid string", () => {
    expect(parseExpiry("abc", 99)).toBe(99);
  });
});

describe("setAuthCookies", () => {
  it("should set access_token and refresh_token cookies", () => {
    const cookie = createMockCookieJar();
    const result = {
      user: { id: "1", email: "a@b.c", firstName: "A", lastName: "B", role: "USER" },
      accessToken: "at",
      refreshToken: "rt",
    };

    setAuthCookies(cookie as any, result);

    expect(cookie.access_token!.value).toBe("at");
    expect(cookie.refresh_token!.value).toBe("rt");
  });
});

describe("clearAuthCookies", () => {
  it("should clear access_token and refresh_token cookies", () => {
    const cookie = createMockCookieJar();
    cookie.access_token!.value = "old";
    cookie.refresh_token!.value = "old";

    clearAuthCookies(cookie as any);

    expect(cookie.access_token!.value).toBe("");
    expect(cookie.refresh_token!.value).toBe("");
  });
});

describe("setOAuthStateCookie", () => {
  it("should set oauth_state cookie", () => {
    const cookie = createMockCookieJar();
    setOAuthStateCookie(cookie as any, "random-state");
    expect(cookie.oauth_state!.value).toBe("random-state");
  });
});

describe("clearOAuthStateCookie", () => {
  it("should clear oauth_state cookie", () => {
    const cookie = createMockCookieJar();
    cookie.oauth_state!.value = "old-state";
    clearOAuthStateCookie(cookie as any);
    expect(cookie.oauth_state!.value).toBe("");
  });
});

describe("getOAuthStateCookie", () => {
  it("should return the stored state", () => {
    const cookie = createMockCookieJar();
    cookie.oauth_state!.value = "my-state";
    expect(getOAuthStateCookie(cookie as any)).toBe("my-state");
  });

  it("should return undefined when no state set", () => {
    const cookie = createMockCookieJar();
    expect(getOAuthStateCookie(cookie as any)).toBeUndefined();
  });
});
