import { Plan } from "@ogstack/shared";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { GitHubOAuthService } from "./github-oauth.service";

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
    email: "github@example.com",
    firstName: "GitHub",
    lastName: "User",
    role: "USER",
    plan: Plan.FREE,
    avatarUrl: "https://avatars.githubusercontent.com/u/123",
    emailVerified: true,
    githubId: "12345",
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

describe("GitHubOAuthService", () => {
  let service: GitHubOAuthService;

  beforeEach(() => {
    container.clearInstances();
    const mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(GitHubOAuthService);
  });

  describe("getAuthUrl", () => {
    it("should return a GitHub authorization URL", () => {
      const url = service.getAuthUrl("random-state");

      expect(url).toContain("https://github.com/login/oauth/authorize");
      expect(url).toContain("state=random-state");
      expect(url).toContain("scope=user%3Aemail");
    });

    it("should include redirect_uri", () => {
      const url = service.getAuthUrl("state");
      expect(url).toContain("redirect_uri=");
      expect(url).toContain("github%2Fcallback");
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

    it("should throw when no verified primary email", () => {
      const originalFetch = globalThis.fetch;
      let callCount = 0;
      globalThis.fetch = mock(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(new Response(JSON.stringify({ access_token: "tok" })));
        }
        if (callCount === 2) {
          return Promise.resolve(new Response(JSON.stringify({ id: 123, login: "user" })));
        }
        return Promise.resolve(
          new Response(JSON.stringify([{ email: "a@b.c", primary: false, verified: true }])),
        );
      }) as unknown as typeof fetch;

      expect(service.callback("code")).rejects.toThrow("No verified primary email");

      globalThis.fetch = originalFetch;
    });
  });
});
