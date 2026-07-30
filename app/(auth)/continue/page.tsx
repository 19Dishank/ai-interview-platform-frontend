/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import Image from "next/image";
import { toast } from "sonner";
import Loading from "@/app/loading";
import RoleSelector from "@/components/auth/RoleSelector";
import EmailVerify from "@/components/auth/EmailVerify";
import OtpVerify from "@/components/auth/OtpVerify";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { sendOTP, verifyOTP } from "@/services/auth/auth.services";

type Role = "candidate" | "recruiter";
type Step = "role" | "email" | "otp";

function SignupForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role") as Role | null;
  const stepParam = searchParams.get("step") as Step | null;
  const emailParam = searchParams.get("email") ?? "";

  const [selectedRole, setSelectedRole] = useState<Role>(
    roleParam ?? "candidate",
  );
  const role: Role = roleParam ?? selectedRole;

  useEffect(() => {
    if (roleParam) setSelectedRole(roleParam);
  }, [roleParam]);

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const step: Step = !roleParam
    ? "role"
    : stepParam === "otp" && !emailParam && !email
      ? "email"
      : (stepParam ?? "email");

  const goToStep = (next: Step, withEmail?: string) => {
    const params = new URLSearchParams({ role, step: next });
    const emailToUse = withEmail ?? email;
    if (emailToUse) params.set("email", emailToUse);
    router.push(`/continue?${params.toString()}`);
  };

  const handleRoleContinue = () => {
    router.push(`/continue?role=${selectedRole}&step=email`);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await sendOTP({ email, role });
      if (!success) {
        return;
      }
      goToStep("otp", email);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await verifyOTP({ email, otp, role });
      if (!success) {
        return;
      }
      router.push(
        success.data.user.role === "CANDIDATE"
          ? "/candidate/profile/build"
          : "/recruiter/search",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleContinue = () => {
    window.location.href = `/api/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[420px_1fr]">
      <AuthSidePanel role={role} showRoleContext={step !== "role"} />

      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Logo only shown here on mobile, since the side panel (which
              carries the logo) is hidden below the md breakpoint */}
          <Link
            href="/"
            className="flex md:hidden items-center gap-2 mb-10 justify-center"
          >
            <Image
              src={`/verquo-lockup-${theme}.svg`}
              alt="Verquo Logo"
              width={112}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>

          {step === "role" && (
            <RoleSelector
              role={selectedRole}
              setRole={setSelectedRole}
              onContinue={handleRoleContinue}
            />
          )}

          {step === "email" && (
            <EmailVerify
              role={role}
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleEmailSubmit}
              onGoogleContinue={handleGoogleContinue}
              onBack={() => goToStep("role")}
            />
          )}

          {step === "otp" && (
            <OtpVerify
              email={emailParam || email}
              loading={loading}
              otp={otp}
              setOtp={setOtp}
              onSubmit={handleOtpSubmit}
              onBack={() => goToStep("email")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupForm />
    </Suspense>
  );
}
