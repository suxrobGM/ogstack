import type { ReactElement } from "react";
import { Chip, Stack, Typography } from "@mui/material";
import { UserAvatar } from "@/components/ui/display/user-avatar";
import { Surface } from "@/components/ui/layout/surface";
import type { AdminUserDetail } from "@/types/api";

interface AdminUserProfileProps {
  user: AdminUserDetail;
}

export function AdminUserProfile(props: AdminUserProfileProps): ReactElement {
  const { user } = props;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <Surface padding={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
        <UserAvatar name={fullName} email={user.email} avatarUrl={user.avatarUrl} size={56} />
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography variant="h5">{fullName || "-"}</Typography>
          <Typography variant="body2Muted">{user.email}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip size="small" label={user.role} variant="outlined" />
            <Chip size="small" label={user.plan} variant="outlined" />
            {user.emailVerified ? (
              <Chip size="small" label="verified" color="success" variant="outlined" />
            ) : (
              <Chip size="small" label="unverified" variant="outlined" />
            )}
            {user.suspended && (
              <Chip size="small" label="suspended" color="error" variant="outlined" />
            )}
          </Stack>
        </Stack>
        <Stack spacing={0.25} sx={{ alignItems: "flex-end" }}>
          <Typography variant="overlineMuted">Joined</Typography>
          <Typography variant="body2">{new Date(user.createdAt).toLocaleDateString()}</Typography>
        </Stack>
      </Stack>
    </Surface>
  );
}
