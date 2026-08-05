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
  const requiresOnboarding =
    user?.role === "CANDIDATE" && !user.isProfileCompleted;
  const isProfileBuilder = pathname === "/candidate/profile/build";

  useEffect(() => {
    if (!loading && requiresOnboarding && !isProfileBuilder) {
      router.replace("/candidate/profile/build");
    }
  }, [loading, requiresOnboarding, isProfileBuilder, router]);

  if (loading || (requiresOnboarding && !isProfileBuilder)) {
    return <Loading blurry />;
  }

  return <>{children}</>;
}
