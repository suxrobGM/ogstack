import { Elysia } from "elysia";
import { ForbiddenError } from "@/common/errors";
import { UserRole } from "@/generated/prisma";
import { authGuard } from "./auth.middleware";

/**
 * Role-based access control middleware.
 *
 * @example
 * someRoutes.use(requireRole(UserRole.ADMIN)).get(...)
 */
export const requireRole = (...roles: UserRole[]) =>
  new Elysia({ name: `role-${roles.join("-")}` })
    .use(authGuard)
    .onBeforeHandle({ as: "scoped" }, ({ user }) => {
      const role = user?.role as UserRole;

      if (!roles.includes(role)) {
        throw new ForbiddenError("Insufficient permissions");
      }
    });
