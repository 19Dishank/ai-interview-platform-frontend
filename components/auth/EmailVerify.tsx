"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Controller, useFormContext } from "react-hook-form";
import { AuthFormTypes } from "@/types/auth-forms.types";
import GoogleLoginButton from "../ui/GoogleLoginButton";

type Role = "candidate" | "recruiter";

interface EmailVerifyProps {
  role: Role;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const EmailVerify = ({ role, loading, onSubmit, onBack }: EmailVerifyProps) => {
  const {
    formState: { errors },
    control,
  } = useFormContext<AuthFormTypes>();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-center mb-2">
        Enter your email
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8">
        We&apos;ll send a one-time code. New here? This creates your {role}{" "}
        account too.
      </p>

      <div className="mb-4">
        <GoogleLoginButton role={role} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="h-px flex-1 bg-border" />
        or continue with email
        <div className="h-px flex-1 bg-border" />
      </div>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="emailVerify.email"
          render={({ field }) => (
            <Input
              {...field}
              id="signup-input-email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.emailVerify?.email?.message}
            />
          )}
        />

        <Button
          id="signup-btn-email-continue"
          type="submit"
          loading={loading}
          className="w-full"
        >
          Send verification code <ArrowRight size={16} />
        </Button>
      </form>
      <button
        id="signup-btn-email-back"
        onClick={onBack}
        className="block text-sm text-center text-muted-foreground hover:text-foreground mt-4 w-full transition-colors cursor-pointer"
      >
        ← Change role
      </button>
    </div>
  );
};

export default EmailVerify;
