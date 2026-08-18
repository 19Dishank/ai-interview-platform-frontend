import { TrendingUp, FileText, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatCardsProps {
  overallScore?: number | string;
  profileViews?: number | string;
  daysLeft?: number;
  pct: number;
}

export default function StatCards({
  overallScore,
  profileViews = 8,
  daysLeft,
  pct = 0,
}: StatCardsProps) {
  const hasScore = typeof overallScore === "number" && overallScore > 0;
  const hasValidity = typeof daysLeft === "number" && daysLeft > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        {
          label: "Overall Score",
          value: hasScore ? overallScore.toString() : "—",
          unit: hasScore ? "/100" : " Take interview",
          color: hasScore ? "var(--success)" : "var(--muted-foreground)",
          icon: <TrendingUp size={16} />,
        },
        {
          label: "Profile Discovery",
          value: profileViews ? profileViews.toString() : "0",
          unit: " recruiters",
          color: "var(--primary)",
          icon: <FileText size={16} />,
        },
        {
          label: "Report Valid",
          value: hasValidity ? daysLeft.toString() : "—",
          unit: hasValidity ? " days left" : " No active report",
          color: hasValidity && daysLeft > 60 ? "var(--success)" : "var(--muted-foreground)",
          icon: <Clock size={16} />,
        },
        {
          label: "Profile Complete",
          value: `${pct}%`,
          unit: "",
          color: pct === 100 ? "var(--success)" : "var(--accent)",
          icon: <CheckCircle2 size={16} />,
        },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span className="text-xs">{stat.label}</span>
            </div>
            <div
              className="font-mono text-2xl font-semibold"
              style={{ color: stat.color }}
            >
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground">
                {stat.unit}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
