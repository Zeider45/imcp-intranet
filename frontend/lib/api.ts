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

// ========================================
// TIME AND RESOURCE MANAGEMENT TYPES
// ========================================

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_type: 'holiday' | 'meeting' | 'event' | 'deadline' | 'other';
  start_date: string;
  end_date: string;
  all_day: boolean;
  location: string;
  created_by: number;
  created_by_name: string;
  attendees: number[];
  attendee_names: string[];
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  leave_type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver: number | null;
  approver_name: string;
  approval_comment: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  name: string;
  resource_type: 'room' | 'equipment' | 'desk' | 'vehicle' | 'other';
  description: string;
  capacity: number | null;
  location: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceReservation {
  id: number;
  resource: number;
  resource_name: string;
  user: number;
  user_name: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// ========================================
// TRAINING AND DEVELOPMENT TYPES
// ========================================

export interface Course {
  id: number;
  title: string;
  description: string;
  content: string;
  instructor: number | null;
  instructor_name: string;
  duration_hours: number;
  status: 'draft' | 'published' | 'archived';
  is_mandatory: boolean;
  department: number | null;
  department_name: string;
  certificate_available: boolean;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: number;
  course: number;
  course_title: string;
  student: number;
  student_name: string;
  enrolled_at: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  progress_percentage: number;
  completed_at: string | null;
  certificate_issued: boolean;
  certificate_issued_at: string | null;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: 'faq' | 'tutorial' | 'guide' | 'policy' | 'other';
  author: number;
  author_name: string;
  department: number | null;
  department_name: string;
  tags: string;
  is_published: boolean;
  views_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// INTERACTION AND COLLABORATION TYPES
// ========================================

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  post_count: number;
  created_at: string;
}

export interface ForumPost {
  id: number;
  category: number;
  category_name: string;
  title: string;
  content: string;
  author: number;
  author_name: string;
  parent_post: number | null;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: number;
  title: string;
  description: string;
  author: number | null;
  author_name: string;
  is_anonymous: boolean;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  category: string;
  reviewer: number | null;
  reviewer_name: string;
  review_comment: string;
  reviewed_at: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// TOOLS AND DATA TYPES
// ========================================

export interface KPIDashboard {
  id: number;
  name: string;
  description: string;
  metric_name: string;
  current_value: number;
  target_value: number | null;
  unit: string;
  department: number | null;
  department_name: string;
  period: string;
  is_active: boolean;
  achievement_percentage: number | null;
  last_updated: string;
  created_at: string;
}

export interface QuickLink {
  id: number;
  title: string;
  url: string;
  description: string;
  category: 'crm' | 'erp' | 'hr' | 'finance' | 'communication' | 'productivity' | 'other';
  icon: string;
  is_active: boolean;
  order: number;
  department: number | null;
  department_name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  project_manager: number | null;
  project_manager_name: string;
  team_members: number[];
  team_member_names: string[];
  department: number | null;
  department_name: string;
  start_date: string | null;
  end_date: string | null;
  progress_percentage: number;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number | null;
  project_name: string;
  assigned_to: number | null;
  assigned_to_name: string;
  created_by: number;
  created_by_name: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// TIME AND RESOURCE MANAGEMENT API
// ========================================

export const calendarEventApi = {
  list: async (params?: { search?: string; event_type?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<CalendarEvent>>(`/api/calendar-events/?${queryParams}`);
  },
  upcoming: async () => {
    return fetchApi<CalendarEvent[]>('/api/calendar-events/upcoming/');
  },
  get: async (id: number) => {
    return fetchApi<CalendarEvent>(`/api/calendar-events/${id}/`);
  },
  create: async (data: Partial<CalendarEvent>) => {
    return fetchApi<CalendarEvent>('/api/calendar-events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<CalendarEvent>) => {
    return fetchApi<CalendarEvent>(`/api/calendar-events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/calendar-events/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const leaveRequestApi = {
  list: async (params?: { search?: string; status?: string; leave_type?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<LeaveRequest>>(`/api/leave-requests/?${queryParams}`);
  },
  pending: async () => {
    return fetchApi<PaginatedResponse<LeaveRequest>>('/api/leave-requests/pending/');
  },
  get: async (id: number) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/`);
  },
  create: async (data: Partial<LeaveRequest>) => {
    return fetchApi<LeaveRequest>('/api/leave-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  approve: async (id: number, comment?: string) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },
  reject: async (id: number, comment?: string) => {
    return fetchApi<LeaveRequest>(`/api/leave-requests/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },
};

export const resourceApi = {
  list: async (params?: { search?: string; resource_type?: string; is_available?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<Resource>>(`/api/resources/?${queryParams}`);
  },
  available: async () => {
    return fetchApi<PaginatedResponse<Resource>>('/api/resources/available/');
  },
  get: async (id: number) => {
    return fetchApi<Resource>(`/api/resources/${id}/`);
  },
  create: async (data: Partial<Resource>) => {
    return fetchApi<Resource>('/api/resources/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Resource>) => {
    return fetchApi<Resource>(`/api/resources/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/resources/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const resourceReservationApi = {
  list: async (params?: { search?: string; status?: string; resource?: number; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<ResourceReservation>>(`/api/resource-reservations/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<ResourceReservation>(`/api/resource-reservations/${id}/`);
  },
  create: async (data: Partial<ResourceReservation>) => {
    return fetchApi<ResourceReservation>('/api/resource-reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ResourceReservation>) => {
    return fetchApi<ResourceReservation>(`/api/resource-reservations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/resource-reservations/${id}/`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// TRAINING AND DEVELOPMENT API
// ========================================

export const courseApi = {
  list: async (params?: { search?: string; status?: string; is_mandatory?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<Course>>(`/api/courses/?${queryParams}`);
  },
  published: async () => {
    return fetchApi<PaginatedResponse<Course>>('/api/courses/published/');
  },
  get: async (id: number) => {
    return fetchApi<Course>(`/api/courses/${id}/`);
  },
  create: async (data: Partial<Course>) => {
    return fetchApi<Course>('/api/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Course>) => {
    return fetchApi<Course>(`/api/courses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/courses/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const courseEnrollmentApi = {
  list: async (params?: { search?: string; status?: string; course?: number; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<CourseEnrollment>>(`/api/course-enrollments/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<CourseEnrollment>(`/api/course-enrollments/${id}/`);
  },
  create: async (data: Partial<CourseEnrollment>) => {
    return fetchApi<CourseEnrollment>('/api/course-enrollments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<CourseEnrollment>) => {
    return fetchApi<CourseEnrollment>(`/api/course-enrollments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const knowledgeArticleApi = {
  list: async (params?: { search?: string; category?: string; is_published?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<KnowledgeArticle>>(`/api/knowledge-articles/?${queryParams}`);
  },
  popular: async () => {
    return fetchApi<KnowledgeArticle[]>('/api/knowledge-articles/popular/');
  },
  get: async (id: number) => {
    return fetchApi<KnowledgeArticle>(`/api/knowledge-articles/${id}/`);
  },
  create: async (data: Partial<KnowledgeArticle>) => {
    return fetchApi<KnowledgeArticle>('/api/knowledge-articles/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<KnowledgeArticle>) => {
    return fetchApi<KnowledgeArticle>(`/api/knowledge-articles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  markHelpful: async (id: number) => {
    return fetchApi<KnowledgeArticle>(`/api/knowledge-articles/${id}/mark_helpful/`, {
      method: 'POST',
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/knowledge-articles/${id}/`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// INTERACTION AND COLLABORATION API
// ========================================

export const forumCategoryApi = {
  list: async (params?: { search?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<ForumCategory>>(`/api/forum-categories/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`);
  },
  create: async (data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>('/api/forum-categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-categories/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const forumPostApi = {
  list: async (params?: { search?: string; category?: number; is_pinned?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<ForumPost>>(`/api/forum-posts/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`);
  },
  create: async (data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>('/api/forum-posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  incrementViews: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/increment_views/`, {
      method: 'POST',
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-posts/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const suggestionApi = {
  list: async (params?: { search?: string; status?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Suggestion>>(`/api/suggestions/?${queryParams}`);
  },
  get: async (id: number) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/`);
  },
  create: async (data: Partial<Suggestion>) => {
    return fetchApi<Suggestion>('/api/suggestions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Suggestion>) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  upvote: async (id: number) => {
    return fetchApi<Suggestion>(`/api/suggestions/${id}/upvote/`, {
      method: 'POST',
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/suggestions/${id}/`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// TOOLS AND DATA API
// ========================================

export const kpiDashboardApi = {
  list: async (params?: { search?: string; department?: number; is_active?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<KPIDashboard>>(`/api/kpi-dashboards/?${queryParams}`);
  },
  active: async () => {
    return fetchApi<PaginatedResponse<KPIDashboard>>('/api/kpi-dashboards/active/');
  },
  get: async (id: number) => {
    return fetchApi<KPIDashboard>(`/api/kpi-dashboards/${id}/`);
  },
  create: async (data: Partial<KPIDashboard>) => {
    return fetchApi<KPIDashboard>('/api/kpi-dashboards/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<KPIDashboard>) => {
    return fetchApi<KPIDashboard>(`/api/kpi-dashboards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/kpi-dashboards/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const quickLinkApi = {
  list: async (params?: { search?: string; category?: string; is_active?: boolean; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<QuickLink>>(`/api/quick-links/?${queryParams}`);
  },
  active: async () => {
    return fetchApi<QuickLink[]>('/api/quick-links/active/');
  },
  get: async (id: number) => {
    return fetchApi<QuickLink>(`/api/quick-links/${id}/`);
  },
  create: async (data: Partial<QuickLink>) => {
    return fetchApi<QuickLink>('/api/quick-links/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<QuickLink>) => {
    return fetchApi<QuickLink>(`/api/quick-links/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/quick-links/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const projectApi = {
  list: async (params?: { search?: string; status?: string; priority?: string; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    return fetchApi<PaginatedResponse<Project>>(`/api/projects/?${queryParams}`);
  },
  active: async () => {
    return fetchApi<PaginatedResponse<Project>>('/api/projects/active/');
  },
  get: async (id: number) => {
    return fetchApi<Project>(`/api/projects/${id}/`);
  },
  create: async (data: Partial<Project>) => {
    return fetchApi<Project>('/api/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Project>) => {
    return fetchApi<Project>(`/api/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/projects/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const taskApi = {
  list: async (params?: { search?: string; status?: string; priority?: string; project?: number; ordering?: string }) => {
    const queryParams = new URLSearchParams(params as unknown as Record<string, string>);
    return fetchApi<PaginatedResponse<Task>>(`/api/tasks/?${queryParams}`);
  },
  myTasks: async () => {
    return fetchApi<PaginatedResponse<Task>>('/api/tasks/my_tasks/');
  },
  get: async (id: number) => {
    return fetchApi<Task>(`/api/tasks/${id}/`);
  },
  create: async (data: Partial<Task>) => {
    return fetchApi<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<Task>) => {
    return fetchApi<Task>(`/api/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/tasks/${id}/`, {
      method: 'DELETE',
    });
  },
};

export { API_BASE_URL };
