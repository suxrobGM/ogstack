import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { UpdateProfileBodySchema, UserProfileSchema } from "./user.schema";
import { UserService } from "./user.service";

const userService = container.resolve(UserService);

export const userController = new Elysia({ prefix: "/users", tags: ["Users"] })
  .use(authGuard)
  .get(
    "/me",
    ({ user }) => userService.getProfile(user.id),

    {
      response: UserProfileSchema,
      detail: {
        summary: "Get current user profile",
        description:
          "Returns the authenticated user's profile including email, name, role, and avatar.",
      },
    },
  )
  .patch("/me", ({ user, body }) => userService.updateProfile(user.id, body), {
    body: UpdateProfileBodySchema,
    response: UserProfileSchema,
    detail: {
      summary: "Update current user profile",
      description:
        "Update the authenticated user's name or avatar URL. Only provided fields are updated.",
    },
  });
