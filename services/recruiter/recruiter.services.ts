import { clientApi } from "@/services/api/client-axios";
import type { Candidate } from "@/types";

export interface CandidateFilters {
  query?: string;
  domain?: string;
  technology?: string;
  level?: string;
  difficulty?: string;
  location?: string;
  notice?: string;
  minScore?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const fetchCandidates = async (filters: CandidateFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "All" && val !== "Any") {
      params.append(key, String(val));
    }
  });

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const response = await clientApi.get(`/recruiter/candidates${queryStr}`);
  return response.data;
};

export const fetchCandidateDetail = async (id: string) => {
  const response = await clientApi.get(`/recruiter/candidates/${id}`);
  return response.data;
};

export const compareCandidates = async (candidateIds: string[]) => {
  const response = await clientApi.post("/recruiter/candidates/compare", {
    candidateIds,
  });
  return response.data;
};

export const contactCandidate = async (
  candidateId: string,
  payload: {
    subject?: string;
    message?: string;
    jobTitle?: string;
    salaryRange?: string;
  },
) => {
  const response = await clientApi.post(
    `/recruiter/candidates/${candidateId}/contact`,
    payload,
  );
  return response.data;
};
