"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Mic,
  Send,
  Square,
  Sparkles,
  CheckCircle2,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  ScreenShare,
} from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { startInterviewSchema } from "@/lib/validations/interview";
import { useAIInterview } from "@/hooks/use-ai-interview";
import type { StartInterviewForm } from "@/types/interview.types";
import { AIAvatar } from "@/components/candidate/AIAvatar";

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") as StartInterviewForm["type"] | null;
  const queryDiff = searchParams.get("difficulty") as StartInterviewForm["difficulty"] | null;
  const queryRole = searchParams.get("targetRole");
  const autoStart = searchParams.get("autoStart") === "true";

  const [inputText, setInputText] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const autoStartedRef = useRef(false);

  const {
    status,
    sessionId,
    transcript,
    stream,
    mediaWarning,
    isScreenSharing,
    toggleScreenShare,
    isLiveMode,
    alexSpeaking,
    startInterview,
    sendAnswer,
    endInterview,
  } = useAIInterview();

  const lastTurn = transcript[transcript.length - 1];
  const isAISpeaking = isLiveMode
    ? alexSpeaking
    : status === "CONNECTED" && (!lastTurn || lastTurn.role === "AI");

  const initialValues: StartInterviewForm = {
    type: queryType || "TECHNICAL",
    difficulty: queryDiff || "HARD",
    targetRole: queryRole || "Senior React Engineer",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StartInterviewForm>({
    resolver: zodResolver(startInterviewSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (queryType) setValue("type", queryType);
    if (queryDiff) setValue("difficulty", queryDiff);
    if (queryRole) setValue("targetRole", queryRole);
  }, [queryType, queryDiff, queryRole, setValue]);

  // Handle auto-start from interview-setup configuration
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && status === "IDLE") {
      autoStartedRef.current = true;
      startInterview(initialValues);
    }
  }, [autoStart, status, startInterview, initialValues]);

  const onSubmit = async (data: StartInterviewForm) => {
    await startInterview(data);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendAnswer(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Bind video element to media stream when active
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, status]);

  // Auto scroll transcript to latest turn
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header with Title, Subtitle, and End Interview Action Button */}
      <PageHeader
        title="AI Interview Session"
        subtitle="Simulate an interactive technical interview with real-time AI feedback"
        action={
          status === "CONNECTING" ||
          status === "CONNECTED" ||
          status === "RECONNECTING" ||
          status === "ENDED" ? (
            <Button
              variant="destructive"
              size="md"
              disabled={
                status === "CONNECTING" ||
                status === "RECONNECTING" ||
                status === "ENDED"
              }
              onClick={endInterview}
              className="gap-1.5 shadow-sm"
            >
              <Square className="h-3.5 w-3.5 fill-current" /> End Interview
            </Button>
          ) : null
        }
      />

      {/* Step 1: Configuration / Setup Form */}
      {status === "IDLE" && (
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                Configure Interview Parameters
              </h2>
              <p className="text-sm text-muted-foreground">
                Select your interview focus, difficulty level, and target job title
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Interview Type
                </label>
                <select
                  {...register("type")}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="TECHNICAL">Technical Deep-Dive</option>
                  <option value="BEHAVIORAL">Behavioral & Cultural</option>
                  <option value="SYSTEM_DESIGN">System Design & Architecture</option>
                  <option value="FULL_STACK">Full-Stack Application</option>
                  <option value="DSA">Data Structures & Algorithms</option>
                </select>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              {/* Difficulty Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Difficulty Level
                </label>
                <select
                  {...register("difficulty")}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ADAPTIVE">Adaptive (Recommended)</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                {errors.difficulty && (
                  <p className="text-xs text-destructive">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>
            </div>

            {/* Target Role Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Target Job Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer, React Specialist"
                {...register("targetRole")}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.targetRole && (
                <p className="text-xs text-destructive">
                  {errors.targetRole.message}
                </p>
              )}
            </div>

            {/* Device readiness check notice */}
            <div className="rounded-lg bg-secondary/50 p-4 border border-border/50 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>
                Starting the session will request temporary access to your camera
                and microphone for live streaming and automated evaluation.
              </span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto gap-2">
                <Sparkles className="h-4 w-4" /> Start Interview Session
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Live Interview Interface */}
      {(status === "CONNECTING" ||
        status === "CONNECTED" ||
        status === "RECONNECTING" ||
        status === "ENDED") && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Camera Preview + AI Avatar below video */}
          <div className="lg:col-span-5 space-y-4">
            {/* Candidate Camera Preview */}
            <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-sm aspect-video flex items-center justify-center bg-zinc-900 text-zinc-100">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur border border-border flex items-center gap-2">
                {status === "CONNECTING" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-amber-500">Connecting WS...</span>
                  </>
                )}
                {status === "RECONNECTING" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-amber-500">Reconnecting WS...</span>
                  </>
                )}
                {status === "CONNECTED" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500">Live Recording</span>
                  </>
                )}
                {status === "ENDED" && (
                  <>
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    <span className="text-zinc-400">Processing Session...</span>
                  </>
                )}
              </div>

              {/* Media Warning Notice if Camera is locked */}
              {mediaWarning && (
                <div className="absolute top-3 right-3 max-w-[240px] px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur shadow-sm">
                  {mediaWarning}
                </div>
              )}

              {/* Camera / Mic / Screen Share Icons */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleScreenShare}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium backdrop-blur transition-colors ${
                    isScreenSharing
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-black/60 text-white/90 hover:bg-black/80"
                  }`}
                  title={isScreenSharing ? "Switch back to camera" : "Share / Record Screen"}
                >
                  <ScreenShare className="h-3.5 w-3.5" />
                  <span>{isScreenSharing ? "Screen Active" : "Share Screen"}</span>
                </button>
                <div className="p-1.5 rounded-md bg-black/60 text-white/90">
                  <Video className="h-3.5 w-3.5" />
                </div>
                <div className="p-1.5 rounded-md bg-black/60 text-white/90">
                  <Mic className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Rectangular AI Avatar Card */}
            <AIAvatar
              status={status}
              isAISpeaking={isAISpeaking}
              aiName="Alex"
              aiRole={isLiveMode ? "Verquo AI — Gemini Live" : "Verquo AI Lead Evaluator"}
            />
          </div>

          {/* Right Column: Live Transcript & Candidate Response Input */}
          <div className="lg:col-span-7 flex flex-col h-[520px] bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4 text-primary" /> Live AI Interview Log
                {isLiveMode && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="h-2.5 w-2.5" /> Gemini Live
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {transcript.length} turns recorded
              </span>
            </div>

            {/* Transcript Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Bot className="h-8 w-8 mb-2 opacity-50 animate-bounce text-primary" />
                  <p className="text-sm font-medium">
                    {status === "CONNECTING"
                      ? "Connecting to AI Interviewer..."
                      : "AI Interviewer Connected"}
                  </p>
                  <p className="text-xs mt-1">
                    {status === "CONNECTING"
                      ? "Establishing secure WebSocket connection..."
                      : isLiveMode
                      ? "Gemini Live is active — just speak naturally. Alex will respond in real-time."
                      : "Speak or type your response below to begin."}
                  </p>
                </div>
              ) : (
                transcript.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      turn.role === "CANDIDATE" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {turn.role === "AI" && (
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                        turn.role === "CANDIDATE"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-secondary text-secondary-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{turn.text}</p>
                    </div>
                    {turn.role === "CANDIDATE" && (
                      <div className="p-1.5 rounded-full bg-secondary text-secondary-foreground shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-background flex items-center gap-2">
              {isLiveMode && status === "CONNECTED" && (
                <div
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    alexSpeaking
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  }`}
                  title={alexSpeaking ? "Alex is speaking" : "Your mic is live — speak naturally"}
                >
                  <Mic className={`h-3 w-3 ${alexSpeaking ? "opacity-40" : "animate-pulse"}`} />
                  {alexSpeaking ? "Listening..." : "Mic Live"}
                </div>
              )}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== "CONNECTED"}
                placeholder={
                  status !== "CONNECTED"
                    ? "Waiting for connection..."
                    : isLiveMode
                    ? "Or type a response to send as text..."
                    : "Type your response here..."
                }
                className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <Button
                size="md"
                disabled={status !== "CONNECTED" || !inputText.trim()}
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Completed Screen */}
      {status === "COMPLETED" && (
        <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              Interview Complete & Evaluated!
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Your audio, video stream, and responses have been analyzed. Your detailed AI evaluation report is ready.
            </p>
          </div>

          {sessionId && (
            <div className="pt-2">
              <Link href={`/candidate/interview/${sessionId}/evaluation`}>
                <Button size="lg" className="gap-2">
                  View Evaluation Report <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CandidateInterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewSessionContent />
    </Suspense>
  );
}
