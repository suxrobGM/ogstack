import { describe, expect, it } from "bun:test";
import { ImageFormat, ImageKind, Plan, type Image } from "@/generated/prisma";
import { toGenerateResponse } from "./generation.mapper";

function createMockImage(overrides: Partial<Image> = {}): Image {
  return {
    id: "img-1",
    userId: "u1",
    projectId: "p1",
    apiKeyId: null,
    templateId: null,
    category: null,
    sourceUrl: "https://example.com",
    cacheKey: "ck",
    kind: ImageKind.OG,
    imageUrl: "http://local/og.png",
    cdnUrl: null,
    title: "Example",
    description: "d",
    faviconUrl: null,
    width: 1200,
    height: 630,
    format: ImageFormat.PNG,
    fileSize: 100,
    aiModel: null,
    aiPrompt: null,
    aiEnabled: false,
    generatedOnPlan: Plan.FREE,
    generationMs: 500,
    serveCount: 0,
    assets: null,
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-01"),
    expiresAt: null,
    ...overrides,
  } as unknown as Image;
}

describe("toGenerateResponse", () => {
  it("maps cache-hit image and prefers CDN url when present", () => {
    const img = createMockImage({ cdnUrl: "https://cdn.ogstack.dev/og.png" });
    const res = toGenerateResponse(img, { fromCache: true });

    expect(res.cached).toBe(true);
    expect(res.imageUrl).toBe("https://cdn.ogstack.dev/og.png");
    expect(res.generationMs).toBeNull();
    expect(res.ai).toBeNull();
  });

  it("reports non-ai cached image without ai block", () => {
    const img = createMockImage({ aiEnabled: false });
    const res = toGenerateResponse(img, { fromCache: true });
    expect(res.ai).toBeNull();
  });

  it("reports ai metadata on ai-enabled cache hit", () => {
    const img = createMockImage({
      aiEnabled: true,
      aiModel: "fal-ai/flux-2",
      aiPrompt: "painted",
    });
    const res = toGenerateResponse(img, { fromCache: true });
    expect(res.ai).toEqual({
      enabled: true,
      model: "fal-ai/flux-2",
      prompt: "painted",
      fellBack: false,
    });
  });

  it("falls back to imageUrl when no cdnUrl on cache hit", () => {
    const img = createMockImage({ cdnUrl: null });
    const res = toGenerateResponse(img, { fromCache: true });
    expect(res.imageUrl).toBe("http://local/og.png");
  });

  it("maps fresh render outcome with ai attempt", () => {
    const img = createMockImage();
    const res = toGenerateResponse(img, {
      fromCache: false,
      outcome: {
        pngBuffer: Buffer.from(""),
        aiEnabled: true,
        aiFellBack: false,
        aiModel: "fal-ai/flux-2",
        aiPrompt: "bright",
      },
      generationMs: 800,
    });

    expect(res.cached).toBe(false);
    expect(res.generationMs).toBe(800);
    expect(res.ai).toEqual({
      enabled: true,
      model: "fal-ai/flux-2",
      prompt: "bright",
      fellBack: false,
    });
  });

  it("reports fell-back ai when enabled=false but fellBack=true", () => {
    const img = createMockImage();
    const res = toGenerateResponse(img, {
      fromCache: false,
      outcome: {
        pngBuffer: Buffer.from(""),
        aiEnabled: false,
        aiFellBack: true,
        aiModel: null,
        aiPrompt: null,
      },
      generationMs: 100,
    });
    expect(res.ai).toEqual({
      enabled: false,
      model: null,
      prompt: null,
      fellBack: true,
    });
  });

  it("reports null ai when neither ai attempted nor fell-back", () => {
    const img = createMockImage();
    const res = toGenerateResponse(img, {
      fromCache: false,
      outcome: {
        pngBuffer: Buffer.from(""),
        aiEnabled: false,
        aiFellBack: false,
        aiModel: null,
        aiPrompt: null,
      },
      generationMs: 100,
    });
    expect(res.ai).toBeNull();
  });
});
