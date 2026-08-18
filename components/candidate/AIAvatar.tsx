"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles, BrainCircuit } from "lucide-react";
import type { InterviewStatus } from "@/types/interview.types";

interface AIAvatarProps {
  status: InterviewStatus;
  isAISpeaking?: boolean;
  aiName?: string;
  aiRole?: string;
}

export function AIAvatar({
  status,
  isAISpeaking = false,
  aiName = "Alex",
  aiRole = "Verquo AI Lead Evaluator",
}: AIAvatarProps) {
  const [waveHeights, setWaveHeights] = useState<number[]>([
    25, 45, 70, 35, 85, 50, 75, 95, 55, 80, 40, 65, 85, 30, 60, 45, 75, 35,
  ]);

  // Simulate audio waveform animation when AI is speaking or listening
  useEffect(() => {
    if (status !== "CONNECTED") return;

    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() =>
          isAISpeaking
            ? Math.floor(Math.random() * 70) + 25
            : Math.floor(Math.random() * 20) + 10
        )
      );
    }, 180);

    return () => clearInterval(interval);
  }, [status, isAISpeaking]);

  const getStatusBadge = () => {
    if (status === "CONNECTING") {
      return {
        label: "Initializing Neural Engine...",
        badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        dotClass: "bg-amber-500 animate-ping",
      };
    }
    if (status === "CONNECTED") {
      if (isAISpeaking) {
        return {
          label: "Alex is speaking...",
          badgeClass: "bg-primary/10 text-primary border-primary/30",
          dotClass: "bg-primary animate-pulse",
        };
      }
      return {
        label: "Alex is listening...",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        dotClass: "bg-emerald-500 animate-pulse",
      };
    }
    if (status === "RECONNECTING") {
      return {
        label: "Reconnecting stream...",
        badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse",
        dotClass: "bg-amber-500 animate-ping",
      };
    }
    if (status === "ENDED") {
      return {
        label: "Processing evaluation...",
        badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
        dotClass: "bg-zinc-400",
      };
    }
    return {
      label: "AI Ready",
      badgeClass: "bg-secondary text-secondary-foreground border-border",
      dotClass: "bg-muted-foreground",
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden isolate flex items-center justify-between gap-4">
      {/* Background ambient glow cleanly contained inside overflow wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl -z-10">
        <div
          className={`absolute -top-10 -left-10 w-36 h-36 rounded-full blur-3xl transition-opacity duration-700 ${
            isAISpeaking ? "bg-primary/20 opacity-100" : "bg-primary/5 opacity-40"
          }`}
        />
      </div>

      {/* Left: Avatar Ring & Core */}
      <div className="flex items-center gap-3.5 z-10 shrink-0">
        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative shrink-0 ${
            isAISpeaking
              ? "border-primary shadow-[0_0_15px_rgba(58,140,126,0.35)] scale-105"
              : status === "CONNECTED"
              ? "border-primary/40 shadow-[0_0_8px_rgba(58,140,126,0.12)]"
              : "border-border"
          }`}
        >
          {isAISpeaking && (
            <div className="absolute inset-0 rounded-full border border-accent/60 animate-ping opacity-75" />
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 via-background to-accent/15 border border-primary/30 flex items-center justify-center relative">
            <Bot className={`h-5 w-5 transition-transform duration-300 ${isAISpeaking ? "scale-110 text-accent" : "text-primary"}`} />
            <div className="absolute -top-0.5 -right-0.5 p-0.5 rounded-full bg-accent text-accent-foreground shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
          </div>
        </div>

        {/* AI Name & Role */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base text-foreground tracking-tight">
              {aiName}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BrainCircuit className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{aiRole}</span>
          </div>
        </div>
      </div>

      {/* Right: Audio Waveform Soundbars */}
      <div className="flex items-center justify-end gap-1 h-8 z-10 shrink-0 max-w-[130px] sm:max-w-[170px] w-full">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isAISpeaking
                ? "bg-primary"
                : status === "CONNECTED"
                ? "bg-primary/40"
                : "bg-muted"
            }`}
            style={{
              height: `${status === "CONNECTED" ? h : 10}%`,
              transitionDelay: `${i * 12}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
