import type { AuthUser } from "@/types/api";

export type PlanChipColor = "default" | "primary" | "secondary" | "warning";

export function planChipColor(plan: AuthUser["plan"]): PlanChipColor {
  switch (plan) {
    case "PRO":
      return "primary";
    case "BUSINESS":
      return "secondary";
    case "ENTERPRISE":
      return "warning";
    default:
      return "default";
  }
}
