import { z } from "zod";

export const emailVerifySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
});

export const otpVerifySchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "Enter the verification code")
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain digits only"),
});

export const roleSchema = z.enum(["candidate", "recruiter"], {
  message: "Select a role to continue",
});

// Full shape backing the multi-step useForm instance.
// emailVerify/otpVerify are validated independently per step (see page.tsx),
// so this being "complete" doesn't imply both steps were filled at once.
export const authFormSchema = z.object({
  emailVerify: emailVerifySchema,
  otpVerify: otpVerifySchema,
});

export type EmailVerifyValues = z.infer<typeof emailVerifySchema>;
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
export type Role = z.infer<typeof roleSchema>;
export type AuthFormValues = z.infer<typeof authFormSchema>;
export type AuthFormTypes = AuthFormValues;
