import { fetchApi } from "./client";
import { Suggestion, PaginatedResponse } from "./types";

export const suggestionApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Suggestion>>(
      `/api/suggestions/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/`);
  },
  create: async (data: Partial<Suggestion>) => {
    return fetchApi<Suggestion>("/api/suggestions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Suggestion>) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  upvote: async (id: number) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/upvote/`, {
      method: "POST",
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/suggestions/${id}/`, {
      method: "DELETE",
    });
  },
};
