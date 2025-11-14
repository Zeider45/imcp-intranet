import { fetchApi } from "./client";
import { KnowledgeArticle, PaginatedResponse } from "./types";

export const knowledgeArticleApi = {
  list: async (params?: {
    search?: string;
    category?: string;
    is_published?: boolean;
    ordering?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as unknown as Record<string, string>
    );
    return fetchApi<PaginatedResponse<KnowledgeArticle>>(
      `/api/knowledge-articles/?${queryParams}`
    );
  },
  popular: async () => {
    return fetchApi<KnowledgeArticle[]>("/api/knowledge-articles/popular/");
  },
  get: async (id: number) => {
    return fetchApi<KnowledgeArticle>(`/api/knowledge-articles/${id}/`);
  },
  create: async (data: Partial<KnowledgeArticle>) => {
    return fetchApi<KnowledgeArticle>("/api/knowledge-articles/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: Partial<KnowledgeArticle>) => {
    return fetchApi<KnowledgeArticle>(`/api/knowledge-articles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  markHelpful: async (id: number) => {
    return fetchApi<KnowledgeArticle>(
      `/api/knowledge-articles/${id}/mark_helpful/`,
      {
        method: "POST",
      }
    );
  },
  delete: async (id: number) => {
    return fetchApi<void>(`/api/knowledge-articles/${id}/`, {
      method: "DELETE",
    });
  },
};
