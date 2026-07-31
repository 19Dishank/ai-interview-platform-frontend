export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: null | string;
      avatar: null | string | string[];
      role: "RECRUITER" | "ADMIN" | "CANDIDATE";
    };
  };
}
