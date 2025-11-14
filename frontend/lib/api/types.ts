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
  priority: "low" | "normal" | "high" | "urgent";
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
  category: "policy" | "procedure" | "form" | "report" | "other";
  department: number | null;
  department_name: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  event_type: "holiday" | "meeting" | "event" | "deadline" | "other";
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
  leave_type: "vacation" | "sick" | "personal" | "unpaid" | "other";
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
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
  resource_type: "room" | "equipment" | "desk" | "vehicle" | "other";
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  content: string;
  instructor: number | null;
  instructor_name: string;
  duration_hours: number;
  status: "draft" | "published" | "archived";
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
  status: "enrolled" | "in_progress" | "completed" | "dropped";
  progress_percentage: number;
  completed_at: string | null;
  certificate_issued: boolean;
  certificate_issued_at: string | null;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: "faq" | "tutorial" | "guide" | "policy" | "other";
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
  status:
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "implemented";
  category: string;
  reviewer: number | null;
  reviewer_name: string;
  review_comment: string;
  reviewed_at: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

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
  category:
    | "crm"
    | "erp"
    | "hr"
    | "finance"
    | "communication"
    | "productivity"
    | "other";
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
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
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
  status: "todo" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
