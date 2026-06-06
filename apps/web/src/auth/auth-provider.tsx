"use client";

import { createContext, useState, type PropsWithChildren, type ReactElement } from "react";
import { client } from "@/api/client";
import type { AuthUser } from "@/api/types";
import { ROUTES } from "@/lib/constants";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps extends PropsWithChildren {
  user: AuthUser | null;
}

export function AuthProvider(props: AuthProviderProps): ReactElement {
  const { children } = props;
  const [user, setUser] = useState<AuthUser | null>(props.user);
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      await client.api.auth.logout.post();
    } finally {
      setUser(null);
      setIsLoading(false);

      // Redirect to login page after logout to clear any protected routes and reset state.
      window.location.assign(ROUTES.login);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
