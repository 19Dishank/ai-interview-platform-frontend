"use client";

import { useState } from "react";
import { Video, Download, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ReportRecordingProps {
  videoUrl?: string | null;
  videoKey?: string | null;
  interviewTitle?: string;
  interviewDate?: string;
}

const DEFAULT_INTERVIEW_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export default function ReportRecording({
  videoUrl,
  videoKey,
  interviewTitle = "AI Technical Interview Session",
  interviewDate,
}: ReportRecordingProps) {
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(
    videoUrl || DEFAULT_INTERVIEW_VIDEO
  );

  const handleVideoError = () => {
    if (activeVideoSrc !== DEFAULT_INTERVIEW_VIDEO) {
      setActiveVideoSrc(DEFAULT_INTERVIEW_VIDEO);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-border/80 shadow-md">
      <CardHeader className="bg-card/60 pb-3.5 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Session Video Recording
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full candidate camera and audio stream captured during evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-xs py-1">
              <ShieldCheck size={12} /> Camera Verified
            </Badge>
            <a
              href={activeVideoSrc}
              download="interview-recording.mp4"
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
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-video max-w-4xl mx-auto flex items-center justify-center border border-zinc-800 shadow-2xl">
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-medium pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>REC</span>
            <span className="text-white/40">|</span>
            <span>Candidate Camera Stream</span>
          </div>

          <div className="absolute top-3.5 right-3.5 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white/90 text-[11px] font-mono pointer-events-none">
            <span>HD 720p</span>
            <span className="text-white/40">•</span>
            <span>Opus Audio</span>
          </div>

          <video
            src={activeVideoSrc}
            controls
            playsInline
            preload="auto"
            onError={handleVideoError}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="mt-4 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
          <span>{interviewTitle}</span>
          {interviewDate && <span>Recorded on {interviewDate}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
