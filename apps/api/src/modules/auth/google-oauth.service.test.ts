import { Plan } from "@ogstack/shared";
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { restoreMockedModules } from "@/test/setup";
import { GoogleOAuthService } from "./google-oauth.service";

afterAll(() => restoreMockedModules("jose"));

mock.module("jose", () => ({
  SignJWT: class MockSignJWT {
    setProtectedHeader() {
      return this;
    }
    setSubject() {
      return this;
    }
    setExpirationTime() {
      return this;
    }
    async sign() {
      return "mock_token";
    }
  },
  jwtVerify: mock(() => Promise.resolve({ payload: {} })),
}));

function createMockUser(overrides = {}) {
  return {
    id: "user-uuid-1",
    email: "google@example.com",
    firstName: "Google",
    lastName: "User",
    role: "USER",
    plan: Plan.FREE,
    avatarUrl: "https://lh3.googleusercontent.com/photo",
    emailVerified: true,
    googleId: "google-456",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve(createMockUser())),
      update: mock(() => Promise.resolve(createMockUser())),
    },
    project: {
      create: mock(() => Promise.resolve({ id: "proj-1" })),
    },
    $transaction: mock((fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        user: { create: mock(() => Promise.resolve(createMockUser())) },
        project: { create: mock(() => Promise.resolve({ id: "proj-1" })) },
      };
      return fn(tx);
    }),
  } as unknown as PrismaClient;
}

describe("GoogleOAuthService", () => {
  let service: GoogleOAuthService;

  beforeEach(() => {
    container.clearInstances();
    const mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(GoogleOAuthService);
  });

  describe("getAuthUrl", () => {
    it("should return a Google authorization URL", () => {
      const url = service.getAuthUrl("random-state");

      expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(url).toContain("state=random-state");
      expect(url).toContain("scope=openid");
    });

    it("should include offline access type", () => {
      const url = service.getAuthUrl("state");
      expect(url).toContain("access_type=offline");
    });

    it("should include redirect_uri", () => {
      const url = service.getAuthUrl("state");
      expect(url).toContain("redirect_uri=");
      expect(url).toContain("google%2Fcallback");
    });
  });

  describe("callback", () => {
    it("should throw when access token exchange fails", () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify({ error: "bad_code" }), { status: 200 })),
      ) as unknown as typeof fetch;

      expect(service.callback("invalid-code")).rejects.toThrow("could not obtain access token");

      globalThis.fetch = originalFetch;
    });

    it("should throw when email is not verified", () => {
      const originalFetch = globalThis.fetch;
      let callCount = 0;
      globalThis.fetch = mock(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(new Response(JSON.stringify({ access_token: "tok" })));
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({ id: "123", email: "a@b.c", verified_email: false, name: "User" }),
          ),
        );
      }) as unknown as typeof fetch;

      expect(service.callback("code")).rejects.toThrow("No verified email");

      globalThis.fetch = originalFetch;
    });
  });
});
