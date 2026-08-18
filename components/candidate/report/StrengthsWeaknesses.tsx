import { Star, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface StrengthsWeaknessesProps {
  strengths?: string[] | Array<{ label: string; note?: string }>;
  weaknesses?: string[] | Array<{ label: string; note?: string }>;
}

const defaultStrengths = [
  {
    label: "System design & architecture",
    note: "Consistently proposed layered, scalable solutions with appropriate trade-off reasoning.",
  },
  {
    label: "React performance optimisation",
    note: "Deep knowledge of memoisation, lazy loading, and render scheduling.",
  },
  {
    label: "Code quality thinking",
    note: "Unprompted discussion of testability, readability, and error boundaries.",
  },
  {
    label: "Technical communication",
    note: "Used precise vocabulary; analogies were accurate rather than oversimplified.",
  },
];

const defaultWeaknesses = [
  {
    label: "Backend & systems knowledge",
    note: "Solid awareness but limited depth on database internals and distributed trade-offs.",
  },
  {
    label: "Test coverage discipline",
    note: "Acknowledged test importance but rarely led with test strategy in solutions.",
  },
  {
    label: "Handling ambiguous requirements",
    note: "Occasionally moved to implementation before fully exploring problem constraints.",
  },
];

export default function StrengthsWeaknesses({
  strengths = [],
  weaknesses = [],
}: StrengthsWeaknessesProps) {
  const normStrengths = (strengths || []).map((s) =>
    typeof s === "string" ? { label: s, note: "" } : s
  );
  const normWeaknesses = (weaknesses || []).map((w) =>
    typeof w === "string" ? { label: w, note: "" } : w
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={16} className="text-success" /> Demonstrated Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          {normStrengths.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {normStrengths.map((s, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{s.label}</div>
                    {s.note && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.note}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground/80 italic py-2">
              No key technical strengths were demonstrated during this interview session.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent" /> Areas for Growth & Shortcomings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {normWeaknesses.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {normWeaknesses.map((w, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{w.label}</div>
                    {w.note && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {w.note}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground/80 italic py-2">
              No critical growth shortcomings flagged.
            </p>
          )}
          <div className="mt-4 p-3 bg-accent/8 border border-accent/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              These are objective observations produced from rigorous evaluation of the candidate&apos;s responses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
