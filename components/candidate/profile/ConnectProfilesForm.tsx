"use client";

import { GitBranch, Link2, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InterviewStatusCard } from "./ui/InterviewStatusCard";
import { CandidateProfileForm } from "@/types/profile.types";
import { useFormContext } from "react-hook-form";

export default function ConnectProfilesForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">
        Connect your profiles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <GitBranch size={20} />
          <div className="flex-1">
            <div className="font-medium text-sm">GitHub</div>
            <div className="text-xs text-muted-foreground">
              Show your public repositories and contribution history
            </div>
          </div>
          <Button variant="outline" size="sm" type="button">
            Connect
          </Button>
        </div>
        <div className="flex items-center gap-3 p-4 border border-success/40 bg-success/5 rounded-lg">
          <Link2 size={20} className="text-primary" />
          <div className="flex-1">
            <div className="font-medium text-sm">LinkedIn</div>
            <div className="text-xs text-muted-foreground">
              linkedin.com/in/arjunmehta — connected
            </div>
          </div>
          <span className="text-xs text-success font-mono">Connected</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
        <Globe size={20} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-sm mb-1.5">
            Portfolio / personal website
          </div>
          <input
            type="url"
            placeholder="https://arjunmehta.dev"
            className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("links.portfolio")}
          />
          {errors.links?.portfolio?.message && (
            <p className="text-xs text-destructive mt-1">
              {errors.links.portfolio.message as string}
            </p>
          )}
        </div>
      </div>

      {/*
        `missingFields` should come from real validation of the candidate's saved
        profile (e.g. computed in ProfileBuilder from all 5 steps' data), not
        hardcoded here. Passing an empty array + interviewTaken=false means "ready".
        Example wiring once profile state is lifted to ProfileBuilder:

          <InterviewStatusCard
            missingFields={getMissingProfileFields(profileData)}
            interviewTaken={candidate.interviewTaken}
            domain={candidate.lastInterviewDomain}
            validUntil={candidate.reportValidUntil}
            retakeAvailable={candidate.retakeAvailable}
            onCompleteProfile={() => setStep(firstIncompleteStepIndex)}
            onStartInterview={() => router.push('/candidate/interview/setup')}
            onViewReport={() => router.push('/candidate/report')}
            onRetake={() => router.push('/candidate/interview/setup')}
          />
      */}
      <InterviewStatusCard missingFields={[]} interviewTaken={false} />
    </div>
  );
}
