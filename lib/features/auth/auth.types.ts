export type UserType = {
  name: string;
  email: string;
};

export type AuthStateType = {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
};
