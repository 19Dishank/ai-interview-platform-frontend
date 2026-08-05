"use client";

import Loading from "@/app/loading";
import { fetchMe } from "@/services/auth/auth.services";
import { User } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await fetchMe();
      setUser(res?.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, []);

  if (loading || !user) return <Loading blurry />;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
