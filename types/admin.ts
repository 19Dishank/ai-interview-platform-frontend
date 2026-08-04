export interface AdminStats {
  totalCandidates: number;
  totalRecruiters: number;
  interviewsThisMonth: number;
  activeJobs: number;
  avgScore: number;
  completionRate: number;
}

export interface InterviewChartData {
  month: string;
  interviews: number;
  candidates: number;
  recruiters: number;
}

export interface AdminMockUser {
  id: string;
  name: string | null;
  email: string;
  role: "candidate" | "recruiter";
  status: "active" | "suspended";
  joined: string;
  interviews: number;
}

export interface Template {
  id: string;
  domain: string;
  technology: string;
  difficulty: string;
  questions: number;
  duration: string;
  lastUpdated: string;
}
