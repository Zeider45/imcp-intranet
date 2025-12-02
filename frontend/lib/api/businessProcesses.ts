import { fetchApi } from "./client";
import {
  LibraryDocument,
  Policy,
  PolicyDistribution,
  TrainingPlan,
  TrainingProvider,
  TrainingQuotation,
  TrainingSession,
  TrainingAttendance,
  InternalVacancy,
  VacancyApplication,
  VacancyTransition,
  ForumCategory,
  ForumPost,
  PaginatedResponse,
} from "./types";

// ========================================
// BIBLIOTECA DE DOCUMENTOS UNIFICADA API
// ========================================

export const libraryDocumentApi = {
  list: async (params?: {
    search?: string;
    document_type?: string;
    status?: string;
    department?: number;
    approval_decision?: string;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<LibraryDocument>>(
      `/api/library-documents/?${queryParams}`
    );
  },
  published: async () => {
    return fetchApi<PaginatedResponse<LibraryDocument>>(
      "/api/library-documents/published/"
    );
  },
  myDocuments: async () => {
    return fetchApi<PaginatedResponse<LibraryDocument>>(
      "/api/library-documents/my_documents/"
    );
  },
  pendingApproval: async () => {
    return fetchApi<PaginatedResponse<LibraryDocument>>(
      "/api/library-documents/pending_approval/"
    );
  },
  recent: async () => {
    return fetchApi<LibraryDocument[]>("/api/library-documents/recent/");
  },
  get: async (id: number) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/`);
  },
  create: async (data: Partial<LibraryDocument>) => {
    return fetchApi<LibraryDocument>("/api/library-documents/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  createWithFile: async (formData: FormData) => {
    // For file uploads, we need to use multipart/form-data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/library-documents/`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    if (!response.ok) {
      let errorMessage = "Error uploading document";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      return { error: errorMessage };
    }
    const data = await response.json();
    return { data };
  },
  update: async (id: number, data: Partial<LibraryDocument>) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  updateWithFile: async (id: number, formData: FormData) => {
    // For file uploads, we need to use multipart/form-data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/library-documents/${id}/`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
      }
    );
    if (!response.ok) {
      let errorMessage = "Error updating document";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      return { error: errorMessage };
    }
    const data = await response.json();
    return { data };
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/library-documents/${id}/`, {
      method: "DELETE",
    });
  },
  submitForApproval: async (id: number) => {
    return fetchApi<LibraryDocument>(
      `/api/library-documents/${id}/submit_for_approval/`,
      {
        method: "POST",
      }
    );
  },
  approve: async (id: number, observations?: string) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ observations }),
    });
  },
  approveWithObservations: async (
    id: number,
    observations: string,
    corrections: string
  ) => {
    return fetchApi<LibraryDocument>(
      `/api/library-documents/${id}/approve_with_observations/`,
      {
        method: "POST",
        body: JSON.stringify({
          observations,
          corrections,
        }),
      }
    );
  },
  reject: async (id: number, reason: string) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
  publish: async (id: number) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/publish/`, {
      method: "POST",
    });
  },
  archive: async (id: number) => {
    return fetchApi<LibraryDocument>(`/api/library-documents/${id}/archive/`, {
      method: "POST",
    });
  },
  incrementView: async (id: number) => {
    return fetchApi<LibraryDocument>(
      `/api/library-documents/${id}/increment_view/`,
      {
        method: "POST",
      }
    );
  },
  incrementDownload: async (id: number) => {
    return fetchApi<LibraryDocument>(
      `/api/library-documents/${id}/increment_download/`,
      {
        method: "POST",
      }
    );
  },
};

// ========================================
// ESTABLECER POLÍTICAS APIs
// ========================================

