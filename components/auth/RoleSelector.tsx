"use client";

import { ArrowRight, Briefcase, User } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

type Role = "candidate" | "recruiter";

interface RoleSelectorProps {
  role: Role;
  setRole: (role: Role) => void;
  onContinue: () => void;
}

const RoleSelector = ({ role, setRole, onContinue }: RoleSelectorProps) => {
  return (
    <div>
      {/* Neutral heading — this same screen handles both new and returning
          users, so it no longer says "Create your account" */}
      <h1 className="font-display text-2xl font-semibold text-center mb-2">
        Continue to Verquo
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8">
        Tell us how you use Verquo. If you already have an account, we&apos;ll
        take you straight to it.
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
              {r === "candidate" ? <User size={22} /> : <Briefcase size={22} />}
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
        onClick={onContinue}
      >
        Continue as {role} <ArrowRight size={16} />
      </Button>
      {/* No "already have an account? Sign in" link — this page already
          handles sign-in for existing accounts, nothing to redirect to. */}
    </div>
  );
};

export default RoleSelector;
