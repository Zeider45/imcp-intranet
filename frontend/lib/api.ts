// API configuration for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

export interface Department {
  id: number;
  name: string;
  description: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
}

export interface UserProfile {
  id: number;
  user: User;
  department: number;
  department_name: string;
  phone: string;
  position: string;
  bio: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: number;
  author_name: string;
  author_username: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  published_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  file: string;
  file_url: string;
  file_size: number;
  category: 'policy' | 'procedure' | 'form' | 'report' | 'other';
  department: number | null;
  department_name: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  updated_at: string;
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

/**
 * Department API methods
 */
export const departmentApi = {
  list: async (params?: { search?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Department>>(`/api/departments/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<Department>(`/api/departments/${id}/`);
  },
  create: async (data: Partial<Department>) => {
    return fetchApi<Department>('/api/departments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Department>) => {
    return fetchApi<Department>(`/api/departments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/departments/${id}/`, {
      method: 'DELETE',
    });
  },
};

/**
 * User Profile API methods
 */
export const profileApi = {
  list: async (params?: { search?: string; department?: number; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<UserProfile>>(`/api/profiles/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<UserProfile>(`/api/profiles/${id}/`);
  },
  me: async () => {
    return fetchApi<UserProfile>('/api/profiles/me/');
  },
  update: async (id: number, data: Partial<UserProfile>) => {
    return fetchApi<UserProfile>(`/api/profiles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Announcement API methods
 */
export const announcementApi = {
  list: async (params?: { search?: string; priority?: string; is_active?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<Announcement>>(`/api/announcements/?${queryParams}`);
  },
  active: async () => {
    return fetchApi<PaginatedResponse<Announcement>>('/api/announcements/active/');
  },
  get: async (id: number) => {
    return fetchApi<Announcement>(`/api/announcements/${id}/`);
  },
  create: async (data: Partial<Announcement>) => {
    return fetchApi<Announcement>('/api/announcements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Announcement>) => {
    return fetchApi<Announcement>(`/api/announcements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/announcements/${id}/`, {
      method: 'DELETE',
    });
  },
};

/**
 * Document API methods
 */
export const documentApi = {
  list: async (params?: { search?: string; category?: string; department?: number; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<Document>>(`/api/documents/?${queryParams}`);
  },
  recent: async () => {
    return fetchApi<Document[]>('/api/documents/recent/');
  },
  get: async (id: number) => {
    return fetchApi<Document>(`/api/documents/${id}/`);
  },
  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/documents/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    
    const data = await response.json();
    return { data };
  },
  update: async (id: number, data: Partial<Document>) => {
    return fetchApi<Document>(`/api/documents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/documents/${id}/`, {
      method: 'DELETE',
    });
  },
};

export { API_BASE_URL };
