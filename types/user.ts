export interface User {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "recruiter" | "admin" | string;
  status: "active" | "suspended" | string;
  joined: string;
  interviews: number;
}
