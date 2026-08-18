"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  RotateCcw,
  ArrowUpDown,
  Zap,
  Award,
  Globe,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import FilterPanel from "@/components/recruiter/FilterPanel";
import CandidateGrid from "@/components/recruiter/CandidateGrid";
import CandidateList from "@/components/recruiter/CandidateList";
import { fetchCandidates } from "@/services/recruiter/recruiter.services";
import { Candidate } from "@/types";

export default function CandidateSearch() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [level, setLevel] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [location, setLocation] = useState("All");
  const [notice, setNotice] = useState("Any");
  const [minScore, setMinScore] = useState("All");
  const [sortBy, setSortBy] = useState("overallScore");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const minScoreNum =
        minScore !== "All" ? parseInt(minScore.replace("+", ""), 10) : undefined;

      const res = await fetchCandidates({
        query: query.trim() || undefined,
        domain: domain !== "All" ? domain : undefined,
        level: level !== "All" ? level : undefined,
        difficulty: difficulty !== "All" ? difficulty : undefined,
        location: location !== "All" ? location : undefined,
        notice: notice !== "Any" ? notice : undefined,
        minScore: minScoreNum,
        sortBy,
      });

      if (res?.data?.candidates) {
        setCandidates(res.data.candidates);
      } else if (res?.candidates) {
        setCandidates(res.candidates);
      } else {
        setCandidates([]);
      }
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [query, domain, level, difficulty, location, notice, minScore, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidates();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  // Client-side instant filter refinement
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (domain !== "All") {
        const d = domain.toLowerCase();
        const candDomain = (c.domain || "").toLowerCase();
        const candTech = (c.technology || "").toLowerCase();
        if (!candDomain.includes(d) && !d.includes(candDomain) && !candTech.includes(d)) {
          return false;
        }
      }
      if (level !== "All" && c.level.toLowerCase() !== level.toLowerCase()) return false;
      if (difficulty !== "All" && c.difficulty.toLowerCase() !== difficulty.toLowerCase())
        return false;
      if (
        location !== "All" &&
        !c.location.toLowerCase().includes(location.toLowerCase())
      )
        return false;
      if (notice !== "Any") {
        const reqNotice = notice.toLowerCase();
        const candNotice = c.noticePeriod.toLowerCase();
        if (reqNotice.includes("15") && !candNotice.includes("immediate") && !candNotice.includes("15")) return false;
        if (reqNotice.includes("30") && !candNotice.includes("immediate") && !candNotice.includes("15") && !candNotice.includes("30")) return false;
        if (reqNotice.includes("45") && !candNotice.includes("immediate") && !candNotice.includes("15") && !candNotice.includes("30") && !candNotice.includes("45")) return false;
        if (reqNotice.includes("immediate") && !candNotice.includes("immediate")) return false;
      }
      if (minScore !== "All") {
        const scoreNum = parseInt(minScore.replace("+", ""), 10);
        if (c.overallScore < scoreNum) return false;
      }
      if (query) {
        const q = query.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesTech = (c.technology || "").toLowerCase().includes(q);
        const matchesDomain = (c.domain || "").toLowerCase().includes(q);
        const matchesLocation = (c.location || "").toLowerCase().includes(q);
        const matchesSkill = c.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesTech && !matchesDomain && !matchesLocation && !matchesSkill)
          return false;
      }
      return true;
    });
  }, [candidates, domain, level, difficulty, location, notice, minScore, query]);

  // Client-side sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "technicalScore":
        return list.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0));
      case "communicationScore":
        return list.sort((a, b) => (b.communicationScore || 0) - (a.communicationScore || 0));
      case "experience":
        return list.sort((a, b) => (b.experience || 0) - (a.experience || 0));
      case "recent":
        return list.sort(
          (a, b) => new Date(b.interviewDate || "").getTime() - new Date(a.interviewDate || "").getTime()
        );
      case "notice":
        const parseNoticeDays = (n: string) => {
          if (n.toLowerCase().includes("immediate")) return 0;
          const match = n.match(/\d+/);
          return match ? parseInt(match[0], 10) : 30;
        };
        return list.sort((a, b) => parseNoticeDays(a.noticePeriod) - parseNoticeDays(b.noticePeriod));
      case "overallScore":
      default:
        return list.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
    }
  }, [filtered, sortBy]);

  const resetAllFilters = () => {
    setQuery("");
    setDomain("All");
    setLevel("All");
    setDifficulty("All");
    setLocation("All");
    setNotice("Any");
    setMinScore("All");
    setSortBy("overallScore");
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    domain !== "All" ||
    level !== "All" ||
    difficulty !== "All" ||
    location !== "All" ||
    notice !== "Any" ||
    minScore !== "All";

  // Quick preset toggles
  const toggleQuickFilter = (type: "immediate" | "topScore" | "remote" | "frontend" | "backend" | "ml") => {
    switch (type) {
      case "immediate":
        setNotice((prev) => (prev === "Immediate" ? "Any" : "Immediate"));
        break;
      case "topScore":
        setMinScore((prev) => (prev === "85+" ? "All" : "85+"));
        break;
      case "remote":
        setLocation((prev) => (prev === "Remote" ? "All" : "Remote"));
        break;
      case "frontend":
        setDomain((prev) => (prev === "Frontend" ? "All" : "Frontend"));
        break;
      case "backend":
        setDomain((prev) => (prev === "Backend" ? "All" : "Backend"));
        break;
      case "ml":
        setDomain((prev) => (prev === "ML" ? "All" : "ML"));
        break;
    }
  };

  return (
    <>
      <PageHeader
        title="Verified Candidate Discovery"
        subtitle={`${sorted.length} candidate${sorted.length === 1 ? "" : "s"} evaluated with AI technical interviews`}
      />

      {/* Main Search & Control Bar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="w-full h-10.5 pl-10 pr-9 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs transition-colors"
              placeholder="Search by candidate name, skill, tech stack, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <ArrowUpDown size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10.5 pl-8 pr-8 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs"
              >
                <option value="overallScore">Highest AI Score</option>
                <option value="technicalScore">Technical Score</option>
                <option value="communicationScore">Communication Score</option>
                <option value="experience">Most Experienced</option>
                <option value="notice">Shortest Notice Period</option>
                <option value="recent">Most Recent Interview</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen((f) => !f)}
              className={cn(
                "h-10.5 gap-1.5 text-xs font-medium rounded-xl shadow-xs transition-colors",
                filtersOpen && "bg-primary/10 border-primary/40 text-primary"
              )}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </Button>

            {/* View Mode (Grid/List) */}
            <div className="hidden md:flex border border-border rounded-xl overflow-hidden h-10.5 shadow-xs bg-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 text-xs font-medium transition-colors cursor-pointer rounded-lg flex items-center gap-1",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 text-xs font-medium transition-colors cursor-pointer rounded-lg flex items-center gap-1",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground text-[11px] font-medium mr-1 shrink-0">
            Quick filters:
          </span>
          <button
            type="button"
            onClick={() => toggleQuickFilter("immediate")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0",
              notice === "Immediate"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            <Zap size={11} /> Immediate Notice
          </button>
          <button
            type="button"
            onClick={() => toggleQuickFilter("topScore")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0",
              minScore === "85+"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            <Award size={11} /> 85+ AI Score
          </button>
          <button
            type="button"
            onClick={() => toggleQuickFilter("remote")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0",
              location === "Remote"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            <Globe size={11} /> Remote
          </button>
          <button
            type="button"
            onClick={() => toggleQuickFilter("frontend")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer shrink-0",
              domain === "Frontend"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            Frontend
          </button>
          <button
            type="button"
            onClick={() => toggleQuickFilter("backend")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer shrink-0",
              domain === "Backend"
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            Backend
          </button>
          <button
            type="button"
            onClick={() => toggleQuickFilter("ml")}
            className={cn(
              "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer shrink-0",
              domain === "ML"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                : "bg-card text-muted-foreground border-border hover:border-border/80"
            )}
          >
            ML / AI
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">
              Active filters:
            </span>
            {query && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Search: &ldquo;{query}&rdquo;
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setQuery("")} />
              </span>
            )}
            {domain !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Domain: {domain}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setDomain("All")} />
              </span>
            )}
            {level !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Level: {level}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setLevel("All")} />
              </span>
            )}
            {difficulty !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Difficulty: {difficulty}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setDifficulty("All")} />
              </span>
            )}
            {location !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Location: {location}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setLocation("All")} />
              </span>
            )}
            {notice !== "Any" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Notice: {notice}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setNotice("Any")} />
              </span>
            )}
            {minScore !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Min Score: {minScore}
                <X size={12} className="cursor-pointer hover:opacity-70" onClick={() => setMinScore("All")} />
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] text-primary hover:underline ml-1 font-medium cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {filtersOpen && (
        <FilterPanel
          domain={domain}
          setDomain={setDomain}
          level={level}
          setLevel={setLevel}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          location={location}
          setLocation={setLocation}
          notice={notice}
          setNotice={setNotice}
          minScore={minScore}
          setMinScore={setMinScore}
        />
      )}

      {/* Results / Empty / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Fetching verified candidates...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 bg-card/50 rounded-2xl border border-dashed border-border/80 p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
            <Search size={24} />
          </div>
          <h3 className="font-semibold text-lg mb-1.5">No candidates match your criteria</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            We couldn&apos;t find any candidates matching your selected search query and filters. Try widening your filters.
          </p>
          <Button variant="outline" size="sm" onClick={resetAllFilters} className="gap-1.5 text-xs">
            <RotateCcw size={13} /> Reset all filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <CandidateGrid candidates={sorted} />
      ) : (
        <CandidateList candidates={sorted} />
      )}
    </>
  );
}
