import { fetchApi } from "./client";
import { Announcement, PaginatedResponse } from "./types";

export const announcementApi = {
  list: async (params?: {
    search?: string;
    priority?: string;
    is_active?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Announcement>>(
      `/api/announcements/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<PaginatedResponse<Announcement>>(
      "/api/announcements/active/"
    );
  },
  get: async (id: number) => {
    return fetchApi<Announcement>(`/api/announcements/${id}/`);
  },
  create: async (data: Partial<Announcement>) => {
    return fetchApi<Announcement>("/api/announcements/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Announcement>) => {
    return fetchApi<Announcement>(`/api/announcements/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/announcements/${id}/`, {
      method: "DELETE",
    });
  },
};
