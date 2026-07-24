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
};

const Stepper = ({ step, setStep, steps }: StepperPropsType) => {
  const progress = ((step + 1) / steps.length) * 100;
  return (
    <>
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
              {steps.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => i <= step && setStep(i)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors cursor-pointer",
                    i === step
                      ? "bg-primary/10 border border-primary/30"
                      : i < step
                        ? "hover:bg-secondary"
                        : "cursor-default opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 text-xs font-mono",
                      i === step
                        ? "bg-primary text-primary-foreground"
                        : i < step
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i < step ? (
                      <Check size={15} className="text-white" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        i === step ? "text-primary" : "",
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live preview card - fills the remaining left column space */}
        {/* <Card className="hidden lg:block">
          <CardContent className="py-5 px-4 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
              <User size={24} className="text-muted-foreground" />
            </div>
            <div>
              <div className="font-display font-semibold text-sm">
                Arjun Mehta
              </div>
              <div className="text-xs text-muted-foreground">
                Senior Frontend Engineer
              </div>
            </div>
            <div className="w-full border-t border-border pt-3 flex flex-col gap-2 text-left">
              <PreviewRow label="Experience" value="6 yrs" />
              <PreviewRow label="Location" value="Bangalore" />
              <PreviewRow label="Notice period" value="30 days" />
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border w-full">
              This is how recruiters will see your card. Fill in more steps to
              complete it.
            </p>
          </CardContent>
        </Card> */}
      </div>
    </>
  );
};

export default Stepper;
