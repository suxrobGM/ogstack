import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { requireRole } from "@/common/middleware/role.middleware";
import { UserRole } from "@/generated/prisma";
import { StringIdParamSchema } from "@/types/request";
import { AdminImageService } from "./admin-image.service";
import { AdminStatsService } from "./admin-stats.service";
import { AdminUserService } from "./admin-user.service";
import {
  AdminImageDeleteResponseSchema,
  AdminImageListQuerySchema,
  AdminImageListResponseSchema,
  AdminStatsResponseSchema,
  AdminUserDetailSchema,
  AdminUserListQuerySchema,
  AdminUserListResponseSchema,
  AdminUserPlanResponseSchema,
  AdminUserSuspendResponseSchema,
  SuspendUserBodySchema,
  UpdateUserPlanBodySchema,
} from "./admin.schema";

const userService = container.resolve(AdminUserService);
const statsService = container.resolve(AdminStatsService);
const imageService = container.resolve(AdminImageService);

export const adminController = new Elysia({ prefix: "/admin", tags: ["Admin"] })
  .use(authGuard)
  .use(requireRole(UserRole.ADMIN))
  .get("/stats", () => statsService.getStats(), {
    response: AdminStatsResponseSchema,
    detail: {
      summary: "Admin dashboard stats",
      description: "Aggregate counts for the admin overview dashboard.",
    },
  })
  .get("/images", ({ query }) => imageService.listImages(query), {
    query: AdminImageListQuerySchema,
    response: AdminImageListResponseSchema,
    detail: {
      summary: "List all generated images",
      description: "Paginated image list across all users for moderation.",
    },
  })
  .delete(
    "/images/:id",
    ({ params, user }) => imageService.deleteImage(params.id, user.id, user.role as UserRole),
    {
      params: StringIdParamSchema,
      response: AdminImageDeleteResponseSchema,
      detail: {
        summary: "Delete an image (admin)",
        description: "Remove a generated image regardless of owner. Logged to audit trail.",
      },
    },
  )
  .get("/users", ({ query }) => userService.listUsers(query), {
    query: AdminUserListQuerySchema,
    response: AdminUserListResponseSchema,
    detail: {
      summary: "List users",
      description: "Paginated user list with search by email/name and filter by plan/status.",
    },
  })
  .get("/users/:id", ({ params }) => userService.getUserDetail(params.id), {
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
      userService.updateUserPlan(params.id, body, user.id, user.role as UserRole),
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
      userService.suspendUser(params.id, body, user.id, user.role as UserRole),
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
