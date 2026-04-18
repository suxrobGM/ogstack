import { Plan } from "@/generated/prisma";
import { FAL_MODELS } from "./fal-ai.provider";

/**
 * Maps a user plan to the FAL model they're allowed to use. Free and Plus use
 * Flux 2; Pro uses Flux 2 Pro (capped separately by aiImageProLimit).
 */
export function resolveFalModelForPlan(plan: Plan): string {
  switch (plan) {
    case Plan.PRO:
      return FAL_MODELS.flux2Pro;
    case Plan.PLUS:
    case Plan.FREE:
    default:
      return FAL_MODELS.flux2;
  }
}
