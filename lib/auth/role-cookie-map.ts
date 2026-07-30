export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";

export const roleTokenMap: Record<Role, string> = {
  CANDIDATE: "candidate_token",
  RECRUITER: "recruiter_token",
  ADMIN: "admin_token",
};

export const roleRefreshMap: Record<Role, string> = {
  CANDIDATE: "candidate_refresh_token",
  RECRUITER: "recruiter_refresh_token",
  ADMIN: "admin_refresh_token",
};
