export const Plan = {
  FREE: "FREE",
  PLUS: "PLUS",
  PRO: "PRO",
} as const;

export const UNLIMITED = -1;

export type Plan = (typeof Plan)[keyof typeof Plan];

export const PLANS = [Plan.FREE, Plan.PLUS, Plan.PRO] as const;

export interface RateLimitConfig {
  perMinute: number;
}

export interface PlanConfig {
  name: string;
  price: number;
  sortOrder: number;
  templates: number | "all";
  aiEnabled: boolean;
  watermark: boolean;
  aiImageLimit: number;
  aiImageProLimit: number;
  aiAuditLimit: number;
  projectLimit: number;
  domainsPerProject: number;
  prioritySupport: boolean;
  rateLimit: RateLimitConfig;
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    name: "Free",
    price: 0,
    sortOrder: 0,
    templates: "all",
    aiEnabled: true,
    watermark: true,
    aiImageLimit: 3,
    aiImageProLimit: 0,
    aiAuditLimit: 0,
    projectLimit: 1,
    domainsPerProject: 1,
    prioritySupport: false,
    rateLimit: { perMinute: 20 },
  },
  [Plan.PLUS]: {
    name: "Plus",
    price: 10,
    sortOrder: 1,
    templates: "all",
    aiEnabled: true,
    watermark: true,
    aiImageLimit: 100,
    aiImageProLimit: 0,
    aiAuditLimit: 100,
    projectLimit: 5,
    domainsPerProject: 3,
    prioritySupport: false,
    rateLimit: { perMinute: 100 },
  },
  [Plan.PRO]: {
    name: "Pro",
    price: 30,
    sortOrder: 2,
    templates: "all",
    aiEnabled: true,
    watermark: false,
    aiImageLimit: 1000,
    aiImageProLimit: 300,
    aiAuditLimit: 1000,
    projectLimit: UNLIMITED,
    domainsPerProject: UNLIMITED,
    prioritySupport: true,
    rateLimit: { perMinute: 500 },
  },
};

export function planSortOrder(plan: Plan): number {
  return PLAN_CONFIGS[plan].sortOrder;
}

export function isPlanAtLeast(current: Plan, required: Plan): boolean {
  return planSortOrder(current) >= planSortOrder(required);
}
