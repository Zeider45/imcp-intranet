import { fetchApi } from "./client";
import { ForumCategory, ForumPost, PaginatedResponse } from "./types";

export const forumCategoryApi = {
  list: async (params?: { search?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<ForumCategory>>(
      `/api/forum-categories/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`);
  },
  create: async (data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>("/api/forum-categories/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-categories/${id}/`, {
      method: "DELETE",
    });
  },
};

export const forumPostApi = {
  list: async (params?: {
    search?: string;
    category?: number;
    is_pinned?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<ForumPost>>(
      `/api/forum-posts/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`);
  },
  create: async (data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>("/api/forum-posts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  incrementViews: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/increment_views/`, {
      method: "POST",
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-posts/${id}/`, {
      method: "DELETE",
    });
  },
};
