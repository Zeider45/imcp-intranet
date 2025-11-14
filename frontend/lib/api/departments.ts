import { fetchApi } from "./client";
import { Department, PaginatedResponse } from "./types";

export const departmentApi = {
  list: async (params?: { search?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Department>>(
      `/api/departments/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<Department>(`/api/departments/${id}/`);
  },
  create: async (data: Partial<Department>) => {
    return fetchApi<Department>("/api/departments/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Department>) => {
    return fetchApi<Department>(`/api/departments/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/departments/${id}/`, {
      method: "DELETE",
    });
  },
};
