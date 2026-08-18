"use client";

import { Link2, Globe, Code, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CandidateProfileForm } from "@/types/profile.types";
import { useFormContext, useWatch } from "react-hook-form";

export default function ConnectProfilesForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const githubValue = useWatch({ control, name: "links.github" });
  const githubUsernameValue = useWatch({ control, name: "links.githubUsername" });
  const connectedGitHub = githubUsernameValue || githubValue;

  const handleConnectGitHub = () => {
    // Open GitHub OAuth in a new tab for optimal UX
    window.open("/api/github/connect", "_blank");
  };

  const cleanUsername = connectedGitHub
    ? connectedGitHub.replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "")
    : "";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">
        Connect your profiles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Connect Section */}
        <div className="flex flex-col gap-2 p-4 border border-border rounded-lg bg-card justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 font-medium text-sm">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub Profile
              </div>
              {connectedGitHub && (
                <span className="text-xs bg-emerald-500/10 text-emerald-500 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Connected
                </span>
              )}
            </div>
          </div>

          {connectedGitHub ? (
            <div className="flex flex-col gap-1 py-2 px-3 bg-secondary/50 rounded-md border border-border/50">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <CheckCircle2 size={14} /> GitHub Connected
              </div>
              <p className="text-sm font-medium text-foreground">
                Username: <span className="font-mono text-muted-foreground">{cleanUsername}</span>
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-1">
                Connect your GitHub account to verify your repositories and code contributions.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
                onClick={handleConnectGitHub}
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Connect GitHub
              </Button>
            </>
          )}
        </div>

        {/* LinkedIn Profile Input */}
        <div className="flex flex-col gap-1.5 p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Link2 size={18} className="text-primary" /> LinkedIn Profile URL
          </div>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/username"
            error={
              (errors.links?.linkedin?.message ||
                errors.links?.linkedinUrl?.message) as string
            }
            {...register("links.linkedin")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Code size={18} className="text-muted-foreground" /> LeetCode Username
          </div>
          <Input
            placeholder="e.g. leetcode_username"
            error={errors.links?.leetcodeUsername?.message as string}
            {...register("links.leetcodeUsername")}
          />
        </div>

        <div className="flex flex-col gap-1.5 p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Globe size={18} className="text-muted-foreground" /> Portfolio / Website
          </div>
          <Input
            type="url"
            placeholder="https://yourwebsite.dev"
            error={
              (errors.links?.portfolio?.message ||
                errors.links?.portfolioUrl?.message) as string
            }
            {...register("links.portfolio")}
          />
        </div>
      </div>
    </div>
  );
}
