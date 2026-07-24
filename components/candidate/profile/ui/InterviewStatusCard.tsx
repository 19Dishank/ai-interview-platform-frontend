import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type InterviewStatus = "incomplete" | "ready" | "completed";

interface InterviewStatusCardProps {
  /** Names of missing profile sections, e.g. ["Skills & experience", "Education"].
   *  Passing a non-empty array forces status to "incomplete" regardless of `status`. */
  missingFields?: string[];
  /** Only relevant once profile is complete: has the candidate already taken the interview? */
  interviewTaken?: boolean;
  domain?: string;
  validUntil?: string;
  retakeAvailable?: boolean;
  onStartInterview?: () => void;
  onCompleteProfile?: () => void;
  onViewReport?: () => void;
  onRetake?: () => void;
}

const STATUS_CONFIG: Record<
  InterviewStatus,
  { icon: LucideIcon; tone: "primary" | "success" | "muted" }
> = {
  incomplete: { icon: AlertCircle, tone: "muted" },
  ready: { icon: Clock, tone: "primary" },
  completed: { icon: CheckCircle2, tone: "success" },
};

const TONE_CLASSES: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/5 border-primary/20", text: "text-primary" },
  success: { bg: "bg-success/5 border-success/20", text: "text-success" },
  muted: { bg: "bg-secondary border-border", text: "text-foreground" },
};

/**
 * Derives status from actual profile/interview data rather than an arbitrary
 * enum passed in blind:
 *   missingFields.length > 0  -> "incomplete" (not qualified for interview)
 *   interviewTaken            -> "completed"  (report already exists)
 *   otherwise                 -> "ready"      (qualified, can start)
 */
export function InterviewStatusCard({
  missingFields = [],
  interviewTaken = false,
  domain,
  validUntil,
  retakeAvailable = false,
  onStartInterview,
  onCompleteProfile,
  onViewReport,
  onRetake,
}: InterviewStatusCardProps) {
  const status: InterviewStatus =
    missingFields.length > 0
      ? "incomplete"
      : interviewTaken
        ? "completed"
        : "ready";

  const { icon: Icon, tone } = STATUS_CONFIG[status];
  const { bg, text } = TONE_CLASSES[tone];

  const title =
    status === "incomplete"
      ? "Complete your profile to unlock your interview"
      : status === "ready"
        ? "You're qualified — ready to take your interview"
        : `Your ${domain ?? ""} interview report is verified`.replace(
            "  ",
            " ",
          );

  const description =
    status === "incomplete"
      ? "Recruiters only see candidates with a complete profile. Fill in the missing sections below to qualify."
      : status === "ready"
        ? "Your profile is complete. You can start or schedule your AI interview from the dashboard."
        : `Recruiters can see this report until ${validUntil ?? "—"}. ${
            retakeAvailable
              ? "You can retake it for a fresher assessment."
              : "You can retake it once the cooldown period ends."
          }`;

  return (
    <div className={cn("p-4 border rounded-lg flex flex-col gap-3", bg)}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={cn("shrink-0 mt-0.5", text)} />
        <div className="flex-1">
          <p className={cn("text-sm font-medium mb-1", text)}>{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {status === "incomplete" && onCompleteProfile && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onCompleteProfile}
            >
              Complete profile
            </Button>
          )}
          {status === "ready" && onStartInterview && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onStartInterview}
            >
              Start now
            </Button>
          )}
          {status === "completed" && onViewReport && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onViewReport}
            >
              <FileText size={14} /> View report
            </Button>
          )}
          {status === "completed" && onRetake && retakeAvailable && (
            <Button size="sm" variant="ghost" type="button" onClick={onRetake}>
              <RotateCcw size={14} /> Retake
            </Button>
          )}
        </div>
      </div>

      {status === "incomplete" && (
        <ul className="flex flex-wrap gap-2 pl-7.5">
          {missingFields.map((field) => (
            <li
              key={field}
              className="text-xs px-2 py-1 rounded-full border border-dashed border-border text-muted-foreground"
            >
              {field}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
