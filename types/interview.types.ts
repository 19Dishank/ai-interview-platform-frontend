import { z } from "zod";
import { startInterviewSchema } from "@/lib/validations/interview";

export type StartInterviewForm = z.infer<typeof startInterviewSchema>;

export type InterviewStatus =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "ENDED"
  | "COMPLETED";

export type HiringRecommendation = "STRONG_YES" | "YES" | "MAYBE" | "NO" | "STRONG_NO";

export interface InterviewSession {
  sessionId: string;
  wsUrl: string;
}

export interface InterviewHistoryItem {
  id: string;
  candidateId?: string;
  type: string;
  difficulty: string;
  targetRole: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationSecs: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  evaluationSummary?: string;
  hiringRecommendation: HiringRecommendation;
}

export interface InterviewEvaluation {
  sessionId: string;
  type: string;
  difficulty?: string;
  targetRole?: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
  durationSecs?: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  evaluationSummary: string;
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: HiringRecommendation;
}

export interface InterviewTranscript {
  id: string;
  status: string;
  turns: Array<{
    id?: string;
    turnNumber?: number;
    role: "AI" | "CANDIDATE";
    text: string;
    timestamp?: string;
  }>;
}

export interface InterviewRecording {
  sessionId: string;
  videoKey: string;
  downloadUrl: string;
}
