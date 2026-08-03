/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import Image from "next/image";
import Loading from "@/app/loading";
import RoleSelector from "@/components/auth/RoleSelector";
import EmailVerify from "@/components/auth/EmailVerify";
import OtpVerify from "@/components/auth/OtpVerify";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { sendOTP, verifyOTP } from "@/services/auth/auth.services";
import { FormProvider, useForm } from "react-hook-form";
import { AuthFormTypes, authFormsSchema } from "@/types/auth-forms.types";
import { zodResolver } from "@hookform/resolvers/zod";

type Role = "candidate" | "recruiter";
type Step = "role" | "email" | "otp";

const VALID_ROLES: Role[] = ["candidate", "recruiter"];
const VALID_STEPS: Step[] = ["role", "email", "otp"];

const isValidRole = (r: string | null): r is Role =>
  !!r && (VALID_ROLES as string[]).includes(r);

const isValidStep = (s: string | null): s is Step =>
  !!s && (VALID_STEPS as string[]).includes(s);

// very light sanity check, just enough to catch garbage/tampered values
const isValidEmail = (e: string | null): boolean =>
  !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function SignupForm() {
  const methods = useForm<AuthFormTypes>({
    resolver: zodResolver(authFormsSchema),
    defaultValues: {
      emailVerify: { email: "" },
      otpVerify: { otp: "" },
    },
  });
  const { getValues } = methods;
  const values = getValues();
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  const roleParamRaw = searchParams.get("role");
  const stepParamRaw = searchParams.get("step");
  const emailParam = searchParams.get("email") ?? "";

  const roleParam: Role | null = isValidRole(roleParamRaw)
    ? roleParamRaw
    : null;
  const stepParam: Step | null = isValidStep(stepParamRaw)
    ? stepParamRaw
    : null;

  const [selectedRole, setSelectedRole] = useState<Role>(
    roleParam ?? "candidate",
  );
  const role: Role = roleParam ?? selectedRole ?? "candidate";

  useEffect(() => {
    if (roleParam) setSelectedRole(roleParam);
  }, [roleParam]);

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    const hasRole = searchParams.has("role");
    const hasStep = searchParams.has("step");
    const hasEmail = searchParams.has("email");

    const roleIsBad = hasRole && !isValidRole(roleParamRaw);
    const stepIsBad = hasStep && !isValidStep(stepParamRaw);

    const emailStepNeedsRole = stepParamRaw === "email" && !hasRole;
    const otpStepNeedsEmail =
      stepParamRaw === "otp" && hasEmail && !isValidEmail(emailParam);
    const otpStepNeedsRole = stepParamRaw === "otp" && !hasRole;

    if (
      roleIsBad ||
      stepIsBad ||
      emailStepNeedsRole ||
      otpStepNeedsEmail ||
      otpStepNeedsRole
    ) {
      router.replace("/continue");
    }
  }, [searchParams, roleParamRaw, stepParamRaw, emailParam, router]);

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
    const isValid = await methods.trigger("emailVerify.email");
    if (!isValid) return;

    setLoading(true);
    const email = getValues().emailVerify.email;
    try {
      const success = await sendOTP({ email, role });

      if (success) {
        goToStep("otp", email);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await methods.trigger("otpVerify.otp");
    if (!isValid) return;

    setLoading(true);

    const email = getValues().emailVerify.email || emailParam;
    const otp = getValues().otpVerify.otp;

    try {
      const response = await verifyOTP({ email, otp, role });

      if (!response) return;

      router.push(
        response.data.user.role === "CANDIDATE"
          ? "/candidate/profile/build"
          : "/recruiter/search",
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <FormProvider {...methods}>
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
                loading={loading}
                onSubmit={handleEmailSubmit}
                onBack={() => goToStep("role")}
              />
            )}

            {step === "otp" && (
              <OtpVerify
                email={emailParam || email}
                loading={loading}
                onSubmit={handleOtpSubmit}
                onBack={() => goToStep("email")}
              />
            )}
          </FormProvider>
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
