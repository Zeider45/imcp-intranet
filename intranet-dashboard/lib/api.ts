const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface WelcomeResponse {
  message: string;
  description: string;
  version: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export async function getWelcome(): Promise<{ data?: WelcomeResponse; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/welcome/`);
    if (!response.ok) {
      throw new Error('Failed to fetch welcome data');
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkHealth(): Promise<{ data?: HealthCheckResponse; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    if (!response.ok) {
      throw new Error('Failed to fetch health data');
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
