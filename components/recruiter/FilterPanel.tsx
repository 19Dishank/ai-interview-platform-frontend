import { Card, CardContent } from '@/components/ui/Card'

interface FilterPanelProps {
  domain: string
  setDomain: (v: string) => void
  level: string
  setLevel: (v: string) => void
  difficulty: string
  setDifficulty: (v: string) => void
  location: string
  setLocation: (v: string) => void
  notice: string
  setNotice: (v: string) => void
}

const domainOpts = ['All', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'ML', 'Mobile']
const levelOpts = ['All', 'Fresher', 'Junior', 'Mid', 'Senior', 'Staff']
const difficultyOpts = ['All', 'Easy', 'Medium', 'Hard']
const locationOpts = ['All', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Delhi', 'Remote']
const noticeOpts = ['Any', '≤15 days', '≤30 days', '≤45 days', '≤60 days']

const FilterSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="h-9 rounded-md border border-border bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
)

export default function FilterPanel({
  domain, setDomain,
  level, setLevel,
  difficulty, setDifficulty,
  location, setLocation,
  notice, setNotice
}: FilterPanelProps) {

  const resetAll = () => {
    setDomain('All')
    setLevel('All')
    setDifficulty('All')
    setLocation('All')
    setNotice('Any')
  }

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <FilterSelect label="Domain" value={domain} onChange={setDomain} options={domainOpts} />
          <FilterSelect label="Level" value={level} onChange={setLevel} options={levelOpts} />
          <FilterSelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={difficultyOpts} />
          <FilterSelect label="Location" value={location} onChange={setLocation} options={locationOpts} />
          <FilterSelect label="Notice period" value={notice} onChange={setNotice} options={noticeOpts} />
        </div>
        <button type="button" onClick={resetAll}
          className="text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors cursor-pointer">
          Reset all filters
        </button>
      </CardContent>
    </Card>
  )
}
