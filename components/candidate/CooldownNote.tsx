import { Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface CooldownNoteProps {
  cooldown?: {
    isEligibleForRetake?: boolean;
    retakeAvailableDate?: string | Date | null;
    daysRemaining?: number;
  };
}

export default function CooldownNote({ cooldown }: CooldownNoteProps) {
  const isEligible = cooldown?.isEligibleForRetake ?? false;
  const daysRemaining = cooldown?.daysRemaining ?? 47;

  return (
    <Card className="mt-6 border-dashed">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {isEligible ? (
            <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
          ) : (
            <Clock size={16} className="text-accent shrink-0 mt-0.5" />
          )}
          <span>
            {isEligible ? (
              <>
                <strong className="text-foreground font-medium">
                  Interview retake eligible.
                </strong>{" "}
                You can retake an interview now to update your verified report.
              </>
            ) : (
              <>
                Interview retake available in{" "}
                <strong className="text-foreground font-mono">
                  {daysRemaining} days
                </strong>
                . You can retake once every 90 days per domain/technology
                combination.
              </>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
