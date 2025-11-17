import { fetchApi } from "./client";
import { CalendarEvent, PaginatedResponse } from "./types";

export const calendarEventApi = {
  list: async (params?: {
    search?: string;
    event_type?: string;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<CalendarEvent>>(
      `/api/calendar-events/?${queryParams}`
    );
  },
  upcoming: async () => {
    return fetchApi<CalendarEvent[]>("/api/calendar-events/upcoming/");
  },
  get: async (id: number) => {
    return fetchApi<CalendarEvent>(`/api/calendar-events/${id}/`);
  },
  create: async (data: Partial<CalendarEvent>) => {
    return fetchApi<CalendarEvent>("/api/calendar-events/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<CalendarEvent>) => {
    return fetchApi<CalendarEvent>(`/api/calendar-events/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/calendar-events/${id}/`, {
      method: "DELETE",
    });
  },
};
