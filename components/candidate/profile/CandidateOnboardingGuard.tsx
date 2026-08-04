"use client";

import { useAuth } from "@/context/AuthContext";
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

  useEffect(() => {
    if (loading || !user) return;

    if (user.role === "CANDIDATE") {
      const isOnboarded = user.isOnboarded ?? false;

      // If candidate has NOT completed onboarding and tries to visit any page other than /candidate/profile/build
      if (!isOnboarded && pathname !== "/candidate/profile/build") {
        router.replace("/candidate/profile/build");
      }
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
