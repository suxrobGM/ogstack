import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { UpdateProfileBodySchema, UserProfileSchema } from "./user.schema";
import { UserService } from "./user.service";

const userService = container.resolve(UserService);

export const userController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get(
    "/me",
    async ({ user }) => {
      return userService.getProfile(user.id);
    },
    {
      response: { 200: UserProfileSchema },
      detail: { tags: ["Users"], summary: "Get current user profile" },
    },
  )
  .patch(
    "/me",
    async ({ user, body }) => {
      return userService.updateProfile(user.id, body);
    },
    {
      body: UpdateProfileBodySchema,
      response: { 200: UserProfileSchema },
      detail: { tags: ["Users"], summary: "Update current user profile" },
    },
  );
