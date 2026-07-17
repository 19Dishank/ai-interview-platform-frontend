'use client'

import { PageHeader } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { mockAdminStats, mockInterviewChartData } from '@/data/mock'
import AnalyticsCharts from '@/components/admin/AnalyticsCharts'
import DomainBreakdown from '@/components/admin/DomainBreakdown'

const StatCard = ({ label, value, sub, trend }: { label: string; value: string | number; sub?: string; trend?: string }) => (
  <Card>
    <CardContent className="pt-5">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      {trend && <div className="text-xs text-success mt-1 font-mono">↑ {trend}</div>}
    </CardContent>
  </Card>
)

export default function AdminDashboard() {
  return (
    <>
      <PageHeader title="Platform dashboard" subtitle="Real-time overview of platform activity." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total candidates" value={mockAdminStats.totalCandidates.toLocaleString()} trend="12% this month" />
        <StatCard label="Recruiting teams" value={mockAdminStats.totalRecruiters.toLocaleString()} trend="8% this month" />
        <StatCard label="Interviews this month" value={mockAdminStats.interviewsThisMonth.toLocaleString()} trend="21% MoM" />
        <StatCard label="Active job postings" value={mockAdminStats.activeJobs.toLocaleString()} />
        <StatCard label="Avg. interview score" value={mockAdminStats.avgScore} sub="/ 100" />
        <StatCard label="Completion rate" value={`${mockAdminStats.completionRate}%`} trend="2.1pp up" />
      </div>

      <AnalyticsCharts chartData={mockInterviewChartData} />

      <DomainBreakdown />
    </>
  )
}
