"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/Card";
import { mockAdminStats, mockInterviewChartData } from "@/data/mock";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import DomainBreakdown from "@/components/admin/DomainBreakdown";
import {
  fetchAdminDashboardStats,
  fetchAdminDashboardCharts,
} from "@/services/admin/admin.services";
import type { AdminStats, InterviewChartData } from "@/types";

const StatCard = ({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
}) => (
  <Card>
    <CardContent className="pt-5">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      {trend && (
        <div className="text-xs text-success mt-1 font-mono">↑ {trend}</div>
      )}
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [charts, setCharts] = useState<InterviewChartData[]>(mockInterviewChartData);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [statsData, chartsData] = await Promise.allSettled([
          fetchAdminDashboardStats(),
          fetchAdminDashboardCharts(),
        ]);
        if (isMounted) {
          if (statsData.status === "fulfilled" && statsData.value) {
            setStats(statsData.value);
          }
          if (chartsData.status === "fulfilled" && chartsData.value) {
            setCharts(chartsData.value);
          }
        }
      } catch {
        // Fallback already in place
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Platform dashboard"
        subtitle="Real-time overview of platform activity."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Total candidates"
          value={stats.totalCandidates.toLocaleString()}
          trend={stats.trends?.candidatesGrowth || "12% this month"}
        />
        <StatCard
          label="Recruiting teams"
          value={stats.totalRecruiters.toLocaleString()}
          trend={stats.trends?.recruitersGrowth || "8% this month"}
        />
        <StatCard
          label="Interviews this month"
          value={stats.interviewsThisMonth.toLocaleString()}
          trend={stats.trends?.interviewsGrowth || "21% MoM"}
        />
        <StatCard
          label="Active job postings"
          value={stats.activeJobs.toLocaleString()}
        />
        <StatCard
          label="Avg. interview score"
          value={stats.avgScore}
          sub="/ 100"
        />
        <StatCard
          label="Completion rate"
          value={`${stats.completionRate}%`}
          trend={stats.trends?.completionRateDelta || "2.1pp up"}
        />
      </div>

      <AnalyticsCharts chartData={charts} />

      <DomainBreakdown />
    </>
  );
}
