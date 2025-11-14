import { fetchApi } from "./client";
import { Course, CourseEnrollment, PaginatedResponse } from "./types";

export const courseApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    is_mandatory?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Course>>(`/api/courses/?${queryParams}`);
  },
  published: async () => {
    return fetchApi<PaginatedResponse<Course>>("/api/courses/published/");
  },
  get: async (id: number) => {
    return fetchApi<Course>(`/api/courses/${id}/`);
  },
  create: async (data: Partial<Course>) => {
    return fetchApi<Course>("/api/courses/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Course>) => {
    return fetchApi<Course>(`/api/courses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/courses/${id}/`, {
      method: "DELETE",
    });
  },
};

export const courseEnrollmentApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    course?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<CourseEnrollment>>(
      `/api/course-enrollments/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<CourseEnrollment>(`/api/course-enrollments/${id}/`);
  },
  create: async (data: Partial<CourseEnrollment>) => {
    return fetchApi<CourseEnrollment>("/api/course-enrollments/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<CourseEnrollment>) => {
    return fetchApi<CourseEnrollment>(`/api/course-enrollments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
