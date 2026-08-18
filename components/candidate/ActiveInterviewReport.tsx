"use client";

import { useRouter } from "next/navigation";
import { FileText, ChevronRight, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface ActiveInterviewReportProps {
  latestInterview: any;
  isValid: boolean;
}

export default function ActiveInterviewReport({
  latestInterview,
  isValid,
}: ActiveInterviewReportProps) {
  const router = useRouter();

  if (!latestInterview) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Active interview report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-secondary/30 text-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <PlayCircle size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-base">No verified interview yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Take an AI interview to get your verified talent credential and be discovered by hiring teams.
              </p>
            </div>
            <Button onClick={() => router.push("/candidate/interview-setup")} size="sm">
              <PlayCircle size={14} className="mr-1.5" /> Start your first interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallScore = Math.round(latestInterview.overallScore ?? latestInterview.score ?? 0);
  const technicalScore = Math.round(latestInterview.technicalScore ?? overallScore);
  const communicationScore = Math.round(latestInterview.communicationScore ?? overallScore);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Active interview report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/40 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {latestInterview.domain || "TECHNICAL"} · {latestInterview.technology || latestInterview.targetRole || "Full Stack Engineer"}
              </span>
              <Badge variant={isValid ? "success" : "destructive"}>
                {isValid
                  ? `Valid until ${formatDate(latestInterview.validUntil || "2027-01-08")}`
                  : "Expired"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Level: {latestInterview.level || "ADAPTIVE"}</span>
              <span>Difficulty: {latestInterview.difficulty || "ADAPTIVE"}</span>
              <span>Score: {overallScore}/100</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (latestInterview.id && latestInterview.id.length > 5) {
                  router.push(`/candidate/report?interviewId=${latestInterview.id}`);
                } else {
                  router.push("/candidate/report");
                }
              }}
            >
              <FileText size={14} /> View report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Technical", score: technicalScore, max: 100 },
            { label: "Communication", score: communicationScore, max: 100 },
            { label: "Overall", score: overallScore, max: 100 },
          ].map((s) => {
            const color =
              s.score >= 85
                ? "var(--success)"
                : s.score >= 65
                  ? "var(--primary)"
                  : "var(--accent)";
            return (
              <div key={s.label} className="text-center">
                <div
                  className="font-mono text-xl font-semibold mb-1"
                  style={{ color }}
                >
                  {s.score}
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.score}%`, backgroundColor: color }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/candidate/history")}
          className="flex items-center justify-between w-full mt-4 pt-4 border-t border-border text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>View all interview history</span>
          <ChevronRight size={16} />
        </button>
      </CardContent>
    </Card>
  );
}
