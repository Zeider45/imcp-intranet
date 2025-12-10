import { fetchApi } from "./client";
import { ApiResponse } from "./types";

export interface ActiveEmployeesCountResponse {
  count: number;
  group: string;
}

export const metricsApi = {
  async getActiveEmployeesCount(): Promise<
    ApiResponse<ActiveEmployeesCountResponse>
  > {
    return fetchApi<ActiveEmployeesCountResponse>(
      `/api/metrics/active-employees/`
    );
  },
};
