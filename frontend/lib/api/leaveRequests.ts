import { fetchApi } from "./client";
import { LeaveRequest, PaginatedResponse } from "./types";

export const leaveRequestApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    leave_type?: string;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<LeaveRequest>>(
      `/api/leave-requests/?${queryParams}`
    );
  },
  pending: async () => {
    return fetchApi<PaginatedResponse<LeaveRequest>>(
      "/api/leave-requests/pending/"
    );
  },
  get: async (id: number) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/`);
  },
  create: async (data: Partial<LeaveRequest>) => {
    return fetchApi<LeaveRequest>("/api/leave-requests/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  approve: async (id: number, comment?: string) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  },
  reject: async (id: number, comment?: string) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  },
};
