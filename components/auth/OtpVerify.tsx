"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AuthFormTypes } from "@/types/auth-forms.types";
import { Controller, useFormContext } from "react-hook-form";

interface OtpVerifyProps {
  email: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const OtpVerify = ({ email, loading, onSubmit, onBack }: OtpVerifyProps) => {
  const {
    formState: { errors },
    control,
  } = useFormContext<AuthFormTypes>();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-center mb-2">
        Check your inbox
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8">
        We sent a 6-digit code to{" "}
        <strong className="text-foreground">{email}</strong>
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Controller
          name="otpVerify.otp"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="signup-input-otp"
              label="Verification code"
              type="text"
              placeholder="000000"
              error={errors.otpVerify?.otp?.message}
            />
          )}
        />

        <Button
          id="signup-btn-otp-continue"
          type="submit"
          loading={loading}
          className="w-full"
        >
          Verify & continue <ArrowRight size={16} />
        </Button>
      </form>
      <button
        id="signup-btn-otp-back"
        onClick={onBack}
        className="block text-sm text-center text-muted-foreground hover:text-foreground mt-4 w-full transition-colors cursor-pointer"
      >
        ← Back
      </button>
    </div>
  );
};

export default OtpVerify;
