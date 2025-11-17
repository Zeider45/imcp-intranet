import { fetchApi, DEFAULT_API_BASE_URL } from "./client";
import { Document, PaginatedResponse } from "./types";

export const documentApi = {
  list: async (params?: {
    search?: string;
    category?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Document>>(
      `/api/documents/?${queryParams}`
    );
  },
  recent: async () => {
    return fetchApi<Document[]>("/api/documents/recent/");
  },
  get: async (id: number) => {
    return fetchApi<Document>(`/api/documents/${id}/`);
  },
  create: async (formData: FormData) => {
    const response = await fetch(`${DEFAULT_API_BASE_URL}/api/documents/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  },
  update: async (id: number, data: Partial<Document>) => {
    return fetchApi<Document>(`/api/documents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/documents/${id}/`, {
      method: "DELETE",
    });
  },
};
