"use client";

import type { ReactElement } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import type { UserProfile } from "@/types/api";

interface ConnectedAccountsProps {
  user: UserProfile;
}

export function ConnectedAccounts(props: ConnectedAccountsProps): ReactElement {
  const { user } = props;

  const unlinkMutation = useApiMutation<UserProfile, string>(
    (provider) =>
      client.api.users.me.connections({ provider }).delete() as Promise<{
        data: UserProfile | null;
        error: unknown;
      }>,
    {
      successMessage: "Account disconnected.",
      errorMessage: "Failed to disconnect account.",
      invalidateKeys: [["users", "me"]],
    },
  );

  const canUnlinkGithub = user.githubConnected && (user.hasPassword || user.googleConnected);
  const canUnlinkGoogle = user.googleConnected && (user.hasPassword || user.githubConnected);

  const handleLink = (provider: "github" | "google") => {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}?redirect=/settings/security`;
  };

  return (
    <Stack spacing={2}>
      <AccountRow
        icon={<GitHubIcon fontSize="small" />}
        label="GitHub"
        connected={user.githubConnected}
        onLink={() => handleLink("github")}
        onUnlink={() => unlinkMutation.mutate("github")}
        canUnlink={canUnlinkGithub}
        isLoading={unlinkMutation.isPending}
      />
      <AccountRow
        icon={<GoogleIcon fontSize="small" />}
        label="Google"
        connected={user.googleConnected}
        onLink={() => handleLink("google")}
        onUnlink={() => unlinkMutation.mutate("google")}
        canUnlink={canUnlinkGoogle}
        isLoading={unlinkMutation.isPending}
      />
    </Stack>
  );
}

interface AccountRowProps {
  icon: ReactElement;
  label: string;
  connected: boolean;
  onLink: () => void;
  onUnlink: () => void;
  canUnlink: boolean;
  isLoading: boolean;
}

function AccountRow(props: AccountRowProps): ReactElement {
  const { icon, label, connected, onLink, onUnlink, canUnlink, isLoading } = props;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {icon}
        <Typography variant="body2">{label}</Typography>
        <Chip
          label={connected ? "Connected" : "Not connected"}
          color={connected ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Box>
        {connected ? (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<LinkOffIcon />}
            onClick={onUnlink}
            disabled={!canUnlink || isLoading}
          >
            Unlink
          </Button>
        ) : (
          <Button variant="outlined" size="small" startIcon={<LinkIcon />} onClick={onLink}>
            Link
          </Button>
        )}
      </Box>
    </Stack>
  );
}
