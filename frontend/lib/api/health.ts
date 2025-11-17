import { fetchApi } from "./client";
import { HealthCheckResponse, WelcomeResponse, ApiResponse } from "./types";

export async function checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
  return fetchApi<HealthCheckResponse>("/api/health/");
}

export async function getWelcome(): Promise<ApiResponse<WelcomeResponse>> {
  return fetchApi<WelcomeResponse>("/api/welcome/");
}
