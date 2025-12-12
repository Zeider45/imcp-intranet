"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, AuthUser, AuthUserProfile } from "@/lib/api/auth";

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication by calling server-side endpoint (cookies included)
  const checkAuth = React.useCallback(async () => {
    setIsLoading(true);
    const response = await authApi.getCurrentUser();
    if (response.data && response.data.authenticated && response.data.user) {
      setUser(response.data.user);
      setProfile(response.data.profile || null);
    } else {
      setUser(null);
      setProfile(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });

    if (response.data) {
      // Server sets HttpOnly cookie; we also receive user info in the response
      const { user: userData, profile: profileData } = response.data;
      setUser(userData);
      setProfile(profileData);
      return { success: true };
    }
    return { success: false, error: response.error || "Login failed" };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
