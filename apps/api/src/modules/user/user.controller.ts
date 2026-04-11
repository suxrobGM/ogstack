import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { MessageResponseSchema } from "@/types/response";
import {
  ChangeEmailBodySchema,
  ChangePasswordBodySchema,
  UnlinkProviderParamsSchema,
  UpdateProfileBodySchema,
  UserProfileSchema,
} from "./user.schema";
import { UserService } from "./user.service";

const userService = container.resolve(UserService);

export const userController = new Elysia({ prefix: "/users", tags: ["Users"] })
  .use(authGuard)
  .get("/me", ({ user }) => userService.getProfile(user.id), {
    response: UserProfileSchema,
    detail: {
      summary: "Get current user profile",
      description:
        "Returns the authenticated user's profile including email, name, role, and avatar.",
    },
  })
  .patch("/me", ({ user, body }) => userService.updateProfile(user.id, body), {
    body: UpdateProfileBodySchema,
    response: UserProfileSchema,
    detail: {
      summary: "Update current user profile",
      description:
        "Update the authenticated user's name or avatar URL. Only provided fields are updated.",
    },
  })
  .post("/me/password", ({ user, body }) => userService.changePassword(user.id, body), {
    body: ChangePasswordBodySchema,
    response: MessageResponseSchema,
    detail: {
      summary: "Change password",
      description: "Change the authenticated user's password. Requires the current password.",
    },
  })
  .patch("/me/email", ({ user, body }) => userService.changeEmail(user.id, body), {
    body: ChangeEmailBodySchema,
    response: UserProfileSchema,
    detail: {
      summary: "Change email address",
      description:
        "Change the authenticated user's email. Requires password confirmation. Resets email verification.",
    },
  })
  .delete(
    "/me/connections/:provider",
    ({ user, params }) => userService.unlinkProvider(user.id, params.provider),
    {
      params: UnlinkProviderParamsSchema,
      response: UserProfileSchema,
      detail: {
        summary: "Unlink OAuth provider",
        description:
          "Disconnect a linked GitHub or Google account. Cannot unlink the only authentication method.",
      },
    },
  )
  .delete("/me", ({ user }) => userService.deleteAccount(user.id), {
    response: MessageResponseSchema,
    detail: {
      summary: "Delete account",
      description: "Permanently delete the authenticated user's account and all associated data.",
    },
  });