export const policyApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    origin?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<Policy>>(`/api/policies/?${queryParams}`);
  },
  published: async () => {
    return fetchApi<PaginatedResponse<Policy>>("/api/policies/published/");
  },
  pendingApproval: async () => {
    return fetchApi<Policy[]>("/api/policies/pending_approval/");
  },
  get: async (id: number) => {
    return fetchApi<Policy>(`/api/policies/${id}/`);
  },
  create: async (data: Partial<Policy>) => {
    return fetchApi<Policy>("/api/policies/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  submitForReview: async (
    id: number,
    peerReviewerId?: number,
    auditorReviewerId?: number
  ) => {
    return fetchApi<Policy>(`/api/policies/${id}/submit_for_review/`, {
      method: "POST",
      body: JSON.stringify({
        peer_reviewer: peerReviewerId,
        auditor_reviewer: auditorReviewerId,
      }),
    });
  },
  approveBoard: async (id: number, approvalDate: string) => {
    return fetchApi<Policy>(`/api/policies/${id}/approve_board/`, {
      method: "POST",
      body: JSON.stringify({ approval_date: approvalDate }),
    });
  },
  publish: async (id: number, effectiveDate?: string) => {
    return fetchApi<Policy>(`/api/policies/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify({ effective_date: effectiveDate }),
    });
  },
  markObsolete: async (id: number) => {
    return fetchApi<Policy>(`/api/policies/${id}/mark_obsolete/`, {
      method: "POST",
    });
  },
  update: async (id: number, data: Partial<Policy>) => {
    return fetchApi<Policy>(`/api/policies/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/policies/${id}/`, {
      method: "DELETE",
    });
  },
};

export const policyDistributionApi = {
  list: async (params?: {
    search?: string;
    policy?: number;
    recipient?: number;
    acknowledged?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<PolicyDistribution>>(
      `/api/policy-distributions/?${queryParams}`
    );
  },
  pendingAcknowledgment: async () => {
    return fetchApi<PolicyDistribution[]>(
      "/api/policy-distributions/pending_acknowledgment/"
    );
  },
  get: async (id: number) => {
    return fetchApi<PolicyDistribution>(`/api/policy-distributions/${id}/`);
  },
  create: async (data: Partial<PolicyDistribution>) => {
    return fetchApi<PolicyDistribution>("/api/policy-distributions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  acknowledge: async (id: number) => {
    return fetchApi<PolicyDistribution>(
      `/api/policy-distributions/${id}/acknowledge/`,
      {
        method: "POST",
      }
    );
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/policy-distributions/${id}/`, {
      method: "DELETE",
    });
  },
};

// ========================================
// PLANIFICAR CAPACITACIONES APIs
// ========================================

export const trainingPlanApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    origin?: string;
    scope?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TrainingPlan>>(
      `/api/training-plans/?${queryParams}`
    );
  },
  calendar: async () => {
    return fetchApi<TrainingPlan[]>("/api/training-plans/calendar/");
  },
  get: async (id: number) => {
    return fetchApi<TrainingPlan>(`/api/training-plans/${id}/`);
  },
  create: async (data: Partial<TrainingPlan>) => {
    return fetchApi<TrainingPlan>("/api/training-plans/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  approveBudget: async (id: number) => {
    return fetchApi<TrainingPlan>(
      `/api/training-plans/${id}/approve_budget/`,
      {
        method: "POST",
      }
    );
  },
  assignManager: async (id: number, managerId: number) => {
    return fetchApi<TrainingPlan>(`/api/training-plans/${id}/assign_manager/`, {
      method: "POST",
      body: JSON.stringify({ manager_id: managerId }),
    });
  },
  update: async (id: number, data: Partial<TrainingPlan>) => {
    return fetchApi<TrainingPlan>(`/api/training-plans/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/training-plans/${id}/`, {
      method: "DELETE",
    });
  },
};

