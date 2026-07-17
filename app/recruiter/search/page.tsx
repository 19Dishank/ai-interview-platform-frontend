'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { mockCandidates } from '@/data/mock'
import { cn } from '@/lib/utils'
import FilterPanel from '@/components/recruiter/FilterPanel'
import CandidateGrid from '@/components/recruiter/CandidateGrid'
import CandidateList from '@/components/recruiter/CandidateList'

export default function CandidateSearch() {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('All')
  const [level, setLevel] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [location, setLocation] = useState('All')
  const [notice, setNotice] = useState('Any')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = mockCandidates.filter(c => {
    if (domain !== 'All' && c.domain !== domain) return false
    if (level !== 'All' && c.level !== level) return false
    if (difficulty !== 'All' && c.difficulty !== difficulty) return false
    if (location !== 'All' && !c.location.toLowerCase().includes(location.toLowerCase())) return false
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))) return false
    return true
  })

  return (
    <>
      <PageHeader title="Find candidates" subtitle={`${filtered.length} candidates match your filters`} />

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search by name, skill, or technology..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"><X size={14} /></button>}
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(f => !f)}>
          <SlidersHorizontal size={16} /> Filters {filtersOpen ? '▲' : '▼'}
        </Button>
        <div className="hidden sm:flex border border-border rounded-md overflow-hidden">
          <button type="button" onClick={() => setViewMode('grid')} className={cn('px-3 py-2 text-xs transition-colors cursor-pointer', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>Grid</button>
          <button type="button" onClick={() => setViewMode('list')} className={cn('px-3 py-2 text-xs transition-colors cursor-pointer', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>List</button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <FilterPanel
          domain={domain} setDomain={setDomain}
          level={level} setLevel={setLevel}
          difficulty={difficulty} setDifficulty={setDifficulty}
          location={location} setLocation={setLocation}
          notice={notice} setNotice={setNotice}
        />
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium mb-1">No candidates match</p>
          <p className="text-sm">Try adjusting your filters or search query.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <CandidateGrid candidates={filtered} />
      ) : (
        <CandidateList candidates={filtered} />
      )}
    </>
  )
}
