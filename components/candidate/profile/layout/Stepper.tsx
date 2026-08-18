"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type StepType = {
  label: string;
  hint: string;
};

type StepperPropsType = {
  step: number;
  setStep: (step: number) => void;
  steps: StepType[];
  maxUnlockedStep?: number;
  onStepClick?: (targetStep: number) => void;
};

const Stepper = ({
  step,
  setStep,
  steps,
  maxUnlockedStep = 0,
  onStepClick,
}: StepperPropsType) => {
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
      <Card>
        <CardContent className="py-4 px-4">
          <div className="h-1 rounded-full bg-secondary mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex flex-col gap-1">
            {steps.map((s, i) => {
              const isUnlocked = i <= maxUnlockedStep;
              const isCurrent = i === step;
              const isCompleted = i < step;

              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (!isUnlocked) return;
                    if (onStepClick) {
                      onStepClick(i);
                    } else {
                      setStep(i);
                    }
                  }}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : isUnlocked
                        ? "hover:bg-secondary"
                        : "",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 text-xs font-mono",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check size={15} className="text-white" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-primary" : "",
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stepper;
