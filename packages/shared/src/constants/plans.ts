export const Plan = {
  FREE: "FREE",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
  ENTERPRISE: "ENTERPRISE",
} as const;

const UNLIMITED_QUOTA = -1;

export type Plan = (typeof Plan)[keyof typeof Plan];

export const PLANS = [Plan.FREE, Plan.PRO, Plan.BUSINESS, Plan.ENTERPRISE] as const;

export interface PlanConfig {
  name: string;
  price: number;
  quota: number;
  templates: number | "all";
  aiEnabled: boolean;
  watermark: boolean;
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    name: "Free",
    price: 0,
    quota: 50,
    templates: 5,
    aiEnabled: false,
    watermark: true,
  },
  [Plan.PRO]: {
    name: "Pro",
    price: 12,
    quota: 500,
    templates: "all",
    aiEnabled: true,
    watermark: false,
  },
  [Plan.BUSINESS]: {
    name: "Business",
    price: 29,
    quota: 5000,
    templates: "all",
    aiEnabled: true,
    watermark: false,
  },
  [Plan.ENTERPRISE]: {
    name: "Enterprise",
    price: 79,
    quota: UNLIMITED_QUOTA,
    templates: "all",
    aiEnabled: true,
    watermark: false,
  },
};
