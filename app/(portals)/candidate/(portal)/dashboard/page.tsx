"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { mockInterviewHistory } from "@/data/mock";
import StatCards from "@/components/candidate/StatCards";
import ProfileCompletion from "@/components/candidate/ProfileCompletion";
import ActiveInterviewReport from "@/components/candidate/ActiveInterviewReport";
import CooldownNote from "@/components/candidate/CooldownNote";
import { getCandidateDashboard } from "@/services/candidate/candidate.services";

const defaultProfileCompletion = [
  { label: "Basic info", done: true },
  { label: "Resume uploaded", done: true },
  { label: "Skills added", done: true },
  { label: "GitHub connected", done: false },
  { label: "LinkedIn connected", done: true },
  { label: "Salary expectation", done: false },
];

export default function CandidateDashboard() {
  const router = useRouter();
  const [now] = useState(() => Date.now());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getCandidateDashboard();
        if (isMounted && data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn("Failed to load live dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const latestInterview = dashboardData?.latestInterview ?? null;
  const isValid = latestInterview?.validUntil
    ? new Date(latestInterview.validUntil).getTime() > now
    : false;

  const daysLeft = latestInterview?.daysLeft ?? (
    latestInterview?.validUntil
      ? Math.max(
          0,
          Math.ceil(
            (new Date(latestInterview.validUntil).getTime() - now) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : undefined
  );

  const checklist = dashboardData?.profileCompletion?.checklist || defaultProfileCompletion;
  const pct = dashboardData?.profileCompletion?.percentage ?? 0;

  const greetingName = dashboardData?.greetingName || "there";
  const discoveryCount = dashboardData?.discoveryCount || 5;
  const overallScore = latestInterview?.score ?? latestInterview?.overallScore ?? undefined;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Good morning, ${greetingName}. Your profile is being discovered by ${discoveryCount} recruiters this week.`}
        action={
          <Button onClick={() => router.push("/candidate/interview-setup")}>
            <PlayCircle size={16} /> Take new interview
          </Button>
        }
      />

      <StatCards
        overallScore={overallScore}
        profileViews={discoveryCount}
        daysLeft={daysLeft}
        pct={pct}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <ProfileCompletion
          profileCompletion={checklist}
          pct={pct}
        />
        <ActiveInterviewReport
          latestInterview={latestInterview}
          isValid={isValid}
        />
      </div>

      {dashboardData?.cooldown && (
        <CooldownNote cooldown={dashboardData.cooldown} />
      )}
    </>
  );
}
