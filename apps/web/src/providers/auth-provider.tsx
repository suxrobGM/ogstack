"use client";

import { createContext, use, useState, type PropsWithChildren, type ReactElement } from "react";
import { client } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import type { AuthUser } from "@/types/api";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps extends PropsWithChildren {
  initialUser: AuthUser | null;
}

export function AuthProvider(props: AuthProviderProps): ReactElement {
  const { initialUser, children } = props;
  const [user, setUser] = useState<AuthUser | null>(initialUser);
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

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
