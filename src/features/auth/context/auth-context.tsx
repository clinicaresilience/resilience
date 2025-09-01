"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthContextValue, AuthUser } from "../types";
import { getCurrentUser, signIn as serviceSignIn, signOut as serviceSignOut } from "../services/auth.service";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (active) setUser(u);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await serviceSignIn(email, password);
    if (res.error) {
      return { error: res.error, user: null };
    }
    const u = await getCurrentUser();
    setUser(u);
    return { user: u };
  }, []);

  const signOut = useCallback(async () => {
    await serviceSignOut();
    setUser(null);
  }, []);

  const value: AuthContextValue = { user, loading, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
