interface LocationItem {
  name?: string;
  location?: string | { name?: string };
}

interface WorkTypeItem {
  name?: string;
  workType?: string | { name?: string };
}

interface EducationItem {
  institution?: string;
  degreeType?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  currentlyPursuing?: boolean;
  gradeType?: string;
  grade?: string | number;
}

interface SkillItem {
  name?: string;
  skill?: { name?: string };
}

interface ExperienceItem {
  company?: string;
  jobTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  currentlyWorking?: boolean;
  resumeKey?: string;
}

interface RawLinksItem {
  githubUsername?: string;
  github?: string;
  linkedinUrl?: string;
  linkedin?: string;
  leetcodeUsername?: string;
  portfolioUrl?: string;
  portfolio?: string;
}

type UnknownRecord = Record<string, unknown>;

/**
 * Converts raw GET /candidate/profile backend response into CandidateProfileForm structure.
 */
export function transformCandidateProfile(rawData: unknown) {
  if (!rawData || typeof rawData !== "object") return null;

  const data = rawData as UnknownRecord;
  const info = (data.basicInfo || data) as UnknownRecord;
  const rawEducation = data.educations || data.education;
  const rawSkills = data.skills;
  const rawExperience = data.experiences || data.experience;
  const prefObj = (data.preference || data.preferences || data) as UnknownRecord;
  const linksObj: RawLinksItem = (data.links as RawLinksItem) || {};

  const resumeKey =
    (data.resumeKey as string) ||
    (Array.isArray(rawExperience) &&
      (rawExperience[0] as ExperienceItem)?.resumeKey) ||
    "";

  // Format expected salary
  const expSal = prefObj?.expectedSalary ?? data?.expectedSalary ?? null;
  let formattedSalaryStr = "";
  if (expSal !== null && expSal !== undefined && expSal !== "") {
    const numSal = Number(expSal);
    formattedSalaryStr = !isNaN(numSal)
      ? `₹${numSal.toLocaleString("en-IN")}`
      : String(expSal);
  }

  // Format locations
  const rawLocs = prefObj?.preferredLocations || data?.preferredLocations;
  let mappedLocs: string[] = [];
  if (Array.isArray(rawLocs) && rawLocs.length > 0) {
    mappedLocs = rawLocs
      .map((loc: string | LocationItem) => {
        if (typeof loc === "string") return loc;
        if (typeof loc?.location === "string") return loc.location;
        if (loc?.location?.name) return loc.location.name;
        if (loc?.name) return loc.name;
        return String(loc);
      })
      .filter(Boolean);
  }

  // Format work types
  const rawWTypes =
    prefObj?.workTypes ||
    prefObj?.workType ||
    data?.workTypes ||
    data?.workType;
  let mappedWTypes: string[] = [];
  if (Array.isArray(rawWTypes) && rawWTypes.length > 0) {
    mappedWTypes = rawWTypes
      .map((wt: string | WorkTypeItem) => {
        if (typeof wt === "string") return wt;
        if (typeof wt?.workType === "string") return wt.workType;
        if (wt?.workType?.name) return wt.workType.name;
        if (wt?.name) return wt.name;
        return String(wt);
      })
      .filter(Boolean);
  }

  return {
    basicInfo: {
      firstName: (info.firstName as string) || "",
      lastName: (info.lastName as string) || "",
      location: (info.location as string) || "",
      avatarKey: (info.avatarKey as string) || "",
    },
    education:
      Array.isArray(rawEducation) && rawEducation.length > 0
        ? rawEducation.map((edu: EducationItem) => ({
            institution: edu.institution || "",
            degreeType: edu.degreeType || "BACHELOR",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: edu.startDate ? String(edu.startDate).substring(0, 7) : "",
            endDate: edu.endDate ? String(edu.endDate).substring(0, 7) : "",
            isCurrent: Boolean(edu.isCurrent),
            currentlyPursuing: Boolean(edu.isCurrent),
            gradeType: edu.gradeType || "CGPA",
            grade:
              edu.grade !== undefined && edu.grade !== null
                ? String(edu.grade)
                : "",
          }))
        : [
            {
              institution: "",
              degreeType: "BACHELOR",
              fieldOfStudy: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              currentlyPursuing: false,
              gradeType: "CGPA",
              grade: "",
            },
          ],
    skills:
      Array.isArray(rawSkills) && rawSkills.length > 0
        ? rawSkills.map((s: string | SkillItem) =>
            typeof s === "string" ? s : s.skill?.name || s.name || String(s),
          )
        : [],
    resumeKey: resumeKey,
    experience:
      Array.isArray(rawExperience) && rawExperience.length > 0
        ? rawExperience
            .filter(
              (exp: ExperienceItem) =>
                exp.company !== "__placeholder__" &&
                exp.jobTitle !== "__placeholder__",
            )
            .map((exp: ExperienceItem) => ({
              company: exp.company || "",
              jobTitle: exp.jobTitle || "",
              description: exp.description || "",
              startDate: exp.startDate ? String(exp.startDate).substring(0, 7) : "",
              endDate: exp.endDate ? String(exp.endDate).substring(0, 7) : "",
              isCurrent: Boolean(exp.isCurrent),
              currentlyWorking: Boolean(exp.isCurrent),
            }))
        : [],
    preferences: {
      expectedSalary: expSal ?? undefined,
      salaryExpectation: formattedSalaryStr,
      noticePeriod: (prefObj?.noticePeriod as string) || "",
      preferredLocations: mappedLocs,
      workTypes: mappedWTypes,
      workType: mappedWTypes,
    },
    links: {
      githubUsername:
        linksObj.githubUsername || linksObj.github || "",
      github:
        linksObj.github || linksObj.githubUsername || "",
      linkedinUrl:
        linksObj.linkedinUrl || linksObj.linkedin || "",
      linkedin:
        linksObj.linkedin || linksObj.linkedinUrl || "",
      leetcodeUsername: linksObj.leetcodeUsername || "",
      portfolioUrl:
        linksObj.portfolioUrl || linksObj.portfolio || "",
      portfolio:
        linksObj.portfolio || linksObj.portfolioUrl || "",
    },
  };
}

