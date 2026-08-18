"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, ChevronRight, Briefcase, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Candidate } from "@/types";

interface CandidateListProps {
  candidates: Candidate[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  const router = useRouter();

  const getScoreColor = (score: number) => {
    if (score >= 88) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 75) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  };

  return (
    <div className="flex flex-col gap-3">
      {candidates.map((c) => {
        const scoreStyle = getScoreColor(c.overallScore);

        return (
          <Card
            key={c.id}
            className="border-border/80 hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer group bg-card/90 backdrop-blur-sm"
            onClick={() => router.push(`/recruiter/candidate/${c.id}`)}
          >
            <CardContent className="py-4 px-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Avatar & Candidate Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border/80 shadow-xs"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-medium">
                        {c.domain || "Full Stack"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {c.level || "Mid"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{c.title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} /> {c.experience}y
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {c.location}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                      {c.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary/50 text-muted-foreground rounded-md">
                          +{c.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Salary & Notice */}
                <div className="hidden lg:flex flex-col items-start gap-1 px-4 border-l border-border/50 text-xs shrink-0 min-w-[140px]">
                  <span className="font-mono font-semibold text-foreground">
                    {c.salaryExpectation}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={11} /> {c.noticePeriod}
                  </span>
                </div>

                {/* Right: Scores & Action */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-sm ${scoreStyle}`}>
                        {c.overallScore}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Overall</div>
                    </div>

                    <div className="hidden sm:block text-center border-l border-border/50 pl-3">
                      <div className="font-mono font-bold text-xs text-foreground">
                        {c.technicalScore ?? c.overallScore}%
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Tech</div>
                    </div>

                    <div className="hidden sm:block text-center border-l border-border/50 pl-3">
                      <div className="font-mono font-bold text-xs text-foreground">
                        {c.communicationScore ?? c.overallScore}%
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Comms</div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                    <span className="hidden sm:inline">View</span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
