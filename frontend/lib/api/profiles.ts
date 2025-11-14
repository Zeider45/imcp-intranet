import { fetchApi } from "./client";
import { UserProfile, PaginatedResponse } from "./types";

export const profileApi = {
  list: async (params?: {
    search?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<UserProfile>>(
      `/api/profiles/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<UserProfile>(`/api/profiles/${id}/`);
  },
  me: async () => {
    return fetchApi<UserProfile>("/api/profiles/me/");
  },
  update: async (id: number, data: Partial<UserProfile>) => {
    return fetchApi<UserProfile>(`/api/profiles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
