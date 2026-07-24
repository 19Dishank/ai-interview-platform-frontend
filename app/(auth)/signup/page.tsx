"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeProvider";
import Image from "next/image";

type Role = "candidate" | "recruiter";
type Step = "role" | "email" | "otp";

function SignupForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as Role | null;
  const [role, setRole] = useState<Role>(roleParam || "candidate");
  const [step, setStep] = useState<Step>(roleParam ? "email" : "role");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(
        role === "candidate" ? "/candidate/profile/build" : "/recruiter/search",
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <Image
            src={`/verquo-lockup-${theme}.svg`}
            alt="Verquo Logo"
            width={112}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {step === "role" && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-center mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Who are you joining as?
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(["candidate", "recruiter"] as Role[]).map((r) => (
                <button
                  key={r}
                  id={`signup-role-${r}`}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer",
                    role === r
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      role === r
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {r === "candidate" ? (
                      <User size={22} />
                    ) : (
                      <Briefcase size={22} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium capitalize">{r}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {r === "candidate"
                        ? "Take an AI interview"
                        : "Hire verified talent"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              id="signup-btn-role-continue"
              className="w-full"
              onClick={() => setStep("email")}
            >
              Continue as {role} <ArrowRight size={16} />
            </Button>
            <p className="text-sm text-center text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {step === "email" && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-center mb-2">
              {role === "candidate" ? "Start your profile" : "Set up your team"}
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              We&apos;ll send a one-time code to verify your email.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <Input
                id="signup-input-email"
                label="Work email"
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
              onClick={() => setStep("role")}
              className="block text-sm text-center text-muted-foreground hover:text-foreground mt-4 w-full transition-colors cursor-pointer"
            >
              ← Change role
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h1 className="font-display text-2xl font-semibold text-center mb-2">
              Check your inbox
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              We sent a 6-digit code to{" "}
              <strong className="text-foreground">{email}</strong>
            </p>
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <Input
                id="signup-input-otp"
                label="Verification code"
                type="text"
                placeholder="000000"
                maxLength={6}
                required
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
              onClick={() => setStep("email")}
              className="block text-sm text-center text-muted-foreground hover:text-foreground mt-4 w-full transition-colors cursor-pointer"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-muted-foreground text-sm">Loading signup...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
