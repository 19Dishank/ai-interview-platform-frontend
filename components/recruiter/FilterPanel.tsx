import { Card, CardContent } from "@/components/ui/Card";
import { RotateCcw } from "lucide-react";

interface FilterPanelProps {
  domain: string;
  setDomain: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  notice: string;
  setNotice: (v: string) => void;
  minScore?: string;
  setMinScore?: (v: string) => void;
}

const domainOpts = [
  "All",
  "Frontend",
  "Backend",
  "Full Stack",
  "DevOps",
  "ML",
  "Mobile",
  "System Design",
  "DSA",
  "Technical",
];
const levelOpts = ["All", "Fresher", "Junior", "Mid", "Senior", "Staff"];
const difficultyOpts = ["All", "Easy", "Medium", "Hard", "Adaptive"];
const locationOpts = [
  "All",
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Chennai",
  "Delhi",
  "Pune",
  "Remote",
];
const noticeOpts = ["Any", "Immediate", "≤15 days", "≤30 days", "≤45 days", "≤60 days"];
const scoreOpts = ["All", "70+", "75+", "80+", "85+", "90+"];

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default function FilterPanel({
  domain,
  setDomain,
  level,
  setLevel,
  difficulty,
  setDifficulty,
  location,
  setLocation,
  notice,
  setNotice,
  minScore = "All",
  setMinScore,
}: FilterPanelProps) {
  const resetAll = () => {
    setDomain("All");
    setLevel("All");
    setDifficulty("All");
    setLocation("All");
    setNotice("Any");
    if (setMinScore) setMinScore("All");
  };

  const hasActiveFilters =
    domain !== "All" ||
    level !== "All" ||
    difficulty !== "All" ||
    location !== "All" ||
    notice !== "Any" ||
    minScore !== "All";

  return (
    <Card className="mb-6 border-border/80 shadow-sm animate-in fade-in-50 duration-200">
      <CardContent className="py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          <FilterSelect
            label="Domain"
            value={domain}
            onChange={setDomain}
            options={domainOpts}
          />
          <FilterSelect
            label="Level"
            value={level}
            onChange={setLevel}
            options={levelOpts}
          />
          <FilterSelect
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            options={difficultyOpts}
          />
          <FilterSelect
            label="Location"
            value={location}
            onChange={setLocation}
            options={locationOpts}
          />
          <FilterSelect
            label="Notice Period"
            value={notice}
            onChange={setNotice}
            options={noticeOpts}
          />
          {setMinScore && (
            <FilterSelect
              label="Min AI Score"
              value={minScore}
              onChange={setMinScore}
              options={scoreOpts}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/50 text-xs">
          <span className="text-muted-foreground">
            {hasActiveFilters
              ? "Filters applied to verified AI assessments"
              : "Showing all candidate pools"}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw size={12} /> Reset all filters
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
