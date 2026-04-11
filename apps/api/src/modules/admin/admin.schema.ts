import { Plan } from "@ogstack/shared";
import { t, type Static } from "elysia";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

// ── Shared enums ──

const PlanEnum = t.Union([
  t.Literal(Plan.FREE),
  t.Literal(Plan.PRO),
  t.Literal(Plan.BUSINESS),
  t.Literal(Plan.ENTERPRISE),
]);

const UserStatusEnum = t.Union([t.Literal("active"), t.Literal("suspended")]);

// ── User list ──

export const AdminUserSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  role: t.String(),
  plan: t.String(),
  emailVerified: t.Boolean(),
  suspended: t.Boolean(),
  createdAt: t.Date(),
});

export const AdminUserListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  t.Object({
    search: t.Optional(t.String({ description: "Search by email or name" })),
    plan: t.Optional(PlanEnum),
    status: t.Optional(UserStatusEnum),
  }),
]);

export const AdminUserListResponseSchema = PaginatedResponseSchema(AdminUserSchema);

// ── User detail ──

export const AdminUserProjectSchema = t.Object({
  id: t.String(),
  name: t.String(),
  publicId: t.String(),
  isActive: t.Boolean(),
  createdAt: t.Date(),
});

export const AdminUserApiKeySchema = t.Object({
  id: t.String(),
  prefix: t.String(),
  name: t.String(),
  projectId: t.String(),
  lastUsedAt: t.Nullable(t.Date()),
  revokedAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
});

export const AdminUserUsageSchema = t.Object({
  period: t.String(),
  imageCount: t.Number(),
  aiImageCount: t.Number(),
  cacheHits: t.Number(),
});

export const AdminUserDetailSchema = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  role: t.String(),
  plan: t.String(),
  avatarUrl: t.Nullable(t.String()),
  emailVerified: t.Boolean(),
  suspended: t.Boolean(),
  deletedAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  projects: t.Array(AdminUserProjectSchema),
  apiKeys: t.Array(AdminUserApiKeySchema),
  usage: t.Array(AdminUserUsageSchema),
});

// ── Plan change ──

export const UpdateUserPlanBodySchema = t.Object({
  plan: PlanEnum,
});

export const AdminUserPlanResponseSchema = t.Object({
  id: t.String(),
  plan: t.String(),
  updatedAt: t.Date(),
});

// ── Suspend / unsuspend ──

export const SuspendUserBodySchema = t.Object({
  suspend: t.Boolean({ description: "true to suspend, false to unsuspend" }),
});

export const AdminUserSuspendResponseSchema = t.Object({
  id: t.String(),
  suspended: t.Boolean(),
  updatedAt: t.Date(),
});

// ── Type aliases ──

export type AdminUser = Static<typeof AdminUserSchema>;
export type AdminUserListQuery = Static<typeof AdminUserListQuerySchema>;
export type AdminUserDetail = Static<typeof AdminUserDetailSchema>;
export type UpdateUserPlanBody = Static<typeof UpdateUserPlanBodySchema>;
export type SuspendUserBody = Static<typeof SuspendUserBodySchema>;
export type AdminUserPlanResponse = Static<typeof AdminUserPlanResponseSchema>;
export type AdminUserSuspendResponse = Static<typeof AdminUserSuspendResponseSchema>;
