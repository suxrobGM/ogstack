import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { requireRole } from "@/common/middleware/role.middleware";
import { UserRole } from "@/generated/prisma";
import { StringIdParamSchema } from "@/types/request";
import {
  AdminUserDetailSchema,
  AdminUserListQuerySchema,
  AdminUserListResponseSchema,
  AdminUserPlanResponseSchema,
  AdminUserSuspendResponseSchema,
  SuspendUserBodySchema,
  UpdateUserPlanBodySchema,
} from "./admin.schema";
import { AdminService } from "./admin.service";

const adminService = container.resolve(AdminService);

export const adminController = new Elysia({ prefix: "/admin", tags: ["Admin"] })
  .use(authGuard)
  .use(requireRole(UserRole.ADMIN))
  .get("/users", ({ query }) => adminService.listUsers(query), {
    query: AdminUserListQuerySchema,
    response: AdminUserListResponseSchema,
    detail: {
      summary: "List users",
      description: "Paginated user list with search by email/name and filter by plan/status.",
    },
  })
  .get("/users/:id", ({ params }) => adminService.getUserDetail(params.id), {
    params: StringIdParamSchema,
    response: AdminUserDetailSchema,
    detail: {
      summary: "Get user detail",
      description: "User detail with usage stats, projects, and API keys.",
    },
  })
  .patch(
    "/users/:id/plan",
    ({ params, body, user }) =>
      adminService.updateUserPlan(params.id, body, user.id, user.role as UserRole),
    {
      params: StringIdParamSchema,
      body: UpdateUserPlanBodySchema,
      response: AdminUserPlanResponseSchema,
      detail: {
        summary: "Change user plan",
        description: "Change a user's subscription plan. Logged to audit trail.",
      },
    },
  )
  .post(
    "/users/:id/suspend",
    ({ params, body, user }) =>
      adminService.suspendUser(params.id, body, user.id, user.role as UserRole),
    {
      params: StringIdParamSchema,
      body: SuspendUserBodySchema,
      response: AdminUserSuspendResponseSchema,
      detail: {
        summary: "Suspend or unsuspend user",
        description: "Suspend or unsuspend a user account. Logged to audit trail.",
      },
    },
  );
