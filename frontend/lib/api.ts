// API configuration for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface WelcomeResponse {
  message: string;
  version: string;
  description: string;
}

/**
 * Generic API fetch wrapper
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
  return fetchApi<HealthCheckResponse>('/api/health/');
}

/**
 * Get welcome message
 */
export async function getWelcome(): Promise<ApiResponse<WelcomeResponse>> {
  return fetchApi<WelcomeResponse>('/api/welcome/');
}

export { API_BASE_URL };
