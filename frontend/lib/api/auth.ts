// Authentication API utilities
import { API_BASE_URL } from "./client";
import { ApiResponse } from "./types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  groups: string[];
}

export interface AuthUserProfile {
  department: string | null;
  position: string;
  phone: string;
  bio?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  profile: AuthUserProfile | null;
}

export interface CurrentUserResponse {
  authenticated: boolean;
  user?: AuthUser;
  profile?: AuthUserProfile | null;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  /**
   * Login with username and password
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
};
