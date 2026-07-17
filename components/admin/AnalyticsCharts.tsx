'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { InterviewChartData } from '@/types'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface AnalyticsChartsProps {
  chartData: InterviewChartData[]
}

export default function AnalyticsCharts({ chartData }: AnalyticsChartsProps) {
  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--foreground)',
    fontSize: '12px',
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Interviews over time */}
      <Card>
        <CardHeader><CardTitle>Interviews & candidates (7 months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="interviews" stroke="var(--primary)" strokeWidth={2} dot={false} name="Interviews" />
              <Line type="monotone" dataKey="candidates" stroke="var(--success)" strokeWidth={2} dot={false} name="Candidates" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recruiters over time */}
      <Card>
        <CardHeader><CardTitle>Active recruiters (7 months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="recruiters" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Recruiters" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
