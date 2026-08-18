"use client";

import { useRouter } from "next/navigation";
import { Star, ShieldCheck, ChevronRight, Clock, Briefcase, Sparkles, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Candidate } from "@/types";

interface CandidateGridProps {
  candidates: Candidate[];
}

export default function CandidateGrid({ candidates }: CandidateGridProps) {
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 88) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 75) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {candidates.map((c) => {
        const scoreBadgeStyle = getScoreColor(c.overallScore);
        const initial = (c.name || "Candidate").charAt(0).toUpperCase();

        return (
          <Card
            key={c.id}
            className="group relative overflow-hidden border-border/80 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-card/90 backdrop-blur-sm flex flex-col justify-between"
            onClick={() => router.push(`/recruiter/candidate/${c.id}`)}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-purple-500/40 to-blue-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardContent className="p-5 flex flex-col flex-1">
              {/* Header: Photo, Name, Score */}
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="relative shrink-0">
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-border/80 shadow-sm"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format";
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium truncate">
                    {c.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Briefcase size={11} className="shrink-0" /> {c.experience}y exp
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin size={11} className="shrink-0" /> {c.location}
                    </span>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex flex-col items-end shrink-0">
                  <div
                    className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-base flex items-center gap-1 shadow-xs ${scoreBadgeStyle}`}
                  >
                    <span>{c.overallScore}</span>
                    <span className="text-[10px] font-normal opacity-80">/100</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    AI Verified
                  </span>
                </div>
              </div>

              {/* Sub-scores Bar */}
              <div className="grid grid-cols-2 gap-2 mb-3.5 p-2 rounded-lg bg-secondary/40 border border-border/40 text-center text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
                    Technical
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {c.technicalScore ?? c.overallScore}%
                  </span>
                </div>
                <div className="border-l border-border/60">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
                    Communication
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {c.communicationScore ?? c.overallScore}%
                  </span>
                </div>
              </div>

              {/* Badges: Domain, Level, Difficulty */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20 font-medium">
                  {c.domain || "Full Stack"}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-medium">
                  {c.level || "Mid"}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
                  {c.difficulty || "Adaptive"}
                </Badge>
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground/90 mb-3.5 leading-relaxed line-clamp-2">
                {c.summary}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {c.skills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 bg-secondary/80 text-secondary-foreground rounded-md font-medium border border-border/40"
                  >
                    {s}
                  </span>
                ))}
                {c.skills.length > 4 && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-secondary/50 text-muted-foreground rounded-md">
                    +{c.skills.length - 4}
                  </span>
                )}
              </div>

              {/* Verified Key Strength or Growth Area */}
              {c.strengths && c.strengths.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-md px-2 py-1 mb-4 border border-emerald-500/10 truncate">
                  <Sparkles size={12} className="shrink-0" />
                  <span className="truncate text-[11px] font-medium">
                    {c.strengths[0]}
                  </span>
                </div>
              ) : c.weaknesses && c.weaknesses.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 rounded-md px-2 py-1 mb-4 border border-amber-500/10 truncate">
                  <span className="truncate text-[11px] font-medium">
                    Area to improve: {c.weaknesses[0]}
                  </span>
                </div>
              ) : null}

              {/* Footer: Salary, Notice & CTA */}
              <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono font-semibold text-foreground text-xs">
                    {c.salaryExpectation}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={11} /> {c.noticePeriod}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>View report</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
