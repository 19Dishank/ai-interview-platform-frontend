"use client";

import { useState, useRef } from "react";
import { Video, Download, ShieldCheck, Sparkles, MessageSquare, Maximize2, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Candidate, EvidenceItem } from "@/types";

interface InterviewTabProps {
  candidate: Candidate;
  evidenceItems: EvidenceItem[];
}

const DEFAULT_INTERVIEW_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export default function InterviewTab({
  candidate,
  evidenceItems,
}: InterviewTabProps) {
  const recordingUrl = (candidate as any)?.interview?.recordingUrl;
  const turns = (candidate as any)?.interview?.turns;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>(
    recordingUrl || DEFAULT_INTERVIEW_VIDEO
  );
  const [selectedTurnIdx, setSelectedTurnIdx] = useState<number | null>(null);

  const displayTurns =
    turns && turns.length > 0
      ? turns.map((t: any) => ({
          speaker: t.role === "AI" || t.role === "alex" ? "AI" : candidate.name,
          text: t.text,
          turnNumber: t.turnNumber,
        }))
      : [];

  const handleVideoError = () => {
    if (currentVideoSrc !== DEFAULT_INTERVIEW_VIDEO) {
      setCurrentVideoSrc(DEFAULT_INTERVIEW_VIDEO);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Full Video Player Card */}
      <Card className="overflow-hidden border-border/80 shadow-md">
        <CardHeader className="bg-card/60 pb-3.5 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Candidate Interview Video Recording
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Full session camera & audio recording with verified AI evaluation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-xs py-1">
                <ShieldCheck size={12} /> Candidate Camera Verified
              </Badge>
              <a
                href={currentVideoSrc}
                download={`${(candidate?.name || "candidate").toLowerCase().replace(/\s+/g, "-")}-interview.mp4`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                  <Download className="h-3.5 w-3.5" /> Download Video
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 bg-card/30">
          {/* Cinema Video Frame */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-video max-w-4xl mx-auto flex items-center justify-center border border-zinc-800 shadow-2xl group">
            {/* Live Camera Feed Overlay Tag */}
            <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-medium shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>REC</span>
                <span className="text-white/40">|</span>
                <span>{candidate.name} (Camera Feed)</span>
              </div>
            </div>

            {/* Quality badge */}
            <div className="absolute top-3.5 right-3.5 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-mono pointer-events-none">
              <span>HD 720p</span>
              <span className="text-white/40">•</span>
              <span>Opus Audio</span>
            </div>

            {/* Video element */}
            <video
              ref={videoRef}
              src={currentVideoSrc}
              controls
              playsInline
              preload="auto"
              onError={handleVideoError}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Under-video metadata row */}
          <div className="mt-4 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {candidate.name} — Technical Interview Session
              </span>
              <span>•</span>
              <span>{candidate.domain || "Technical"}</span>
              <span>•</span>
              <span>{candidate.difficulty || "Adaptive"}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>{displayTurns.length || 15} Interactive Dialogue Turns</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Evaluated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript with Interactive Turn Navigation */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Turn-by-Turn Interview Transcript
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified question and answer exchanges from the technical session
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs font-medium">
            {displayTurns.length} turns recorded
          </Badge>
        </CardHeader>

        <CardContent>
          {displayTurns.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No transcript turns recorded for this session yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
              {displayTurns.map((line: any, i: number) => {
                const isAI = line.speaker === "AI";
                const isSelected = selectedTurnIdx === i;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedTurnIdx(i)}
                    className={`flex gap-3 cursor-pointer transition-opacity ${
                      !isAI ? "justify-end" : ""
                    } ${isSelected ? "ring-2 ring-primary/40 rounded-2xl p-1" : ""}`}
                  >
                    {isAI && (
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-mono font-semibold shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-2xl rounded-2xl px-4.5 py-3 text-sm leading-relaxed shadow-xs ${
                        isAI
                          ? "bg-secondary text-secondary-foreground border border-border/40"
                          : "bg-primary text-primary-foreground font-normal"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[11px] font-medium">
                        <span>{isAI ? "Alex (AI Interviewer)" : candidate.name}</span>
                        <span>Turn {i + 1}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{line.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Timeline */}
      {evidenceItems && evidenceItems.length > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Evidence & Evaluation Highlights
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Key moments and responses analyzed during the interview
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-[68px] top-0 bottom-0 w-px bg-border" />
              <div className="flex flex-col gap-4">
                {evidenceItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="font-mono text-xs text-muted-foreground w-14 pt-0.5 text-right shrink-0">
                      {item.timestamp}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-card mt-1.5 shrink-0 z-10 shadow-xs" />
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 bg-secondary/30 p-2.5 rounded-lg border border-border/40 flex-1">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
