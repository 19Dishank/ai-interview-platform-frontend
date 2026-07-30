import { User, Briefcase, Check, ArrowLeft, Sun, Moon } from "lucide-react";
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

export function AuthSidePanel({ role, showRoleContext }: AuthSidePanelProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const Icon = role === "candidate" ? User : Briefcase;
  const { label, headline, points } = ROLE_CONTENT[role];

  return (
    <div
      className={cn(
        "hidden md:flex flex-col justify-between h-full p-10 transition-colors duration-300",
        showRoleContext
          ? role === "candidate"
            ? "bg-primary/5"
            : "bg-accent/5"
          : "bg-secondary",
      )}
    >
      <div className="flex flex-col gap-8">
        {/* Back + theme toggle row */}
        <div className="flex items-center justify-end">
          {/* <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full border border-border",
              "text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer",
            )}
          >
            <ArrowLeft size={16} />
          </button> */}

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
      </div>

      <div className="flex flex-col gap-6">
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
              role === "candidate"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            <Icon size={13} />
            Continuing as {label}
          </div>
        )}

        <h2 className="font-display text-3xl font-semibold leading-tight text-foreground">
          {showRoleContext
            ? headline
            : "One interview. Verified for every recruiter."}
        </h2>

        <ul className="flex flex-col gap-3">
          {(showRoleContext
            ? points
            : [
                "Take a rigorous AI interview once",
                "Share it with any recruiter you like",
                "Skip repeating yourself in every screening call",
              ]
          ).map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5",
                  role === "candidate"
                    ? "bg-primary/15 text-primary"
                    : "bg-accent/15 text-accent",
                )}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span className="text-sm text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Verquo. All rights reserved.
      </p>
    </div>
  );
}
