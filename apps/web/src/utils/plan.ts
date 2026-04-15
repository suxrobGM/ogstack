import { Plan } from "@ogstack/shared";
import type { AuthUser } from "@/types/api";

export type PlanChipColor = "default" | "primary" | "secondary" | "warning";

export function planChipColor(plan: AuthUser["plan"]): PlanChipColor {
  switch (plan) {
    case Plan.PRO:
      return "primary";
    case Plan.PLUS:
      return "secondary";
    default:
      return "default";
  }
}
