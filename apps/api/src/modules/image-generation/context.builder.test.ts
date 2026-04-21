import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { FAL_MODELS } from "@/common/services/ai/image-providers/fal-ai.provider";
import { Plan, PrismaClient } from "@/generated/prisma";
import { RenderContextBuilder } from "./context.builder";
import { ImageRecordService } from "./record.service";

function createMockPrisma(plan: Plan = Plan.FREE) {
  return {
    user: { findUnique: mock(() => Promise.resolve({ plan })) },
  } as unknown as PrismaClient;
}

function createMockRecords() {
  return {
    buildKey: mock(() => Promise.resolve("cache-key-123")),
  } as unknown as ImageRecordService;
}

describe("RenderContextBuilder", () => {
  let builder: RenderContextBuilder;
  let prisma: ReturnType<typeof createMockPrisma>;
  let records: ReturnType<typeof createMockRecords>;

  beforeEach(() => {
    container.clearInstances();
    prisma = createMockPrisma();
    records = createMockRecords();
    container.registerInstance(PrismaClient, prisma);
    container.registerInstance(ImageRecordService, records);
    builder = container.resolve(RenderContextBuilder);
  });

  describe("build", () => {
    it("builds non-ai context for OG kind with default template", async () => {
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "og",
        fullOverride: false,
      });

      expect(ctx.kind).toBe("og");
      expect(ctx.template).toBeDefined();
      expect(ctx.plan).toBe(Plan.FREE);
      expect(ctx.aiModel).toBeNull();
      expect(ctx.cacheKey).toBe("cache-key-123");
      expect(ctx.dimensions.width).toBe(1200);
      expect(ctx.dimensions.height).toBe(630);
    });

    it("forces ai for icon_set regardless of caller option", async () => {
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "icon_set",
        options: { aiGenerated: false },
        fullOverride: false,
      });

      expect(ctx.aiModel).not.toBeNull();
    });

    it("throws NotFoundError when user missing", () => {
      (prisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce(null);

      expect(
        builder.build({
          userId: "missing",
          projectId: "p1",
          url: "https://example.com",
          kind: "og",
          fullOverride: false,
        }),
      ).rejects.toThrow("User not found");
    });

    it("throws NotFoundError when template slug unknown", () => {
      expect(
        builder.build({
          userId: "u1",
          projectId: "p1",
          url: "https://example.com",
          kind: "og",
          template: "does-not-exist",
          fullOverride: false,
        }),
      ).rejects.toThrow('Template "does-not-exist" not found');
    });

    it("includes watermark=true for FREE plan", async () => {
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "og",
        fullOverride: false,
      });
      expect(ctx.watermark).toBe(true);
    });

    it("resolves pro model for PRO plan when user requests it", async () => {
      (prisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce({
        plan: Plan.PRO,
      });

      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "og",
        options: { aiGenerated: true, aiModel: "pro" },
        fullOverride: false,
      });

      expect(ctx.aiModel).toBe(FAL_MODELS.flux2Pro);
    });

    it("resolves standard model when user requests standard", async () => {
      (prisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce({
        plan: Plan.PRO,
      });
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "og",
        options: { aiGenerated: true, aiModel: "standard" },
        fullOverride: false,
      });

      expect(ctx.aiModel).toBe(FAL_MODELS.flux2);
    });

    it("returns blog_hero dimensions when aspect ratio provided", async () => {
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "blog_hero",
        options: { aspectRatio: "16:10" },
        fullOverride: false,
      });

      expect(ctx.dimensions.width).toBeGreaterThan(0);
      expect(ctx.dimensions.height).toBeGreaterThan(0);
    });

    it("returns default blog_hero dimensions when aspect ratio missing", async () => {
      const ctx = await builder.build({
        userId: "u1",
        projectId: "p1",
        url: "https://example.com",
        kind: "blog_hero",
        fullOverride: false,
      });
      expect(ctx.dimensions.width).toBe(1600);
      expect(ctx.dimensions.height).toBe(900);
    });
  });

  describe("resolveHeadlineOptions", () => {
    it("uses raw user prompt when fullOverride is set", () => {
      const opts = builder.resolveHeadlineOptions(null, { aiPrompt: "raw prompt" }, true);
      expect(opts.override).toBe("raw prompt");
      expect(opts.enrichedKeywords).toBeNull();
      expect(opts.overrideHeadline).toBeNull();
    });

    it("blends AI fields when fullOverride is false", () => {
      const ai = {
        imagePrompt: {
          backgroundKeywords: "neon, grid",
          headline: "AI-generated dev tools",
          tagline: "ship faster",
          mood: "bold",
          suggestedAccent: "#00ff00",
        },
        pageTheme: "technical",
        brandHints: { palette: ["#111"], industry: "saas" },
      } as never;

      const opts = builder.resolveHeadlineOptions(ai, undefined, false);
      expect(opts.override).toBeNull();
      expect(opts.enrichedKeywords).toBe("neon, grid");
      expect(opts.overrideHeadline).toBe("AI-generated dev tools");
      expect(opts.overrideTagline).toBe("ship faster");
      expect(opts.pageTheme).toBe("technical");
      expect(opts.mood).toBe("bold");
      expect(opts.accent).toBe("#00ff00");
      expect(opts.industry).toBe("saas");
    });

    it("handles null ai gracefully", () => {
      const opts = builder.resolveHeadlineOptions(null, undefined, false);
      expect(opts.enrichedKeywords).toBeNull();
      expect(opts.overrideHeadline).toBeNull();
    });
  });
});