export const trainingProviderApi = {
  list: async (params?: {
    search?: string;
    is_active?: boolean;
    rating?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TrainingProvider>>(
      `/api/training-providers/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<TrainingProvider[]>("/api/training-providers/active/");
  },
  get: async (id: number) => {
    return fetchApi<TrainingProvider>(`/api/training-providers/${id}/`);
  },
  create: async (data: Partial<TrainingProvider>) => {
    return fetchApi<TrainingProvider>("/api/training-providers/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<TrainingProvider>) => {
    return fetchApi<TrainingProvider>(`/api/training-providers/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/training-providers/${id}/`, {
      method: "DELETE",
    });
  },
};

export const trainingQuotationApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    training_plan?: number;
    provider?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TrainingQuotation>>(
      `/api/training-quotations/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<TrainingQuotation>(`/api/training-quotations/${id}/`);
  },
  create: async (data: Partial<TrainingQuotation>) => {
    return fetchApi<TrainingQuotation>("/api/training-quotations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  select: async (id: number) => {
    return fetchApi<TrainingQuotation>(
      `/api/training-quotations/${id}/select/`,
      {
        method: "POST",
      }
    );
  },
  update: async (id: number, data: Partial<TrainingQuotation>) => {
    return fetchApi<TrainingQuotation>(`/api/training-quotations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/training-quotations/${id}/`, {
      method: "DELETE",
    });
  },
};

// ========================================
// ASISTEN A CAPACITACIONES APIs
// ========================================

export const trainingSessionApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    training_plan?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TrainingSession>>(
      `/api/training-sessions/?${queryParams}`
    );
  },
  upcoming: async () => {
    return fetchApi<TrainingSession[]>("/api/training-sessions/upcoming/");
  },
  get: async (id: number) => {
    return fetchApi<TrainingSession>(`/api/training-sessions/${id}/`);
  },
  create: async (data: Partial<TrainingSession>) => {
    return fetchApi<TrainingSession>("/api/training-sessions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  confirm: async (id: number) => {
    return fetchApi<TrainingSession>(`/api/training-sessions/${id}/confirm/`, {
      method: "POST",
    });
  },
  complete: async (id: number) => {
    return fetchApi<TrainingSession>(`/api/training-sessions/${id}/complete/`, {
      method: "POST",
    });
  },
  update: async (id: number, data: Partial<TrainingSession>) => {
    return fetchApi<TrainingSession>(`/api/training-sessions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/training-sessions/${id}/`, {
      method: "DELETE",
    });
  },
};

export const trainingAttendanceApi = {
  list: async (params?: {
    search?: string;
    confirmation_status?: string;
    attendance_status?: string;
    session?: number;
    analyst?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TrainingAttendance>>(
      `/api/training-attendances/?${queryParams}`
    );
  },
  myInvitations: async () => {
    return fetchApi<TrainingAttendance[]>(
      "/api/training-attendances/my_invitations/"
    );
  },
  get: async (id: number) => {
    return fetchApi<TrainingAttendance>(`/api/training-attendances/${id}/`);
  },
  create: async (data: Partial<TrainingAttendance>) => {
    return fetchApi<TrainingAttendance>("/api/training-attendances/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  confirmAttendance: async (id: number) => {
    return fetchApi<TrainingAttendance>(
      `/api/training-attendances/${id}/confirm_attendance/`,
      {
        method: "POST",
      }
    );
  },
  declineAttendance: async (id: number, reason: string) => {
    return fetchApi<TrainingAttendance>(
      `/api/training-attendances/${id}/decline_attendance/`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },
  recordAttendance: async (
    id: number,
    status: string,
    arrivalTime?: string,
    departureTime?: string
  ) => {
    return fetchApi<TrainingAttendance>(
      `/api/training-attendances/${id}/record_attendance/`,
      {
        method: "POST",
        body: JSON.stringify({
          status,
          arrival_time: arrivalTime,
          departure_time: departureTime,
        }),
      }
    );
  },
  issueCertificate: async (id: number, score?: number) => {
    return fetchApi<TrainingAttendance>(
      `/api/training-attendances/${id}/issue_certificate/`,
      {
        method: "POST",
        body: JSON.stringify({ score }),
      }
    );
  },
  update: async (id: number, data: Partial<TrainingAttendance>) => {
    return fetchApi<TrainingAttendance>(`/api/training-attendances/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/training-attendances/${id}/`, {
      method: "DELETE",
    });
  },
};

// ========================================
// DISPONIBILIDAD DE VACANTE INTERNA APIs
// ========================================

export const internalVacancyApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<InternalVacancy>>(
      `/api/internal-vacancies/?${queryParams}`
    );
  },
  published: async () => {
    return fetchApi<PaginatedResponse<InternalVacancy>>(
      "/api/internal-vacancies/published/"
    );
  },
  get: async (id: number) => {
    return fetchApi<InternalVacancy>(`/api/internal-vacancies/${id}/`);
  },
  create: async (data: Partial<InternalVacancy>) => {
    return fetchApi<InternalVacancy>("/api/internal-vacancies/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  approveBudget: async (id: number) => {
    return fetchApi<InternalVacancy>(
      `/api/internal-vacancies/${id}/approve_budget/`,
      {
        method: "POST",
      }
    );
  },
  publish: async (id: number) => {
    return fetchApi<InternalVacancy>(
      `/api/internal-vacancies/${id}/publish/`,
      {
        method: "POST",
      }
    );
  },
  close: async (id: number) => {
    return fetchApi<InternalVacancy>(`/api/internal-vacancies/${id}/close/`, {
      method: "POST",
    });
  },
  update: async (id: number, data: Partial<InternalVacancy>) => {
    return fetchApi<InternalVacancy>(`/api/internal-vacancies/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/internal-vacancies/${id}/`, {
      method: "DELETE",
    });
  },
};

export const vacancyApplicationApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    vacancy?: number;
    applicant?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<VacancyApplication>>(
      `/api/vacancy-applications/?${queryParams}`
    );
  },
  myApplications: async () => {
    return fetchApi<VacancyApplication[]>(
      "/api/vacancy-applications/my_applications/"
    );
  },
  get: async (id: number) => {
    return fetchApi<VacancyApplication>(`/api/vacancy-applications/${id}/`);
  },
  create: async (data: Partial<VacancyApplication>) => {
    return fetchApi<VacancyApplication>("/api/vacancy-applications/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  shortlist: async (id: number) => {
    return fetchApi<VacancyApplication>(
      `/api/vacancy-applications/${id}/shortlist/`,
      {
        method: "POST",
      }
    );
  },
  scheduleInterview: async (id: number, interviewDate: string) => {
    return fetchApi<VacancyApplication>(
      `/api/vacancy-applications/${id}/schedule_interview/`,
      {
        method: "POST",
        body: JSON.stringify({ interview_date: interviewDate }),
      }
    );
  },
  recordInterview: async (
    id: number,
    data: {
      notes?: string;
      technical_score?: number;
      experience_score?: number;
      performance_score?: number;
      potential_score?: number;
    }
  ) => {
    return fetchApi<VacancyApplication>(
      `/api/vacancy-applications/${id}/record_interview/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
  select: async (id: number) => {
    return fetchApi<VacancyApplication>(
      `/api/vacancy-applications/${id}/select/`,
      {
        method: "POST",
      }
    );
  },
  reject: async (id: number, reason: string) => {
    return fetchApi<VacancyApplication>(
      `/api/vacancy-applications/${id}/reject/`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },
  update: async (id: number, data: Partial<VacancyApplication>) => {
    return fetchApi<VacancyApplication>(`/api/vacancy-applications/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/vacancy-applications/${id}/`, {
      method: "DELETE",
    });
  },
};

export const vacancyTransitionApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    previous_department?: number;
    new_department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<VacancyTransition>>(
      `/api/vacancy-transitions/?${queryParams}`
    );
  },
  get: async (id: number) => {
    return fetchApi<VacancyTransition>(`/api/vacancy-transitions/${id}/`);
  },
  create: async (data: Partial<VacancyTransition>) => {
    return fetchApi<VacancyTransition>("/api/vacancy-transitions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  startTransition: async (id: number) => {
    return fetchApi<VacancyTransition>(
      `/api/vacancy-transitions/${id}/start_transition/`,
      {
        method: "POST",
      }
    );
  },
  completeTransition: async (
    id: number,
    data?: {
      directory_updated?: boolean;
      permissions_updated?: boolean;
      file_updated?: boolean;
    }
  ) => {
    return fetchApi<VacancyTransition>(
      `/api/vacancy-transitions/${id}/complete_transition/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
  update: async (id: number, data: Partial<VacancyTransition>) => {
    return fetchApi<VacancyTransition>(`/api/vacancy-transitions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/vacancy-transitions/${id}/`, {
      method: "DELETE",
    });
  },
};

// ========================================
// FORUM APIs
// ========================================

export const forumCategoryApi = {
  list: async (params?: {
    search?: string;
    is_active?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<ForumCategory>>(
      `/api/forum-categories/?${queryParams}`
    );
  },
  active: async () => {
    return fetchApi<ForumCategory[]>("/api/forum-categories/active/");
  },
  get: async (id: number) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`);
  },
  create: async (data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>("/api/forum-categories/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumCategory>) => {
    return fetchApi<ForumCategory>(`/api/forum-categories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-categories/${id}/`, {
      method: "DELETE",
    });
  },
};

export const forumPostApi = {
  list: async (params?: {
    search?: string;
    category?: number;
    author?: number;
    is_pinned?: boolean;
    is_locked?: boolean;
    parent_post?: number | null;
    main_posts_only?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return fetchApi<PaginatedResponse<ForumPost>>(
      `/api/forum-posts/?${queryParams}`
    );
  },
  pinned: async () => {
    return fetchApi<ForumPost[]>("/api/forum-posts/pinned/");
  },
  recent: async () => {
    return fetchApi<ForumPost[]>("/api/forum-posts/recent/");
  },
  popular: async () => {
    return fetchApi<ForumPost[]>("/api/forum-posts/popular/");
  },
  get: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`);
  },
  getReplies: async (id: number) => {
    return fetchApi<PaginatedResponse<ForumPost>>(
      `/api/forum-posts/${id}/replies/`
    );
  },
  create: async (data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>("/api/forum-posts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<ForumPost>) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/forum-posts/${id}/`, {
      method: "DELETE",
    });
  },
  incrementViews: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/increment_views/`, {
      method: "POST",
    });
  },
  togglePin: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/toggle_pin/`, {
      method: "POST",
    });
  },
  toggleLock: async (id: number) => {
    return fetchApi<ForumPost>(`/api/forum-posts/${id}/toggle_lock/`, {
      method: "POST",
    });
  },
};
