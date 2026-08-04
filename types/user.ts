import { Role } from "@/lib/auth/role-cookie-map";

export interface User {
  avatar: string | null;
  email: string;
  id: string;
  name: string | null;
  role: Role;
}
