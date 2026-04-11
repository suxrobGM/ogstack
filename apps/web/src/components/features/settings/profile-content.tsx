"use client";

import { useState, type ReactElement } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Alert, Box, Button, Chip, Collapse, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { UserAvatar } from "@/components/ui/display/user-avatar";
import { FormTextField } from "@/components/ui/form";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { useAuth } from "@/hooks";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api/client";
import type { UserProfile } from "@/types/api";
import { changeEmailSchema, profileSchema } from "./schema";

interface ProfileContentProps {
  initialUser: UserProfile;
}

export function ProfileContent(props: ProfileContentProps): ReactElement {
  const { initialUser } = props;
  const { setUser } = useAuth();
  const [user, setLocalUser] = useState(initialUser);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const updateMutation = useApiMutation<UserProfile, { firstName?: string; lastName?: string }>(
    (values) => client.api.users.me.patch(values),
    {
      successMessage: "Profile updated.",
      errorMessage: "Failed to update profile.",
      onSuccess: (data) => {
        setLocalUser(data);
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
      },
    },
  );

  const emailMutation = useApiMutation<UserProfile, { newEmail: string; password: string }>(
    (values) => client.api.users.me.email.patch(values),
    {
      successMessage: "Email updated. Please verify your new email address.",
      errorMessage: "Failed to update email.",
      onSuccess: (data) => {
        setLocalUser(data);
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
        setShowEmailForm(false);
      },
    },
  );

  const profileForm = useForm({
    defaultValues: { firstName: user.firstName, lastName: user.lastName },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  const emailForm = useForm({
    defaultValues: { newEmail: "", password: "" },
    validators: { onSubmit: changeEmailSchema },
    onSubmit: async ({ value }) => {
      emailMutation.mutate(value);
    },
  });

  return (
    <Stack spacing={4}>
      <Surface>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <UserAvatar name={fullName} email={user.email} avatarUrl={user.avatarUrl} size={64} />
            <Box>
              <Typography variant="h6">{fullName}</Typography>
              <Typography variant="body2Muted">{user.email}</Typography>
            </Box>
          </Stack>
        </Stack>
      </Surface>

      <Surface>
        <SectionHeader title="Personal information" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            profileForm.handleSubmit();
          }}
        >
          <Stack spacing={2.5} sx={{ mt: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormTextField form={profileForm} name="firstName" label="First name" />
              <FormTextField form={profileForm} name="lastName" label="Last name" />
            </Stack>
            <Box>
              <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Surface>

      <Surface>
        <SectionHeader title="Email address" />
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <TextField value={user.email} disabled fullWidth />
            <Chip
              icon={user.emailVerified ? <CheckCircleIcon /> : <ErrorIcon />}
              label={user.emailVerified ? "Verified" : "Unverified"}
              color={user.emailVerified ? "success" : "warning"}
              size="small"
              variant="outlined"
            />
          </Stack>
          {!showEmailForm && (
            <Box>
              <Button variant="outlined" size="small" onClick={() => setShowEmailForm(true)}>
                Change email
              </Button>
            </Box>
          )}
          <Collapse in={showEmailForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                emailForm.handleSubmit();
              }}
            >
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Alert severity="info" variant="outlined">
                  A verification email will be sent to your new address.
                </Alert>
                <FormTextField form={emailForm} name="newEmail" label="New email" type="email" />
                {user.hasPassword && (
                  <FormTextField
                    form={emailForm}
                    name="password"
                    label="Current password"
                    type="password"
                  />
                )}
                <Stack direction="row" spacing={1}>
                  <Button type="submit" variant="contained" disabled={emailMutation.isPending}>
                    {emailMutation.isPending ? "Updating..." : "Update email"}
                  </Button>
                  <Button variant="text" onClick={() => setShowEmailForm(false)}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Collapse>
        </Stack>
      </Surface>

      <Surface>
        <SectionHeader title="Account info" />
        <Typography variant="body2Muted" sx={{ mt: 2 }}>
          Member since{" "}
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Surface>
    </Stack>
  );
}
