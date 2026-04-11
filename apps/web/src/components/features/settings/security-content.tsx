"use client";

import { type ReactElement } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { useAuth } from "@/hooks";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-query";
import { useConfirm } from "@/hooks/use-confirm";
import { client } from "@/lib/api";
import type { UserProfile } from "@/types/api";
import { ChangePasswordForm } from "./change-password-form";
import { ConnectedAccounts } from "./connected-accounts";

interface SecurityContentProps {
  initialUser: UserProfile;
}

export function SecurityContent(props: SecurityContentProps): ReactElement {
  const { initialUser } = props;
  const { logout } = useAuth();
  const confirm = useConfirm();

  const { data: user } = useApiQuery<UserProfile>(
    ["users", "me"],
    () => client.api.users.me.get(),
    { initialData: initialUser },
  );

  const profile = user ?? initialUser;

  const deleteMutation = useApiMutation<{ message: string }, void>(
    () => client.api.users.me.delete(),
    {
      onSuccess: async () => {
        await logout();
      },
      errorMessage: "Failed to delete account.",
    },
  );

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete account",
      description:
        "This action is permanent and cannot be undone. All your projects, API keys, generated images, and data will be permanently deleted.",
      confirmLabel: "Delete my account",
      destructive: true,
      confirmationText: "delete my account",
      confirmationHint: (
        <Typography variant="body2Muted">
          Type <strong>delete my account</strong> to confirm.
        </Typography>
      ),
    });

    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  return (
    <Stack spacing={4}>
      <Surface>
        <SectionHeader title="Password" />
        <Stack sx={{ mt: 3 }}>
          {profile.hasPassword ? (
            <ChangePasswordForm />
          ) : (
            <Alert severity="info" variant="outlined">
              Your account uses OAuth sign-in. To add a password, use the forgot password flow from
              the login page.
            </Alert>
          )}
        </Stack>
      </Surface>

      <Surface>
        <SectionHeader title="Connected accounts" />
        <Stack sx={{ mt: 3 }}>
          <ConnectedAccounts user={profile} />
        </Stack>
      </Surface>

      <Surface sx={{ borderColor: "error.main", borderWidth: 1 }}>
        <SectionHeader title="Danger zone" />
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Alert severity="error" variant="outlined">
            Deleting your account is permanent. All your data, projects, API keys, and generated
            images will be permanently removed and cannot be recovered.
          </Alert>
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete account"}
            </Button>
          </Box>
        </Stack>
      </Surface>
    </Stack>
  );
}
