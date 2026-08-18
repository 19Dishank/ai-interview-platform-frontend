import { GitBranch, Link2, Briefcase, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Candidate } from "@/types";

interface ProfileTabProps {
  candidate: Candidate;
}

export default function ProfileTab({ candidate }: ProfileTabProps) {
  const skills = candidate?.skills || [];
  const experiences = (candidate as any)?.experiences || [];
  const educations = (candidate as any)?.educations || [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No specific skills listed for this candidate profile.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase size={16} className="text-primary" /> Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {experiences.length > 0 ? (
              experiences.map((exp: any, i: number) => {
                const startDateStr = exp.startDate
                  ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "";
                const endDateStr = exp.isCurrent
                  ? "Present"
                  : exp.endDate
                  ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "Completed";

                return (
                  <div
                    key={exp.id || i}
                    className={i > 0 ? "pt-5 border-t border-border" : ""}
                  >
                    <div className="font-semibold text-sm">
                      {exp.jobTitle || exp.role || "Software Engineer"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {exp.company} {startDateStr ? `· ${startDateStr} – ${endDateStr}` : ""}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">
                {candidate.experience || 1}+ years of verified industry engineering experience.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={16} className="text-primary" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {educations.length > 0 ? (
              educations.map((edu: any, i: number) => {
                const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : "";
                const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : "";

                return (
                  <div key={edu.id || i} className={i > 0 ? "pt-4 border-t border-border" : ""}>
                    <div className="font-semibold text-sm">
                      {edu.degreeType
                        ? `${edu.degreeType} in ${edu.fieldOfStudy || "Engineering"}`
                        : edu.fieldOfStudy || "Computer Science / Engineering"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {edu.institution} {startYear ? `· ${startYear} – ${endYear || "Present"}` : ""}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-muted-foreground">
                Technical background in Computer Science and Engineering.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle>Profiles & Social</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {candidate.github ? (
              <a
                href={candidate.github.startsWith("http") ? candidate.github : `https://${candidate.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                <GitBranch size={15} className="shrink-0" />
                <span className="truncate">{candidate.github.replace(/^https?:\/\//, "")}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 italic">
                <GitBranch size={14} className="opacity-40 shrink-0" />
                <span>GitHub not provided</span>
              </div>
            )}
            {candidate.linkedin ? (
              <a
                href={candidate.linkedin.startsWith("http") ? candidate.linkedin : `https://${candidate.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                <Link2 size={15} className="shrink-0" />
                <span className="truncate">{candidate.linkedin.replace(/^https?:\/\//, "")}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 italic">
                <Link2 size={14} className="opacity-40 shrink-0" />
                <span>LinkedIn not provided</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Salary expectation</span>
              <span className="font-mono text-xs font-semibold">
                {candidate.salaryExpectation || "Competitive"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Notice period</span>
              <span className="font-mono text-xs font-semibold">
                {candidate.noticePeriod || "30 days"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Availability</span>
              <Badge variant="success" className="text-xs">
                {candidate.availability || "Active"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Location</span>
              <span className="text-xs font-medium">{candidate.location || "Remote"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
