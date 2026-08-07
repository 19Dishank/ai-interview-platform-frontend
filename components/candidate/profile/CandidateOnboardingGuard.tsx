"use client";

import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/loading";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function CandidateOnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isCandidate = user?.role === "CANDIDATE";
  const requiresOnboarding = isCandidate && !user.isProfileCompleted;
  const isProfileCompleted = isCandidate && user.isProfileCompleted;
  const isProfileBuilder = pathname === "/candidate/profile/build";

  useEffect(() => {
    if (!loading && isCandidate) {
      if (requiresOnboarding && !isProfileBuilder) {
        router.replace("/candidate/profile/build");
      }
    }
  }, [loading, isCandidate, requiresOnboarding, isProfileBuilder, router]);

  if (loading || (requiresOnboarding && !isProfileBuilder)) {
    return <Loading blurry />;
  }

  return <>{children}</>;
}
