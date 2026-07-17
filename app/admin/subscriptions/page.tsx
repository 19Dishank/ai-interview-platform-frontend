'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { mockPlans } from '@/data/mock'
import { formatDate } from '@/lib/utils'

const planColors: Record<string, string> = {
  Starter: 'bg-secondary text-secondary-foreground',
  Pro: 'bg-primary/15 text-primary border border-primary/30',
  Enterprise: 'bg-accent/15 text-accent border border-accent/30',
}

export default function SubscriptionManagement() {
  const [plans] = useState(mockPlans)

  const total = plans.filter(p => p.status === 'active').reduce((acc, p) => acc + parseInt(p.monthly.replace(/[^\d]/g, '')), 0)

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Recruiter plan and subscription management."
      />

      {/* MRR summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">Monthly recurring revenue</div>
            <div className="font-mono text-2xl font-semibold">₹{total.toLocaleString()}</div>
            <div className="text-xs text-success mt-1 font-mono">↑ Active plans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">Active subscriptions</div>
            <div className="font-mono text-2xl font-semibold">{plans.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground mb-1">Expired / cancelled</div>
            <div className="font-mono text-2xl font-semibold text-destructive">{plans.filter(p => p.status === 'expired').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plan tiers */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { name: 'Starter', price: '₹4,500/mo', seats: '1–2 seats', features: ['Basic candidate search', '50 profile views/mo', 'Email contact', 'Standard support'] },
          { name: 'Pro', price: '₹12,000/mo', seats: '3–10 seats', features: ['Advanced filters', 'Unlimited profile views', 'Candidate comparison', 'Priority support', 'Export reports'] },
          { name: 'Enterprise', price: '₹45,000/mo', seats: 'Unlimited seats', features: ['Everything in Pro', 'Custom domain filters', 'ATS integrations', 'Dedicated account manager', 'SLA guarantee'] },
        ].map(p => (
          <Card key={p.name} className={p.name === 'Pro' ? 'border-primary' : ''}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${planColors[p.name]}`}>{p.name}</span>
                {p.name === 'Pro' && <span className="text-xs text-primary font-medium">Most popular</span>}
              </div>
              <div className="font-display text-xl font-semibold mb-0.5">{p.price}</div>
              <div className="text-xs text-muted-foreground mb-4">{p.seats}</div>
              <ul className="flex flex-col gap-1.5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriber table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground font-mono uppercase tracking-wide">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Seats</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Monthly</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Renews</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.company}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${planColors[p.plan]}`}>{p.plan}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground font-mono">{p.seats}</td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-sm">{p.monthly}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{formatDate(p.renewsOn)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'active' ? 'success' : 'destructive'} className="capitalize">{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-xs text-primary hover:underline cursor-pointer">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
