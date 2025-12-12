import { fetchApi } from "./client";
import { ApiResponse } from "./types";

export interface ActiveEmployeesCountResponse {
  count: number;
  group: string;
  previous_count?: number;
  percent_change?: number;
  is_positive?: boolean;
}

export interface DocumentsCountResponse {
  count: number;
}

export const metricsApi = {
  async getActiveEmployeesCount(): Promise<
    ApiResponse<ActiveEmployeesCountResponse>
  > {
    return fetchApi<ActiveEmployeesCountResponse>(
      `/api/metrics/active-employees/`
    );
  },
  async getDocumentsCount(): Promise<ApiResponse<DocumentsCountResponse>> {
    return fetchApi<DocumentsCountResponse>(`/api/metrics/documents-count/`);
  },
};