/**
 * Transforms raw education input from client to backend PUT /education payload.
 */
export function transformEducationPayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  const rawEducations =
    data?.educations || data?.education || (Array.isArray(body) ? body : []);

  const formattedEducations = (
    Array.isArray(rawEducations) ? rawEducations : []
  ).map((item: EducationItem) => {
    let mappedDegree = item.degreeType || "BACHELOR";
    if (typeof mappedDegree === "string") {
      if (mappedDegree.startsWith("B.")) mappedDegree = "BACHELOR";
      else if (mappedDegree.startsWith("M.")) mappedDegree = "MASTER";
      else if (mappedDegree === "PhD") mappedDegree = "PHD";
      else if (mappedDegree === "Diploma") mappedDegree = "DIPLOMA";
      else if (
        ![
          "BACHELOR",
          "MASTER",
          "PHD",
          "DIPLOMA",
          "HIGH_SCHOOL",
          "OTHER",
        ].includes(mappedDegree)
      ) {
        mappedDegree = "OTHER";
      }
    }

    let mappedGradeType = item.gradeType || "CGPA";
    if (
      typeof mappedGradeType === "string" &&
      mappedGradeType.toLowerCase().includes("percentage")
    ) {
      mappedGradeType = "PERCENTAGE";
    } else {
      mappedGradeType = "CGPA";
    }

    const formatToDateStr = (d?: string) => {
      if (!d) return undefined;
      if (d.length === 7) return `${d}-01`;
      return d;
    };

    const isCurrent = Boolean(item.isCurrent || item.currentlyPursuing);
    const parsedGrade =
      item.grade !== undefined && item.grade !== ""
        ? typeof item.grade === "number"
          ? item.grade
          : parseFloat(String(item.grade))
        : undefined;

    return {
      institution: item.institution,
      degreeType: mappedDegree,
      fieldOfStudy: item.fieldOfStudy,
      startDate: formatToDateStr(item.startDate) || item.startDate,
      endDate: isCurrent ? undefined : formatToDateStr(item.endDate),
      isCurrent,
      gradeType: mappedGradeType,
      grade: isNaN(parsedGrade as number) ? undefined : parsedGrade,
    };
  });

  return { educations: formattedEducations };
}

