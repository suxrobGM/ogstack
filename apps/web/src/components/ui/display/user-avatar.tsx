"use client";

import type { ReactElement } from "react";
import { Avatar, type AvatarProps } from "@mui/material";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: number;
  sx?: AvatarProps["sx"];
}

export function UserAvatar(props: UserAvatarProps): ReactElement {
  const { name, email, avatarUrl, size = 32, sx } = props;

  const initials = getInitials(name, email);

  return (
    <Avatar
      src={avatarUrl ?? undefined}
      sx={[
        {
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 600,
          bgcolor: "accent.violet",
          color: "#052e16",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials}
    </Avatar>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}
