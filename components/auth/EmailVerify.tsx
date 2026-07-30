"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Image from "next/image";

type Role = "candidate" | "recruiter";

interface EmailVerifyProps {
  role: Role;
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleContinue: () => void;
  onBack: () => void;
}

const EmailVerify = ({
  role,
  email,
  setEmail,
  loading,
  onSubmit,
  onGoogleContinue,
  onBack,
}: EmailVerifyProps) => {
  return (
    <div>
      {/* Neutral heading — no longer assumes this is a first-time signup */}
      <h1 className="font-display text-2xl font-semibold text-center mb-2">
        Enter your email
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8">
        We&apos;ll send a one-time code. New here? This creates your {role}{" "}
        account too.
      </p>

      <Button
        id="signup-btn-google"
        variant="outline"
        type="button"
        className="w-full mb-4"
        onClick={onGoogleContinue}
      >
        <Image src="/icons/google.svg" alt="google" height={20} width={20} />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="h-px flex-1 bg-border" />
        or continue with email
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          id="signup-input-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