/**
 * Transforms raw experience input from client to backend PUT /experience payload.
 */
export function transformExperiencePayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  const rawExperiences =
    data?.experiences || data?.experience || (Array.isArray(body) ? body : []);

  const formattedExperiences = (
    Array.isArray(rawExperiences) ? rawExperiences : []
  )
    .filter((item: ExperienceItem) => item.company || item.jobTitle)
    .map((item: ExperienceItem) => {
      const formatToDateStr = (d?: string) => {
        if (!d) return undefined;
        if (d.length === 7) return `${d}-01`;
        return d;
      };

      const isCurrent = Boolean(item.isCurrent || item.currentlyWorking);

      return {
        company: item.company,
        jobTitle: item.jobTitle,
        description: item.description || undefined,
        startDate: formatToDateStr(item.startDate) || item.startDate,
        endDate: isCurrent ? undefined : formatToDateStr(item.endDate),
        isCurrent,
      };
    });

  return { experiences: formattedExperiences };
}

/**
 * Transforms raw preferences input from client to backend PATCH /preferences payload.
 */
export function transformPreferencesPayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  let parsedSalary: number | undefined = undefined;
  const rawSalary = data?.expectedSalary ?? data?.salaryExpectation;
  if (rawSalary !== undefined && rawSalary !== null && rawSalary !== "") {
    if (typeof rawSalary === "number") {
      parsedSalary = rawSalary;
    } else {
      const strVal = String(rawSalary).trim();
      if (strVal.includes("-")) {
        const parts = strVal
          .split("-")
          .map((p) => parseInt(p.replace(/\D/g, ""), 10))
          .filter((n) => !isNaN(n));
        if (parts.length >= 2) {
          parsedSalary = Math.max(...parts);
        } else if (parts.length === 1) {
          parsedSalary = parts[0];
        }
      } else {
        const cleaned = parseInt(strVal.replace(/\D/g, ""), 10);
        parsedSalary = isNaN(cleaned) ? undefined : cleaned;
      }
    }
  }

  let noticePeriod: string | undefined = (data?.noticePeriod as string) || undefined;
  if (noticePeriod) {
    const npUpper = noticePeriod.toUpperCase();
    if (npUpper.includes("IMMEDIATE")) noticePeriod = "IMMEDIATE";
    else if (npUpper.includes("15") || npUpper.includes("FIFTEEN"))
      noticePeriod = "FIFTEEN_DAYS";
    else if (npUpper.includes("30") || npUpper.includes("THIRTY"))
      noticePeriod = "THIRTY_DAYS";
    else if (npUpper.includes("60") || npUpper.includes("SIXTY"))
      noticePeriod = "SIXTY_DAYS";
    else if (npUpper.includes("90") || npUpper.includes("NINETY"))
      noticePeriod = "NINETY_DAYS";
    else if (
      ![
        "IMMEDIATE",
        "FIFTEEN_DAYS",
        "THIRTY_DAYS",
        "SIXTY_DAYS",
        "NINETY_DAYS",
      ].includes(npUpper)
    ) {
      noticePeriod = undefined;
    }
  }

  const preferredLocations = data?.preferredLocations || [];
  const workTypes = data?.workTypes || data?.workType || [];

  return {
    expectedSalary: parsedSalary,
    noticePeriod,
    preferredLocations,
    workTypes,
  };
}

/**
 * Transforms raw links input from client to backend PATCH /links payload.
 */
