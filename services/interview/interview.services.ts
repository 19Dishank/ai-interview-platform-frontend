import { clientApi } from "@/services/api/client-axios";
import type {
  StartInterviewForm,
  InterviewSession,
  InterviewHistoryItem,
  InterviewTranscript,
  InterviewEvaluation,
  InterviewRecording,
} from "@/types/interview.types";

export const startInterviewSession = async (
  payload: StartInterviewForm
): Promise<InterviewSession> => {
  const response = await clientApi.post("/interview/start", payload);
  return response.data.data;
};

export const fetchInterviewHistory = async (
  limit = 20,
  offset = 0
): Promise<InterviewHistoryItem[]> => {
  const response = await clientApi.get(
    `/interview/history?limit=${limit}&offset=${offset}`
  );
  return response.data.data;
};

export const fetchInterviewTranscript = async (
  id: string
): Promise<InterviewTranscript> => {
  const response = await clientApi.get(`/interview/${id}/transcript`);
  return response.data.data;
};

export const fetchInterviewEvaluation = async (
  id: string
): Promise<InterviewEvaluation> => {
  const response = await clientApi.get(`/interview/${id}/evaluation`);
  return response.data.data;
};

export const fetchInterviewRecording = async (
  id: string
): Promise<InterviewRecording> => {
  const response = await clientApi.get(`/interview/${id}/recording`);
  return response.data.data;
};
