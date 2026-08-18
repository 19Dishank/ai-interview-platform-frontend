"use client";

import { useState } from "react";
import { Shield, Calendar, Clock, Mic2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface ReportHeaderProps {
  candidate: any;
}

export default function ReportHeader({ candidate }: ReportHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const scoreColor = (score: number) =>
    score >= 85
      ? "var(--success)"
      : score >= 65
        ? "var(--primary)"
        : "var(--accent)";

  const initial = (candidate?.name || "Candidate").charAt(0).toUpperCase();
  const showPhoto = candidate?.photo && !imageError;

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {showPhoto ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-border shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {candidate.name}
                </h2>
                <p className="text-muted-foreground">
                  {candidate.title || "Software Engineer"} · {candidate.experience || 2} years experience
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="success">
                    <Shield size={11} /> Verified
                  </Badge>
                  <Badge variant="outline">
                    {candidate.domain || "Technical"} · {candidate.technology || candidate.title}
                  </Badge>
                  <Badge variant="outline">{candidate.level || "Mid"}</Badge>
                  <Badge variant="warning">{candidate.difficulty || "Adaptive"}</Badge>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                {[
                  { label: "Overall", score: candidate.overallScore ?? 87 },
                  { label: "Technical", score: candidate.technicalScore ?? 91 },
                  {
                    label: "Communication",
                    score: candidate.communicationScore ?? 82,
                  },
                ].map(({ label, score }) => (
                  <div key={label} className="text-center">
                    <div
                      className="font-mono text-2xl font-semibold"
                      style={{ color: scoreColor(score) }}
                    >
                      {score}
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Interviewed{" "}
                {formatDate(candidate.interviewDate || new Date().toISOString())}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Valid until{" "}
                {formatDate(candidate.validUntil || "2027-02-10")}
              </span>
              <span className="flex items-center gap-1">
                <Mic2 size={12} /> ~45 minutes · {candidate.difficulty || "Adaptive"}{" "}
                difficulty
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
