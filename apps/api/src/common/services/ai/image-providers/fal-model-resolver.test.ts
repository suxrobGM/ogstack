import { describe, expect, it } from "bun:test";
import { Plan } from "@/generated/prisma";
import { FAL_MODELS } from "./fal-ai.provider";
import { resolveFalModelForPlan } from "./fal-model-resolver";

describe("resolveFalModelForPlan", () => {
  it("returns flux2 for FREE", () => {
    expect(resolveFalModelForPlan(Plan.FREE)).toBe(FAL_MODELS.flux2);
  });

  it("returns flux2 for PLUS", () => {
    expect(resolveFalModelForPlan(Plan.PLUS)).toBe(FAL_MODELS.flux2);
  });

  it("returns flux2Pro for PRO", () => {
    expect(resolveFalModelForPlan(Plan.PRO)).toBe(FAL_MODELS.flux2Pro);
  });
});
