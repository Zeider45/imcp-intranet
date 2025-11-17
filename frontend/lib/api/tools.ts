import { fetchApi } from "./client";
import {
  KPIDashboard,
  QuickLink,
  Project,
  Task,
  PaginatedResponse,
} from "./types";

export const kpiDashboardApi = {
  list: async (params?: {
    search?: string;
    department?: number;
    is_active?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<KPIDashboard>>(
      `/api/kpi-dashboards/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<PaginatedResponse<KPIDashboard>>(
      "/api/kpi-dashboards/active/"
    );
  },
  get: async (id: number) => {
    return fetchApi<KPIDashboard>(`/api/kpi-dashboards/${id}/`);
  },
  create: async (data: Partial<KPIDashboard>) => {
    return fetchApi<KPIDashboard>("/api/kpi-dashboards/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<KPIDashboard>) => {
    return fetchApi<KPIDashboard>(`/api/kpi-dashboards/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/kpi-dashboards/${id}/`, {
      method: "DELETE",
    });
  },
};

export const quickLinkApi = {
  list: async (params?: {
    search?: string;
    category?: string;
    is_active?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<QuickLink>>(
      `/api/quick-links/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<QuickLink[]>("/api/quick-links/active/");
  },
  get: async (id: number) => {
    return fetchApi<QuickLink>(`/api/quick-links/${id}/`);
  },
  create: async (data: Partial<QuickLink>) => {
    return fetchApi<QuickLink>("/api/quick-links/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<QuickLink>) => {
    return fetchApi<QuickLink>(`/api/quick-links/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/quick-links/${id}/`, {
      method: "DELETE",
    });
  },
};

export const projectApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Project>>(
      `/api/projects/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<PaginatedResponse<Project>>("/api/projects/active/");
  },
  get: async (id: number) => {
    return fetchApi<Project>(`/api/projects/${id}/`);
  },
  create: async (data: Partial<Project>) => {
    return fetchApi<Project>("/api/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Project>) => {
    return fetchApi<Project>(`/api/projects/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/projects/${id}/`, {
      method: "DELETE",
    });
  },
};

export const taskApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    project?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Task>>(`/api/tasks/?${queryParams}`);
  },
  myTasks: async () => {
    return fetchApi<PaginatedResponse<Task>>("/api/tasks/my_tasks/");
  },
  get: async (id: number) => {
    return fetchApi<Task>(`/api/tasks/${id}/`);
  },
  create: async (data: Partial<Task>) => {
    return fetchApi<Task>("/api/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Task>) => {
    return fetchApi<Task>(`/api/tasks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/tasks/${id}/`, {
      method: "DELETE",
    });
  },
};
