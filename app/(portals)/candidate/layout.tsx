import type { Metadata } from "next";
import { CandidateOnboardingGuard } from "@/components/candidate/profile/CandidateOnboardingGuard";

export const metadata: Metadata = {
  title: {
    default: "Candidate Portal - Verquo",
    template: "%s | Candidate Portal - Verquo",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateOnboardingGuard>{children}</CandidateOnboardingGuard>;
}