export function transformLinksPayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  const formattedPayload: Record<string, string | undefined> = {};

  const gh = data?.github || data?.githubUsername;
  if (gh && typeof gh === "string" && gh.trim()) {
    formattedPayload.github = gh.trim();
    formattedPayload.githubUsername = gh.trim();
  }

  const li = data?.linkedin || data?.linkedinUrl;
  if (li && typeof li === "string" && li.trim()) {
    formattedPayload.linkedin = li.trim();
    formattedPayload.linkedinUrl = li.trim();
  }

  const lc = data?.leetcodeUsername;
  if (lc && typeof lc === "string" && lc.trim()) {
    formattedPayload.leetcodeUsername = lc.trim();
  }

  const pf = data?.portfolio || data?.portfolioUrl;
  if (pf && typeof pf === "string" && pf.trim()) {
    formattedPayload.portfolio = pf.trim();
    formattedPayload.portfolioUrl = pf.trim();
  }

  return formattedPayload;
}

/**
 * Transforms raw skills input from client to backend PUT /skills payload.
 */
export function transformSkillsPayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  const rawSkills = data?.skills || [];
  const skillsList = (Array.isArray(rawSkills) ? rawSkills : [])
    .map((s: string | SkillItem) =>
      typeof s === "string" ? s : s.name || s.skill?.name || String(s),
    )
    .filter(Boolean);

  return {
    skills: skillsList,
    resumeKey: (data?.resumeKey as string) || "",
  };
}

/**
 * Transforms raw basic info input from client to backend PATCH /basic-info payload.
 */
export function transformBasicInfoPayload(body: unknown) {
  const data = (body && typeof body === "object" ? body : {}) as UnknownRecord;
  return {
    firstName: (data?.firstName as string)?.trim() || "",
    lastName: (data?.lastName as string)?.trim() || "",
    location: (data?.location as string)?.trim() || "",
    avatarKey: (data?.avatarKey as string)?.trim() || undefined,
  };
}

/**
 * Form stores dates as "YYYY-MM" strings; DatePicker works with Date objects.
 */
export function monthStringToDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return undefined;
  return new Date(year, month - 1);
}

export function dateToMonthString(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Computes active step index (0 to 4) based on profile data completion and user onboarding step.
 */
export function computeProfileStepIndex(
  profileData: any,
  userOnboardingStep?: number | null,
  isProfileCompleted?: boolean,
  totalSteps = 5,
): number {
  if (isProfileCompleted) return totalSteps - 1;

  let stepFromData = 0;
  const hasBasic =
    profileData?.basicInfo?.firstName && profileData?.basicInfo?.location;
  const hasEdu =
    Array.isArray(profileData?.education) &&
    profileData.education.length > 0 &&
    profileData.education[0]?.institution;
  const hasSkills =
    (Array.isArray(profileData?.skills) && profileData.skills.length > 0) ||
    profileData?.resumeKey;
  const hasPref =
    (Array.isArray(profileData?.preferences?.preferredLocations) &&
      profileData.preferences.preferredLocations.length > 0) ||
    (Array.isArray(profileData?.preferences?.workTypes) &&
      profileData.preferences.workTypes.length > 0);

  if (hasBasic) stepFromData = 1;
  if (hasBasic && hasEdu) stepFromData = 2;
  if (hasBasic && hasEdu && hasSkills) stepFromData = 3;
  if (hasBasic && hasEdu && hasSkills && hasPref) stepFromData = 4;

  const stepFromUser =
    userOnboardingStep !== null && userOnboardingStep !== undefined
      ? Math.max(0, userOnboardingStep - 1)
      : 0;

  return Math.min(totalSteps - 1, Math.max(stepFromData, stepFromUser));
}

/**
 * Safely extracts redirect URL from GitHub connect backend response.
 */
export function extractGitHubRedirectUrl(responseData: any): string | null {
  if (!responseData) return null;
  const url =
    responseData?.data?.url ??
    responseData?.url ??
    (typeof responseData?.data === "string" ? responseData.data : responseData);
  return typeof url === "string" ? url : null;
}
