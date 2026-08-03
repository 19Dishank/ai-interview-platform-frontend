import { z } from "zod";

export const emailVerifySchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

export const otpVerifySchema = z.object({
  otp: z
    .string()
    .min(1, { message: "OTP is required" })
    .length(6, { message: "OTP must be exactly 6 characters" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

export const authFormsSchema = z.object({
  emailVerify: emailVerifySchema,
  otpVerify: otpVerifySchema,
});

export type AuthFormTypes = z.infer<typeof authFormsSchema>;
