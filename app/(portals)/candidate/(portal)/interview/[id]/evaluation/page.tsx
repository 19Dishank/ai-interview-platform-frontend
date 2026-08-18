"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Video,
  Download,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Code2,
  Bot,
  User,
  Copy,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import {
  fetchInterviewEvaluation,
  fetchInterviewRecording,
  fetchInterviewTranscript,
} from "@/services/interview/interview.services";
import type {
  InterviewEvaluation,
  InterviewRecording,
  InterviewTranscript,
  HiringRecommendation,
} from "@/types/interview.types";

export default function CandidateEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [recording, setRecording] = useState<InterviewRecording | null>(null);
  const [transcript, setTranscript] = useState<InterviewTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadData(retryCount = 0) {
      setLoading(true);
      setError(null);

      try {
        const evalResult = await fetchInterviewEvaluation(id);
        if (isMounted && evalResult) {
          setEvaluation(evalResult);
        }
      } catch (err) {
        console.error("Failed to load evaluation data (attempt " + (retryCount + 1) + "):", err);
        if (retryCount < 2 && isMounted) {
          setTimeout(() => {
            if (isMounted) loadData(retryCount + 1);
          }, 1500);
          return;
        }
        if (isMounted) setError("Could not load evaluation report. The AI evaluator may still be finalizing results.");
      }

      try {
        const recResult = await fetchInterviewRecording(id);
        if (isMounted && recResult?.downloadUrl) {
          setRecording(recResult);
        } else if (isMounted && retryCount < 4) {
          setTimeout(() => {
            if (isMounted) loadData(retryCount + 1);
          }, 2000);
        }
      } catch (recErr) {
        console.warn("Recording fetch note:", recErr);
      }

      try {
        const transResult = await fetchInterviewTranscript(id);
        if (isMounted && transResult) {
          setTranscript(transResult);
        }
      } catch (transErr) {
        console.warn("Transcript fetch note:", transErr);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getRecommendationBadge = (rec?: HiringRecommendation) => {
    switch (rec) {
      case "STRONG_YES":
        return {
          label: "Strong Yes — Highly Recommended",
          className:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
      case "YES":
        return {
          label: "Yes — Recommended",
          className:
            "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
        };
      case "MAYBE":
        return {
          label: "Maybe — Further Evaluation Needed",
          className:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        };
      case "NO":
        return {
          label: "No — Not Recommended",
          className:
            "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
        };
      case "STRONG_NO":
        return {
          label: "Strong No — Strongly Not Recommended",
          className:
            "bg-red-950/40 text-red-400 border-red-800/40",
        };
      default:
        return {
          label: "Evaluation Pending",
          className:
            "bg-secondary text-secondary-foreground border-border",
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Finalizing and loading evaluation report...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Unable to display report</h2>
        <p className="text-muted-foreground text-sm">
          {error ?? "Report data is currently unavailable."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/candidate/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const badge = getRecommendationBadge(evaluation.hiringRecommendation);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/candidate/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Interview Evaluation Report
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Target Role: <span className="text-foreground font-medium">{evaluation.targetRole || evaluation.type}</span>
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${badge.className}`}
          >
            <Award className="h-4 w-4 mr-2" />
            {badge.label}
          </span>
        </div>
      </div>

      {/* Score Grid (4 metric cards) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Score</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-display text-primary">
            {evaluation.overallScore ?? 0}
            <span className="text-sm text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, evaluation.overallScore ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Technical Score */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Technical</span>
            <Code2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {evaluation.technicalScore ?? 0}
            <span className="text-sm text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, evaluation.technicalScore ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Communication Score */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Communication</span>
            <MessageSquare className="h-4 w-4 text-teal-500" />
          </div>
          <div className="text-3xl font-bold font-display text-teal-600 dark:text-teal-400">
            {evaluation.communicationScore ?? 0}
            <span className="text-sm text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, evaluation.communicationScore ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Problem Solving Score */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Problem Solving</span>
            <Brain className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
            {evaluation.problemSolvingScore ?? 0}
            <span className="text-sm text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, evaluation.problemSolvingScore ?? 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-accent" /> Evaluation Summary
        </div>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {evaluation.evaluationSummary || "No summary provided."}
        </p>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-base">
            <CheckCircle2 className="h-5 w-5" /> Key Strengths
          </div>
          {evaluation.strengths && evaluation.strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {evaluation.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No specific strengths documented.</p>
          )}
        </div>

        {/* Areas for Growth / Weaknesses */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-base">
            <AlertCircle className="h-5 w-5" /> Areas for Growth
          </div>
          {evaluation.weaknesses && evaluation.weaknesses.length > 0 ? (
            <ul className="space-y-2.5">
              {evaluation.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No specific growth areas documented.</p>
          )}
        </div>
      </div>

      {/* Session Recording Player or Download Action */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-base">
            <Video className="h-5 w-5 text-primary" /> Session Video Recording
          </div>
          {recording?.downloadUrl && (
            <a
              href={recording.downloadUrl}
              download="interview-recording.webm"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="h-4 w-4" /> Download WebM
              </Button>
            </a>
          )}
        </div>

        {recording?.downloadUrl ? (
          <div className="rounded-lg overflow-hidden bg-zinc-950 aspect-video max-w-3xl mx-auto flex flex-col items-center justify-center border border-border/60 relative">
            <video
              key={recording.downloadUrl}
              src={recording.downloadUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="p-8 text-center bg-secondary/50 rounded-lg border border-border text-sm text-muted-foreground">
            Video recording stream playback is currently processing or unavailable. You can review the full dialogue in the transcript below.
          </div>
        )}
      </div>

      {/* Full Interview Transcript */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-base">
            <MessageSquare className="h-5 w-5 text-primary" /> Interview Transcript
            {transcript?.turns && transcript.turns.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                ({transcript.turns.length} turns recorded)
              </span>
            )}
          </div>
          {transcript?.turns && transcript.turns.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => {
                const text = transcript.turns
                  .map((t) => `[${t.role === "AI" ? "Alex (AI Interviewer)" : "Candidate"}]: ${t.text}`)
                  .join("\n\n");
                navigator.clipboard?.writeText(text);
                alert("Transcript copied to clipboard!");
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy Full Transcript
            </Button>
          )}
        </div>

        {transcript?.turns && transcript.turns.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {transcript.turns.map((turn, idx) => {
              const isAi = turn.role === "AI";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      isAi
                        ? "bg-secondary text-secondary-foreground rounded-tl-none border border-border/50"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs opacity-75">
                      <span className="font-semibold">{isAi ? "Alex (AI Interviewer)" : "You (Candidate)"}</span>
                      {turn.turnNumber && <span>Turn #{turn.turnNumber}</span>}
                    </div>
                    <p className="whitespace-pre-wrap">{turn.text}</p>
                  </div>
                  {!isAi && (
                    <div className="p-2 rounded-full bg-secondary text-secondary-foreground shrink-0 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-secondary/30 rounded-lg border border-border text-sm text-muted-foreground">
            No transcript turns found for this session.
          </div>
        )}
      </div>
    </div>
  );
}
