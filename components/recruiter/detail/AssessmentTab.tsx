import { Star, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreRing";
import { Candidate } from "@/types";

interface AssessmentTabProps {
  candidate: Candidate;
  technicalSkills: { label: string; score: number }[];
}

export default function AssessmentTab({
  candidate,
  technicalSkills,
}: AssessmentTabProps) {
  const strengths = candidate?.strengths || [];
  const weaknesses = candidate?.weaknesses || [];
  const skills = technicalSkills && technicalSkills.length > 0 ? technicalSkills : [
    { label: "Core domain knowledge", score: candidate?.technicalScore || 0 },
    { label: "Problem-solving approach", score: candidate?.overallScore || 0 },
    { label: "Code quality & patterns", score: Math.round((candidate?.technicalScore || 0) * 0.95) },
    { label: "System design awareness", score: Math.round((candidate?.technicalScore || 0) * 0.9) },
    { label: "Communication & Clarity", score: candidate?.communicationScore || 0 },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Technical Evaluation Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {skills.map((s) => (
            <ScoreBar key={s.label} label={s.label} score={s.score} />
          ))}
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star size={16} className="text-success" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground/80 italic">
                No notable strengths demonstrated during this evaluation session.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-accent" /> Growth Areas & Shortcomings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {weaknesses.map((w) => (
                  <li key={w} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground/80 italic">
                No critical shortcomings identified.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Evaluation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {candidate?.summary ||
                "Demonstrated solid technical competence and clear communication throughout the verified AI interview session."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
