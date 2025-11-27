import { fetchApi } from "./client";
import {
  TechnicalDocument,
  DocumentLoan,
  DocumentDraft,
  DocumentApproval,
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
  PaginatedResponse,
} from "./types";

// ========================================
// CONSULTA DE DOCUMENTACIÓN APIs
// ========================================

export const technicalDocumentApi = {
  list: async (params?: {
    search?: string;
    document_type?: string;
    status?: string;
    department?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<TechnicalDocument>>(
      `/api/technical-documents/?${queryParams}`
    );
  },
  available: async () => {
    return fetchApi<PaginatedResponse<TechnicalDocument>>(
      "/api/technical-documents/available/"
    );
  },
  catalog: async () => {
    return fetchApi<
      Array<{
        id: number;
        code: string;
        title: string;
        document_type: string;
        physical_location: string;
        status: string;
      }>
    >("/api/technical-documents/catalog/");
  },
  get: async (id: number) => {
    return fetchApi<TechnicalDocument>(`/api/technical-documents/${id}/`);
  },
  create: async (data: Partial<TechnicalDocument>) => {
    return fetchApi<TechnicalDocument>("/api/technical-documents/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<TechnicalDocument>) => {
    return fetchApi<TechnicalDocument>(`/api/technical-documents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/technical-documents/${id}/`, {
      method: "DELETE",
    });
  },
};

export const documentLoanApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    document?: number;
    analyst?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<DocumentLoan>>(
      `/api/document-loans/?${queryParams}`
    );
  },
  pending: async () => {
    return fetchApi<PaginatedResponse<DocumentLoan>>(
      "/api/document-loans/pending/"
    );
  },
  overdue: async () => {
    return fetchApi<DocumentLoan[]>("/api/document-loans/overdue/");
  },
  get: async (id: number) => {
    return fetchApi<DocumentLoan>(`/api/document-loans/${id}/`);
  },
  create: async (data: Partial<DocumentLoan>) => {
    return fetchApi<DocumentLoan>("/api/document-loans/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  approve: async (id: number) => {
    return fetchApi<DocumentLoan>(`/api/document-loans/${id}/approve/`, {
      method: "POST",
    });
  },
  deliver: async (id: number) => {
    return fetchApi<DocumentLoan>(`/api/document-loans/${id}/deliver/`, {
      method: "POST",
    });
  },
  returnDocument: async (id: number) => {
    return fetchApi<DocumentLoan>(`/api/document-loans/${id}/return_document/`, {
      method: "POST",
    });
  },
  update: async (id: number, data: Partial<DocumentLoan>) => {
    return fetchApi<DocumentLoan>(`/api/document-loans/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/document-loans/${id}/`, {
      method: "DELETE",
    });
  },
};

// ========================================
// REALIZA Y APRUEBA DOCUMENTACIÓN APIs
// ========================================

export const documentDraftApi = {
  list: async (params?: {
    search?: string;
    document_type?: string;
    status?: string;
    author?: number;
    manager?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<DocumentDraft>>(
      `/api/document-drafts/?${queryParams}`
    );
  },
  myDrafts: async () => {
    return fetchApi<PaginatedResponse<DocumentDraft>>(
      "/api/document-drafts/my_drafts/"
    );
  },
  pendingReview: async () => {
    return fetchApi<PaginatedResponse<DocumentDraft>>(
      "/api/document-drafts/pending_review/"
    );
  },
  get: async (id: number) => {
    return fetchApi<DocumentDraft>(`/api/document-drafts/${id}/`);
  },
  create: async (data: Partial<DocumentDraft>) => {
    return fetchApi<DocumentDraft>("/api/document-drafts/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  submitForReview: async (id: number, managerId?: number) => {
    return fetchApi<DocumentDraft>(
      `/api/document-drafts/${id}/submit_for_review/`,
      {
        method: "POST",
        body: JSON.stringify({ manager: managerId }),
      }
    );
  },
  update: async (id: number, data: Partial<DocumentDraft>) => {
    return fetchApi<DocumentDraft>(`/api/document-drafts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/document-drafts/${id}/`, {
      method: "DELETE",
    });
  },
};

export const documentApprovalApi = {
  list: async (params?: {
    search?: string;
    decision?: string;
    reviewer?: number;
    document_draft?: number;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<DocumentApproval>>(
      `/api/document-approvals/?${queryParams}`
    );
  },
  pending: async () => {
    return fetchApi<PaginatedResponse<DocumentApproval>>(
      "/api/document-approvals/pending/"
    );
  },
  get: async (id: number) => {
    return fetchApi<DocumentApproval>(`/api/document-approvals/${id}/`);
  },
  create: async (data: Partial<DocumentApproval>) => {
    return fetchApi<DocumentApproval>("/api/document-approvals/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  approve: async (id: number, observations?: string) => {
    return fetchApi<DocumentApproval>(
      `/api/document-approvals/${id}/approve/`,
      {
        method: "POST",
        body: JSON.stringify({ observations }),
      }
    );
  },
  approveWithObservations: async (
    id: number,
    observations: string,
    corrections: string,
    deadline?: string
  ) => {
    return fetchApi<DocumentApproval>(
      `/api/document-approvals/${id}/approve_with_observations/`,
      {
        method: "POST",
        body: JSON.stringify({
          observations,
          corrections,
          deadline,
        }),
      }
    );
  },
  reject: async (id: number, reason: string) => {
    return fetchApi<DocumentApproval>(`/api/document-approvals/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
  update: async (id: number, data: Partial<DocumentApproval>) => {
    return fetchApi<DocumentApproval>(`/api/document-approvals/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/document-approvals/${id}/`, {
      method: "DELETE",
    });
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
