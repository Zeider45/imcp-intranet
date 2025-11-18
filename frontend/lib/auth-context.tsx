"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, AuthUser, AuthUserProfile } from "@/lib/api/auth";

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthWithToken = React.useCallback(async (authToken: string) => {
    setIsLoading(true);
    const response = await authApi.getCurrentUser(authToken);
    
    if (response.data && response.data.authenticated && response.data.user) {
      setUser(response.data.user);
      setProfile(response.data.profile || null);
    } else {
      // Token is invalid, clear it
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
      setProfile(null);
    }
    setIsLoading(false);
  }, []);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      checkAuthWithToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [checkAuthWithToken]);

  const checkAuth = async () => {
    if (token) {
      await checkAuthWithToken(token);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    
    if (response.data) {
      const { user: userData, profile: profileData, token: authToken } = response.data;
      setUser(userData);
      setProfile(profileData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      return { success: true };
    } else {
      return { success: false, error: response.error || "Login failed" };
    }
  };

  const logout = async () => {
    if (token) {
      await authApi.logout(token);
    }
    
    localStorage.removeItem("auth_token");
    setUser(null);
    setProfile(null);
    setToken(null);
    router.push("/login");
  };

  const value = {
    user,
    profile,
    token,
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
