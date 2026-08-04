"use client";

import { useState } from "react";
import { X, Star, AlertTriangle, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockCandidates } from "@/data/mock";
import Image from "next/image";

const defaultSelected = ["c1", "c3", "c5"];

export default function CandidateComparison() {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const candidates = mockCandidates.filter((c) => selected.includes(c.id));

  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));
  const add = (id: string) => {
    if (selected.length < 3) setSelected((s) => [...s, id]);
  };
  const available = mockCandidates.filter((c) => !selected.includes(c.id));

  const scoreColor = (s: number) =>
    s >= 85 ? "var(--success)" : s >= 65 ? "var(--primary)" : "var(--accent)";

  const metrics = [
    { label: "Overall score", key: "overallScore" as const },
    { label: "Technical score", key: "technicalScore" as const },
    { label: "Communication", key: "communicationScore" as const },
  ];

  return (
    <>
      <PageHeader
        title="Compare candidates"
        subtitle="Side-by-side comparison of up to 3 candidates."
      />

      {/* Add panel */}
      {selected.length < 3 && available.length > 0 && (
        <Card className="mb-6 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Add a candidate to compare (up to 3):
            </p>
            <div className="flex flex-wrap gap-2">
              {available.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => add(c.id)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-sm hover:border-primary transition-colors cursor-pointer"
                >
                  <Image
                    src={c.photo}
                    alt={c.name}
                    height={20}
                    unoptimized
                    width={20}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate headers */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}
      >
        {candidates.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-3">
                <Image
                  src={c.photo}
                  alt={c.name}
                  height={48}
                  unoptimized
                  width={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {c.title}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="success">
                  <Shield size={10} /> Verified
                </Badge>
                <Badge variant="outline">{c.level}</Badge>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {c.salaryExpectation}
              </div>
              <div className="text-xs text-muted-foreground">
                {c.noticePeriod} notice
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score comparison */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Score comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {metrics.map((m) => (
              <div key={m.key}>
                <div className="text-sm font-medium mb-2">{m.label}</div>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${candidates.length}, 1fr)`,
                  }}
                >
                  {candidates.map((c) => {
                    const score = c[m.key];
                    const color = scoreColor(score);
                    const best = Math.max(...candidates.map((x) => x[m.key]));
                    return (
                      <div key={c.id} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground truncate">
                            {c.name.split(" ")[0]}
                          </span>
                          <span
                            className="font-mono text-sm font-semibold"
                            style={{ color }}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${score}%`,
                              backgroundColor: color,
                              opacity: score === best ? 1 : 0.5,
                            }}
                          />
                        </div>
                        {score === best && (
                          <span className="text-xs text-success font-mono">
                            highest
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths / Weaknesses */}
      <div
        className="grid gap-6 mb-6"
        style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}
      >
        {candidates.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-sm">{c.name.split(" ")[0]}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-success text-xs font-medium mb-2">
                  <Star size={12} /> Strengths
                </div>
                <ul className="flex flex-col gap-1">
                  {c.strengths.map((s) => (
                    <li
                      key={s}
                      className="text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <div className="w-1 h-1 rounded-full bg-success shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-accent text-xs font-medium mb-2">
                  <AlertTriangle size={12} /> Growth areas
                </div>
                <ul className="flex flex-col gap-1">
                  {c.weaknesses.map((w) => (
                    <li
                      key={w}
                      className="text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle>Salary expectations</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}
          >
            {candidates.map((c) => (
              <div
                key={c.id}
                className="text-center p-4 bg-secondary/40 rounded-lg"
              >
                <div className="font-display text-lg font-semibold">
                  {c.salaryExpectation}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.name.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
