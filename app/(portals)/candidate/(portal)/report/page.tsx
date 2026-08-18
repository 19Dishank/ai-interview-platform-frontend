"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Share2, Award, PlayCircle, Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import ReportHeader from "@/components/candidate/report/ReportHeader";
import SkillBreakdowns from "@/components/candidate/report/SkillBreakdowns";
import StrengthsWeaknesses from "@/components/candidate/report/StrengthsWeaknesses";
import ReportEvidence from "@/components/candidate/report/ReportEvidence";
import ReportRecording from "@/components/candidate/report/ReportRecording";
import ReportSummary from "@/components/candidate/report/ReportSummary";
import SuggestedSalary from "@/components/candidate/report/SuggestedSalary";
import { getCandidateReport } from "@/services/candidate/candidate.services";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId") || undefined;

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getCandidateReport(interviewId);
        if (isMounted && data) {
          setReportData(data);
        }
      } catch (err) {
        console.warn("Failed to load candidate report:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-muted-foreground gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading verified assessment report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border p-8 max-w-lg mx-auto mt-8">
        <h3 className="font-semibold text-lg mb-2">No Assessment Report Found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You haven&apos;t completed an AI technical interview session yet. Take an interview to generate your verified talent report.
        </p>
        <Link href="/candidate/interview-setup">
          <Button size="sm" className="gap-2">
            <PlayCircle size={15} /> Start AI Interview
          </Button>
        </Link>
      </div>
    );
  }

  const candidate = {
    ...reportData.candidate,
    ...reportData.interview,
    photo: reportData.candidate?.photo || null,
    domain: reportData.interview?.domain || reportData.candidate?.domain || "Technical",
    technology: reportData.interview?.technology || reportData.candidate?.title || "Engineering",
    overallScore: reportData.interview?.overallScore ?? reportData.candidate?.overallScore ?? 0,
    technicalScore: reportData.interview?.technicalScore ?? reportData.candidate?.technicalScore ?? 0,
    communicationScore: reportData.interview?.communicationScore ?? reportData.candidate?.communicationScore ?? 0,
  };

  const technicalSkills = reportData?.technicalSkills || [
    { label: "Core Technical Knowledge", score: candidate.technicalScore || 0 },
    { label: "Problem-Solving Depth", score: candidate.overallScore || 0 },
    { label: "Code Quality & Design", score: Math.round((candidate.technicalScore || 0) * 0.95) },
  ];
  const communicationSkills = reportData?.communicationSkills || [
    { label: "Clarity of Explanation", score: candidate.communicationScore || 0 },
    { label: "Technical Articulation", score: candidate.communicationScore || 0 },
  ];
  const evidenceItems = reportData?.evidenceItems || [];
  const strengths = reportData?.strengths || [];
  const weaknesses = reportData?.weaknesses || [];
  const summary = reportData?.summary;
  const suggestedSalary = reportData?.suggestedSalary;
  const summaryName = candidate.name || "Candidate";

  return (
    <>
      <PageHeader
        title="Assessment Report"
        subtitle="This report is a verified record of your AI interview performance."
        action={
          <div className="flex gap-2">
            {reportData?.interview?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/candidate/interview/${reportData.interview.id}/evaluation`)}
                className="gap-1.5"
              >
                <Award size={14} /> View Evaluation
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Report link copied to clipboard!");
                }
              }}
            >
              <Share2 size={14} /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
            >
              <Download size={14} /> Download PDF
            </Button>
          </div>
        }
      />

      <ReportHeader candidate={candidate} />
      <SkillBreakdowns
        technicalSkills={technicalSkills}
        communicationSkills={communicationSkills}
      />
      <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} />
      <ReportEvidence evidenceItems={evidenceItems} />
      <ReportRecording
        videoUrl={reportData?.interview?.videoUrl}
        videoKey={reportData?.interview?.videoKey}
        interviewTitle={`${candidate.domain || "Technical"} Interview · ${candidate.technology || "Software Engineering"}`}
        interviewDate={candidate.interviewDate}
      />
      <ReportSummary candidateName={summaryName} summary={summary} />
      <SuggestedSalary candidate={candidate} suggestedSalary={suggestedSalary} />

      <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/candidate/interview-setup")}
        >
          <PlayCircle size={14} /> Schedule retake
        </Button>
        <Button onClick={() => router.push("/candidate/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </>
  );
}

export default function AssessmentReport() {
  return (
    <Suspense fallback={null}>
      <ReportContent />
    </Suspense>
  );
}
