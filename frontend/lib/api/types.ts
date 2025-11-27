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

// ========================================
// BUSINESS PROCESS INTERFACES - IMCP USE CASES
// ========================================

// Consulta de Documentación
export interface TechnicalDocument {
  id: number;
  title: string;
  code: string;
  description: string;
  document_type:
    | "manual"
    | "procedure"
    | "policy"
    | "guide"
    | "specification"
    | "other";
  physical_location: string;
  department: number | null;
  department_name: string;
  version: string;
  status: "available" | "on_loan" | "archived" | "under_review";
  authorized_users: number[];
  authorized_user_names: string[];
  file: string | null;
  created_by: number;
  created_by_name: string;
  loan_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentLoan {
  id: number;
  document: number;
  document_code: string;
  document_title: string;
  analyst: number;
  analyst_name: string;
  assistant: number | null;
  assistant_name: string;
  status:
    | "requested"
    | "approved"
    | "delivered"
    | "returned"
    | "overdue"
    | "cancelled";
  request_date: string;
  delivery_date: string | null;
  expected_return_date: string | null;
  actual_return_date: string | null;
  purpose: string;
  notes: string;
  analyst_signature: boolean;
  return_verified: boolean;
}

// Realiza y Aprueba Documentación
export interface DocumentDraft {
  id: number;
  title: string;
  document_type:
    | "technical_manual"
    | "user_guide"
    | "functional_spec"
    | "procedure"
    | "other";
  content: string;
  system_or_functionality: string;
  author: number;
  author_name: string;
  status:
    | "draft"
    | "under_review"
    | "pending_approval"
    | "approved"
    | "approved_with_observations"
    | "rejected"
    | "published";
  version: string;
  department: number | null;
  department_name: string;
  file: string | null;
  submitted_at: string | null;
  manager: number | null;
  manager_name: string;
  approval_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentApproval {
  id: number;
  document_draft: number;
  document_draft_title: string;
  reviewer: number;
  reviewer_name: string;
  assistant: number | null;
  assistant_name: string;
  decision: "pending" | "approved" | "approved_with_observations" | "rejected";
  technical_observations: string;
  corrections_required: string;
  correction_deadline: string | null;
  rejection_reason: string;
  approved_at: string | null;
  validity_date: string | null;
  requires_board_approval: boolean;
  board_approved: boolean;
  reviewer_signature: boolean;
  created_at: string;
  updated_at: string;
}

// Establecer Políticas
export interface Policy {
  id: number;
  title: string;
  code: string;
  description: string;
  content: string;
  department: number | null;
  department_name: string;
  status:
    | "draft"
    | "under_review"
    | "pending_signatures"
    | "approved"
    | "published"
    | "obsolete";
  origin:
    | "sudeban"
    | "bcv"
    | "audit"
    | "improvement"
    | "internal"
    | "other";
  origin_justification: string;
  created_by: number;
  created_by_name: string;
  auditor_reviewer: number | null;
  auditor_reviewer_name: string;
  peer_reviewer: number | null;
  peer_reviewer_name: string;
  review_meeting_date: string | null;
  review_meeting_notes: string;
  board_approval_date: string | null;
  board_approved: boolean;
  effective_date: string | null;
  expiration_date: string | null;
  version: string;
  replaces_policy: number | null;
  replaces_policy_code: string;
  file: string | null;
  published_at: string | null;
  distribution_count: number;
  created_at: string;
  updated_at: string;
}

export interface PolicyDistribution {
  id: number;
  policy: number;
  policy_code: string;
  policy_title: string;
  recipient: number;
  recipient_name: string;
  distributed_by: number;
  distributed_by_name: string;
  distributed_at: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

// Planificar Capacitaciones
export interface TrainingPlan {
  id: number;
  title: string;
  description: string;
  topics: string;
  origin:
    | "performance"
    | "new_technology"
    | "regulation"
    | "audit"
    | "other";
  scope: "intergerencial" | "interdepartamental";
  modality: "presential" | "online" | "hybrid";
  duration_hours: number;
  status:
    | "planning"
    | "budget_review"
    | "quotation"
    | "approved"
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled";
  department: number | null;
  department_name: string;
  created_by: number;
  created_by_name: string;
  assigned_manager: number | null;
  assigned_manager_name: string;
  budget_amount: number | null;
  budget_approved: boolean;
  instructor_profile: string;
  planned_start_date: string | null;
  planned_end_date: string | null;
  session_count: number;
  quotation_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingProvider {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  specialties: string;
  rating: number | null;
  notes: string;
  is_active: boolean;
  quotation_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingQuotation {
  id: number;
  training_plan: number;
  training_plan_title: string;
  provider: number;
  provider_name: string;
  status: "received" | "under_review" | "selected" | "rejected";
  temario: string;
  duration_hours: number;
  cost: number;
  instructor_name: string;
  instructor_profile: string;
  available_dates: string;
  validity_date: string | null;
  received_at: string;
  notes: string;
}

// Asisten a Capacitaciones
export interface TrainingSession {
  id: number;
  training_plan: number;
  training_plan_title: string;
  title: string;
  description: string;
  instructor_name: string;
  provider: number | null;
  provider_name: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  location: string;
  start_datetime: string;
  end_datetime: string;
  materials_required: string;
  objectives: string;
  max_participants: number | null;
  confirmation_deadline: string | null;
  attendance_count: number;
  confirmed_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingAttendance {
  id: number;
  session: number;
  session_title: string;
  session_date: string;
  analyst: number;
  analyst_name: string;
  invited_by: number | null;
  invited_by_name: string;
  confirmation_status: "pending" | "confirmed" | "declined" | "rescheduled";
  confirmation_date: string | null;
  decline_reason: string;
  justification_document: string | null;
  attendance_status:
    | "not_recorded"
    | "present"
    | "absent_justified"
    | "absent_unjustified"
    | "late";
  arrival_time: string | null;
  departure_time: string | null;
  attendance_signature: boolean;
  evaluation_score: number | null;
  certificate_issued: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Disponibilidad de Vacante Interna
export interface InternalVacancy {
  id: number;
  title: string;
  department: number;
  department_name: string;
  description: string;
  responsibilities: string;
  technical_requirements: string;
  competencies: string;
  experience_required: string;
  specific_knowledge: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  status:
    | "draft"
    | "pending_approval"
    | "published"
    | "closed"
    | "filled"
    | "cancelled";
  requested_by: number;
  requested_by_name: string;
  hr_manager: number | null;
  hr_manager_name: string;
  authorization_justification: string;
  budget_approved: boolean;
  required_date: string | null;
  application_deadline: string | null;
  published_at: string | null;
  application_count: number;
  created_at: string;
  updated_at: string;
}

export interface VacancyApplication {
  id: number;
  vacancy: number;
  vacancy_title: string;
  applicant: number;
  applicant_name: string;
  current_manager: number | null;
  current_manager_name: string;
  current_manager_authorization: boolean;
  status:
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "interview_scheduled"
    | "interviewed"
    | "selected"
    | "rejected"
    | "withdrawn";
  cover_letter: string;
  cv_file: string | null;
  certificates_file: string | null;
  performance_evaluations: string;
  technical_score: number | null;
  experience_score: number | null;
  performance_score: number | null;
  potential_score: number | null;
  overall_ranking: number | null;
  interview_date: string | null;
  interview_notes: string;
  hr_notes: string;
  rejection_reason: string;
  applied_at: string;
  updated_at: string;
}

export interface VacancyTransition {
  id: number;
  application: number;
  applicant_name: string;
  previous_department: number | null;
  previous_department_name: string;
  new_department: number | null;
  new_department_name: string;
  previous_position: string;
  new_position: string;
  status: "pending" | "in_progress" | "completed";
  transition_date: string | null;
  hr_coordinator: number | null;
  hr_coordinator_name: string;
  directory_updated: boolean;
  system_permissions_updated: boolean;
  file_updated: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}
