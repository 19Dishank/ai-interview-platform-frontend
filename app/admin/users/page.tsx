'use client'

import { useState } from 'react'
import { Search, UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { mockUsers } from '@/data/mock'
import { formatDate } from '@/lib/utils'

export default function UserManagement() {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState(mockUsers)

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (query && !u.name.toLowerCase().includes(query.toLowerCase()) && !u.email.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
  }

  return (
    <>
      <PageHeader
        title="User management"
        subtitle={`${users.filter(u => u.status === 'active').length} active · ${users.filter(u => u.role === 'candidate').length} candidates · ${users.filter(u => u.role === 'recruiter').length} recruiters`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search by name or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'candidate', 'recruiter'].map(r => (
            <button key={r} type="button" onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-md text-sm capitalize transition-colors cursor-pointer ${roleFilter === r ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground font-mono uppercase tracking-wide">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Joined</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Interviews</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'candidate' ? 'default' : 'accent'} className="capitalize">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{formatDate(u.joined)}</td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-muted-foreground">{u.interviews}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'active' ? 'success' : 'destructive'} className="capitalize">{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(u.id)}
                      className={`flex items-center gap-1.5 text-xs ml-auto px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${u.status === 'active' ? 'border-destructive/30 text-destructive hover:bg-destructive/10' : 'border-success/30 text-success hover:bg-success/10'}`}
                    >
                      {u.status === 'active' ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Restore</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No users match your search.</div>
          )}
        </div>
      </Card>
    </>
  )
}
