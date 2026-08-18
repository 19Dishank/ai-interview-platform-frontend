"use client";

import React, { useState, useEffect } from "react";
import ContactModal from "@/components/recruiter/ContactModal";
import DetailHeader from "@/components/recruiter/detail/DetailHeader";
import ProfileTab from "@/components/recruiter/detail/ProfileTab";
import InterviewTab from "@/components/recruiter/detail/InterviewTab";
import AssessmentTab from "@/components/recruiter/detail/AssessmentTab";
import { fetchCandidateDetail } from "@/services/recruiter/recruiter.services";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CandidateDetail({ params }: PageProps) {
  const { id } = React.use(params);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [tab, setTab] = useState<"profile" | "interview" | "assessment">(
    "profile",
  );

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchCandidateDetail(id);
        if (isMounted && (res?.data || res?.candidate)) {
          setCandidate(res.data || res.candidate || res);
        } else {
          setCandidate(null);
        }
      } catch {
        if (isMounted) setCandidate(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-muted-foreground gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border p-8 max-w-lg mx-auto mt-8">
        <h3 className="font-semibold text-lg mb-2">Candidate Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          The requested candidate profile does not exist or has been removed from the platform.
        </p>
        <Link href="/recruiter/search">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={14} /> Back to candidate search
          </Button>
        </Link>
      </div>
    );
  }

  const evidence = candidate?.evidenceItems || [];
  const techSkills = candidate?.technicalSkills || [];

  return (
    <>
      <DetailHeader
        candidate={candidate}
        onContactClick={() => setContactOpen(true)}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(["profile", "interview", "assessment"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px cursor-pointer ${tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "interview" ? "Interview & transcript" : t}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab candidate={candidate} />}
      {tab === "interview" && (
        <InterviewTab candidate={candidate} evidenceItems={evidence} />
      )}
      {tab === "assessment" && (
        <AssessmentTab
          candidate={candidate}
          technicalSkills={techSkills}
        />
      )}

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        candidate={candidate}
      />
    </>
  );
}
