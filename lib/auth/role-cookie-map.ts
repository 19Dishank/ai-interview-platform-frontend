export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type AuthCookieKind = "token" | "refresh";

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

export function getRoleCookieName(
  role: string | undefined,
  kind: AuthCookieKind = "token",
): string | undefined {
  if (!role) return undefined;

  if (role !== "CANDIDATE" && role !== "RECRUITER" && role !== "ADMIN") {
    return undefined;
  }

  return kind === "refresh" ? roleRefreshMap[role] : roleTokenMap[role];
}
