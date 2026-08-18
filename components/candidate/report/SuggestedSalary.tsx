import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SuggestedSalaryProps {
  candidate: any;
  suggestedSalary?: {
    formatted?: string;
    min?: number;
    max?: number;
  };
}

export default function SuggestedSalary({ candidate, suggestedSalary }: SuggestedSalaryProps) {
  const displaySalary =
    suggestedSalary?.formatted ||
    (candidate?.salaryExpectation ? `₹${candidate.salaryExpectation}` : "₹24–32 LPA");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Suggested market range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-display text-3xl font-semibold mb-1">
              {displaySalary}
            </div>
            <p className="text-sm text-muted-foreground">
              Estimated range based on assessed skill level, seniority, and
              current market data for {candidate?.technology || candidate?.title || "Software"} engineers in{" "}
              {(candidate?.location || "India").split(",")[0]}.
            </p>
          </div>
          <Badge
            variant="outline"
            className="self-start sm:self-center text-xs"
          >
            Candidate expectation: {candidate?.salaryExpectation || "Market standard"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
