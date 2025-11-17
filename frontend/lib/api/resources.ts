import { fetchApi } from "./client";
import { Resource, ResourceReservation, PaginatedResponse } from "./types";

export const resourceApi = {
  list: async (params?: {
    search?: string;
    resource_type?: string;
    is_available?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Resource>>(
      `/api/resources/?${queryParams}`
    );
  },
  available: async () => {
    return fetchApi<PaginatedResponse<Resource>>("/api/resources/available/");
  },
  get: async (id: number) => {
    return fetchApi<Resource>(`/api/resources/${id}/`);
  },
  create: async (data: Partial<Resource>) => {
    return fetchApi<Resource>("/api/resources/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Resource>) => {
    return fetchApi<Resource>(`/api/resources/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/resources/${id}/`, {
      method: "DELETE",
    });
  },
};

export const resourceReservationApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    resource?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<ResourceReservation>>(
      `/api/resource-reservations/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<ResourceReservation>(`/api/resource-reservations/${id}/`);
  },
  create: async (data: Partial<ResourceReservation>) => {
    return fetchApi<ResourceReservation>("/api/resource-reservations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ResourceReservation>) => {
    return fetchApi<ResourceReservation>(`/api/resource-reservations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/resource-reservations/${id}/`, {
      method: "DELETE",
    });
  },
};
