"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  Shield,
  FileText,
  Award,
  Video,
  X,
  Download,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  fetchInterviewHistory,
  fetchInterviewRecording,
} from "@/services/interview/interview.services";
import type { InterviewHistoryItem } from "@/types";

interface VideoModalState {
  id: string;
  title: string;
  date: string;
  score: number;
  downloadUrl?: string | null;
  loading: boolean;
  error?: string | null;
}

export default function InterviewHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoModalState | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchInterviewHistory();
        if (isMounted && Array.isArray(data)) {
          const transformed = data.map((item: any) => ({
            id: item.id,
            domain: item.type || item.domain || "Technical",
            technology: item.targetRole || item.technology || "Software Engineering",
            level: item.difficulty === "HARD" ? "Senior" : item.difficulty === "EASY" ? "Junior" : "Mid",
            difficulty: item.difficulty ? item.difficulty.charAt(0) + item.difficulty.slice(1).toLowerCase() : "Medium",
            date: item.createdAt ? item.createdAt.split("T")[0] : item.date || "2026-07-08",
            validUntil: item.validUntil || (item.createdAt ? new Date(new Date(item.createdAt).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : "2027-01-08"),
            score: Math.round(item.overallScore ?? item.score ?? 75),
            status: (item.status || "completed").toLowerCase() as "completed" | "expired",
          }));
          setHistory(transformed);
        }
      } catch (err) {
        console.warn("Failed to load interview history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const openVideoModal = async (item: InterviewHistoryItem) => {
    setSelectedVideo({
      id: item.id,
      title: `${item.domain} · ${item.technology}`,
      date: item.date,
      score: item.score,
      loading: true,
      downloadUrl: null,
      error: null,
    });

    try {
      const rec = await fetchInterviewRecording(item.id);
      if (rec?.downloadUrl) {
        setSelectedVideo((prev) =>
          prev && prev.id === item.id
            ? { ...prev, downloadUrl: rec.downloadUrl, loading: false }
            : prev
        );
      } else {
        setSelectedVideo((prev) =>
          prev && prev.id === item.id
            ? {
                ...prev,
                loading: false,
                error:
                  "Recording stream is currently processing or was not captured for this test session.",
              }
            : prev
        );
      }
    } catch {
      setSelectedVideo((prev) =>
        prev && prev.id === item.id
          ? {
              ...prev,
              loading: false,
              error:
                "Could not load recording. The video file may still be finalizing on storage.",
            }
          : prev
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Interview history"
        subtitle="Review your previous AI interview recordings, scores, and evaluations. Recruiters see your highest active score by default."
        action={
          <Button onClick={() => router.push("/candidate/interview-setup")}>
            <PlayCircle size={16} /> Take new interview
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading interview history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 px-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <PlayCircle size={32} />
            </div>
            <div>
              <h3 className="font-semibold text-base">No interview history yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Complete your first technical interview to see your verified scores, evaluation reports, and video recordings here.
              </p>
            </div>
            <Button onClick={() => router.push("/candidate/interview-setup")} size="sm">
              <PlayCircle size={14} className="mr-1.5" /> Start your first interview
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-mono uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Interview topic</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">
                    Difficulty
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    Date taken
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    Valid until
                  </th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => {
                  const color =
                    item.score >= 85
                      ? "var(--success)"
                      : item.score >= 65
                        ? "var(--primary)"
                        : "var(--accent)";
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {item.domain} · {item.technology}
                            {idx === 0 && (
                              <Badge
                                variant="success"
                                className="text-[10px] py-0 px-1.5"
                              >
                                <Shield size={8} /> active
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono sm:hidden mt-0.5">
                            {item.difficulty} · {formatDate(item.date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {item.difficulty}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {formatDate(item.validUntil)}
                      </td>
                      <td
                        className="px-4 py-3 font-mono font-semibold"
                        style={{ color }}
                      >
                        {item.score}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            item.status === "completed" ? "success" : "outline"
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === "completed" ? (
                          <div className="flex items-center justify-end gap-3 flex-wrap">
                            <button
                              onClick={() => openVideoModal(item)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                              title="Watch interview video recording"
                            >
                              <Video size={13} /> Video
                            </button>
                            <button
                              onClick={() => router.push(`/candidate/interview/${item.id}/evaluation`)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                            >
                              <Award size={13} /> Evaluation
                            </button>
                            <button
                              onClick={() => router.push(item.id ? `/candidate/report?interviewId=${item.id}` : "/candidate/report")}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                            >
                              <FileText size={13} /> Report
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Video Interview Recording Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base leading-tight">
                    {selectedVideo.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                    <span>Taken: {formatDate(selectedVideo.date)}</span>
                    <span>·</span>
                    <span>Score: {selectedVideo.score}/100</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 bg-zinc-950 flex flex-col items-center justify-center min-h-[300px]">
              {selectedVideo.loading ? (
                <div className="flex flex-col items-center gap-3 text-zinc-400 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Fetching secure interview recording...</p>
                </div>
              ) : selectedVideo.downloadUrl ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black relative flex items-center justify-center">
                  <video
                    key={selectedVideo.downloadUrl}
                    src={selectedVideo.downloadUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="max-w-md text-center py-10 px-4 space-y-3">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h4 className="font-medium text-sm text-zinc-200">Video Recording Unavailable</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {selectedVideo.error || "The video recording stream is processing or was not stored for this session."}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/candidate/interview/${selectedVideo.id}/evaluation`)}
                    className="mt-2 text-xs"
                  >
                    View Evaluation & Transcript Instead
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                {selectedVideo.downloadUrl && (
                  <a
                    href={selectedVideo.downloadUrl}
                    download="interview-recording.webm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Download size={14} /> Download WebM
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/candidate/interview/${selectedVideo.id}/evaluation`)}
                  className="gap-1.5 text-xs"
                >
                  <Award size={14} /> Full Evaluation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/candidate/report?interviewId=${selectedVideo.id}`)}
                  className="gap-1.5 text-xs"
                >
                  <ExternalLink size={14} /> Shareable Report
                </Button>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedVideo(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
