import { User, Briefcase, Check, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Role = "candidate" | "recruiter";

interface AuthSidePanelProps {
  role: Role;
  showRoleContext: boolean;
}

const ROLE_CONTENT: Record<
  Role,
  { label: string; headline: string; points: string[] }
> = {
  candidate: {
    label: "Candidate",
    headline: "Take one interview. Share it everywhere.",
    points: [
      "One AI interview, reusable across recruiters",
      "A verified report of your skills and communication",
      "No more repeating yourself in early screening calls",
    ],
  },
  recruiter: {
    label: "Recruiter",
    headline: "Skip the screening calls.",
    points: [
      "Search candidates by verified interview results",
      "Watch recordings and AI-generated assessments",
      "Contact candidates directly once you're interested",
    ],
  },
};

const WAVEFORM_HEIGHTS = [
  6, 11, 8, 17, 24, 14, 28, 19, 9, 22, 30, 16, 8, 25, 13, 20, 27, 11, 17, 7,
];

export function AuthSidePanel({ role, showRoleContext }: AuthSidePanelProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const Icon = role === "candidate" ? User : Briefcase;
  const { label, headline, points } = ROLE_CONTENT[role];
  const isCandidate = role === "candidate";

  return (
    <div
      className={cn(
        "hidden md:flex flex-col justify-between h-full p-10 border-r border-border transition-colors duration-300",
        showRoleContext
          ? isCandidate
            ? "bg-primary/5"
            : "bg-accent/5"
          : "bg-secondary",
      )}
    >
      {/* Theme toggle row */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full border border-border",
            "text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer",
          )}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="flex flex-col gap-7 max-w-sm">
        <Image
          src={`/verquo-lockup-${theme}.svg`}
          alt="Verquo Logo"
          width={112}
          height={32}
          className="h-8 w-auto object-contain cursor-pointer"
          onClick={() => router.push("/")}
        />

        {showRoleContext && (
          <div
            className={cn(
              "flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-medium",
              isCandidate
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            <Icon size={13} />
            Continuing as {label}
          </div>
        )}

        <h2 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground text-balance">
          {showRoleContext
            ? headline
            : "One interview. Verified for every recruiter."}
        </h2>

        <div className="flex items-end gap-0.75 h-8" aria-hidden="true">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-0.75 rounded-full",
                isCandidate ? "bg-primary" : "bg-accent",
              )}
              style={{ height: `${h}px`, opacity: 0.2 + (h / 30) * 0.6 }}
            />
          ))}
        </div>

        <ul className="flex flex-col gap-3.5">
          {(showRoleContext
            ? points
            : [
                "Take a rigorous AI interview once",
                "Share it with any recruiter you like",
                "Skip repeating yourself in every screening call",
              ]
          ).map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5",
                  isCandidate
                    ? "bg-primary/15 text-primary"
                    : "bg-accent/15 text-accent",
                )}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-border">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          &copy; {new Date().getFullYear()} VERQUO — ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}
