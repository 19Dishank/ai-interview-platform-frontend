import { z } from "zod";

// ==========================================
// Enums matching Backend
// ==========================================
export const DegreeTypeEnum = z.enum([
  "HIGH_SCHOOL",
  "DIPLOMA",
  "BACHELOR",
  "MASTER",
  "PHD",
  "OTHER",
]);

export const GradeTypeEnum = z.enum(["CGPA", "PERCENTAGE"]);

export const NoticePeriodEnum = z.enum([
  "IMMEDIATE",
  "FIFTEEN_DAYS",
  "THIRTY_DAYS",
  "SIXTY_DAYS",
  "NINETY_DAYS",
]);

export const WorkTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "FREELANCE",
  "REMOTE",
]);

// ==========================================
// Shared Helpers
// ==========================================

/** "YYYY-MM" regex — matches month strings used in date fields */
const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Returns true when a value is considered "blank":
 * undefined, null, or a string that trims to empty.
 */
function isBlank(val: unknown): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === "string") return val.trim() === "";
  return false;
}

/**
 * Shared grade-range check. Returns an error message or null.
 * Accepts both `string` and `number` grade values.
 */
function validateGrade(
  grade: string | number | null | undefined,
  gradeType: "CGPA" | "PERCENTAGE",
): string | null {
  if (isBlank(grade)) return null; // blank handled separately if required
  const num = Number(grade);
  if (isNaN(num)) return "Grade must be a valid number.";
  if (gradeType === "CGPA") {
    if (num < 0 || num > 10) return "CGPA must be between 0 and 10.";
  } else {
    if (num < 0 || num > 100) return "Percentage must be between 0 and 100.";
  }
  return null;
}

/**
 * Shared date-order check — both dates must be non-blank YYYY-MM strings.
 * Returns an error message or null.
 */
function validateDateOrder(startDate: string, endDate: string): string | null {
  if (!YEAR_MONTH_REGEX.test(startDate) || !YEAR_MONTH_REGEX.test(endDate))
    return null; // format issues surfaced elsewhere
  return endDate < startDate ? "End date cannot be before start date." : null;
}

// ==========================================
// Presigned URL Schemas
// ==========================================
export const generatePresignedUrlSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required."),
  contentType: z.string().trim().min(1, "Content type is required."),
});

export const avatarPresignedUrlSchema = generatePresignedUrlSchema;
export const resumePresignedUrlSchema = generatePresignedUrlSchema;

// ==========================================
// Step 0: Basic Info Schema
// ==========================================
/** Only letters, hyphens, apostrophes, and spaces (no pure digits). */
const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'\-]+$/;

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name cannot exceed 50 characters.")
    .regex(nameRegex, "First name can only contain letters, hyphens, or apostrophes."),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name cannot exceed 50 characters.")
    .regex(nameRegex, "Last name can only contain letters, hyphens, or apostrophes."),

  location: z
    .string()
    .trim()
    .min(2, "Location is required.")
    .max(100, "Location cannot exceed 100 characters."),

  avatarKey: z.string().trim().min(1, "Profile photo is required."),

  profilePhoto: z.any().optional(),

  pendingUpload: z
    .object({
      file: z.any(),
      uploadUrl: z.string().url("Invalid upload URL."),
    })
    .optional(),
});

// ==========================================
// Step 1: Education Schema
// ==========================================

/** Month string validator: "YYYY-MM" */
const monthString = z
  .string()
  .trim()
  .regex(YEAR_MONTH_REGEX, "Date must be a valid year and month.");

export const educationItemSchema = z
  .object({
    institution: z
      .string()
      .trim()
      .min(1, "Institution is required.")
      .max(200, "Institution name is too long."),

    degreeType: DegreeTypeEnum,

    fieldOfStudy: z
      .string()
      .trim()
      .min(1, "Field of study is required.")
      .max(100, "Field of study is too long."),

    startDate: monthString,

    /** endDate is optional at the schema level; presence is enforced in superRefine */
    endDate: monthString.nullable().optional(),

    isCurrent: z.boolean(),
    currentlyPursuing: z.boolean(),

    gradeType: GradeTypeEnum,

    /** grade is optional at the schema level; presence/range is enforced in superRefine */
    grade: z.union([z.number(), z.string()]).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const isPursuing = data.currentlyPursuing || data.isCurrent;

    // ── End date ────────────────────────────────────────────────
    if (!isPursuing) {
      if (isBlank(data.endDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required when not currently pursuing.",
          path: ["endDate"],
        });
      } else {
        const orderErr = validateDateOrder(data.startDate, data.endDate as string);
        if (orderErr)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: orderErr, path: ["endDate"] });
      }
    } else if (!isBlank(data.endDate)) {
      const orderErr = validateDateOrder(data.startDate, data.endDate as string);
      if (orderErr)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: orderErr, path: ["endDate"] });
    }

    // ── Grade ────────────────────────────────────────────────────
    if (!isPursuing) {
      if (isBlank(data.grade)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Grade / percentage is required when completed.",
          path: ["grade"],
        });
      } else {
        const gradeErr = validateGrade(data.grade, data.gradeType);
        if (gradeErr)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: gradeErr, path: ["grade"] });
      }
    } else if (!isBlank(data.grade)) {
      // Even while pursuing, if a grade is provided it must be in range
      const gradeErr = validateGrade(data.grade, data.gradeType);
      if (gradeErr)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: gradeErr, path: ["grade"] });
    }
  });

export const educationSchema = z.object({
  educations: z
    .array(educationItemSchema)
    .min(1, "At least one education record is required."),
});

// ==========================================
// Step 2: Skills & Experience Schemas
// ==========================================
export const skillsSchema = z.object({
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill name cannot be empty.")
        .max(60, "Skill name is too long."),
    )
    .min(1, "At least one skill is required.")
    .max(30, "You can add at most 30 skills."),
  resumeKey: z.string().trim().min(1, "Resume is required."),
});

export const experienceItemSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(1, "Company name is required.")
      .max(150, "Company name is too long."),

    jobTitle: z
      .string()
      .trim()
      .min(1, "Job title is required.")
      .max(100, "Job title is too long."),

    description: z.string().trim().max(2000, "Description is too long.").optional().nullable(),

    startDate: monthString,

    /** endDate is optional at schema level; presence enforced in superRefine */
    endDate: monthString.nullable().optional(),

    isCurrent: z.boolean(),
    currentlyWorking: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const isWorking = data.currentlyWorking || data.isCurrent;

    if (!isWorking) {
      if (isBlank(data.endDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required when not currently working here.",
          path: ["endDate"],
        });
      } else {
        const orderErr = validateDateOrder(data.startDate, data.endDate as string);
        if (orderErr)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: orderErr, path: ["endDate"] });
      }
    } else if (!isBlank(data.endDate)) {
      const orderErr = validateDateOrder(data.startDate, data.endDate as string);
      if (orderErr)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: orderErr, path: ["endDate"] });
    }
  });

export const experienceSchema = z.object({
  experiences: z.array(experienceItemSchema),
});

// ==========================================
// Step 3: Preferences Schema
// ==========================================
/**
 * Accepts:
 *  - empty string / null / undefined → treated as "not provided" (optional)
 *  - plain number: 2500000
 *  - formatted string: "₹25,00,000"
 *  - range string: "10000-20000"  (backend transformer takes the upper bound)
 */
const salaryField = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .superRefine((val, ctx) => {
    if (isBlank(val)) return; // optional — blank is fine
    const str = String(val).trim();
    // Allow range "X-Y" where both X and Y are positive integers
    const rangeMatch = str.match(/^(\d[\d,₹\s]*)-(\d[\d,₹\s]*)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1].replace(/\D/g, ""), 10);
      const hi = parseInt(rangeMatch[2].replace(/\D/g, ""), 10);
      if (isNaN(lo) || isNaN(hi) || lo <= 0 || hi <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Salary range values must be positive numbers.",
        });
      } else if (lo > hi) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lower bound of salary range must not exceed the upper bound.",
        });
      }
      return;
    }
    // Plain number / formatted string
    const num = parseInt(str.replace(/\D/g, ""), 10);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected salary must be a positive number.",
      });
    }
  });

export const preferencesSchema = z.object({
  expectedSalary: salaryField,

  noticePeriod: NoticePeriodEnum.optional().nullable().or(z.literal("")),

  preferredLocations: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Location cannot be empty.")
        .max(100, "Location is too long."),
    )
    .min(1, "At least one preferred location is required.")
    .max(10, "You can add at most 10 preferred locations."),

  workTypes: z
    .array(WorkTypeEnum)
    .min(1, "At least one work type is required."),
});

// ==========================================
// Step 4: Professional Links Schema
// ==========================================

/** Username: letters, digits, hyphens, underscores only; no slashes or spaces */
const usernameField = z
  .string()
  .trim()
  .max(50, "Username is too long.")
  .regex(
    /^[a-zA-Z0-9_-]*$/,
    "Username can only contain letters, digits, hyphens, and underscores.",
  )
  .optional()
  .nullable();

/**
 * Optional URL field: accepts empty string, null, undefined, or a valid http(s) URL.
 * Normalization of empty → null is handled in profile-transformers.ts.
 */
const optionalUrl = z
  .string()
  .trim()
  .max(500, "URL is too long.")
  .optional()
  .nullable()
  .refine(
    (v) => !v || v === "" || /^https?:\/\/.+\..+/.test(v),
    { message: "Must be a valid URL starting with https://." },
  );

export const linksSchema = z.object({
  /** Canonical field used for display / BFF forwarding */
  githubUsername: usernameField,
  /** Alias kept for backward compat with backend payload */
  github: usernameField,

  linkedinUrl: optionalUrl,
  linkedin: optionalUrl,

  leetcodeUsername: usernameField,

  portfolioUrl: optionalUrl,
  portfolio: optionalUrl,
});

// ==========================================
// Full Candidate Profile Schema
// ==========================================
export const candidateProfileSchema = z.object({
  basicInfo: basicInfoSchema,

  education: z
    .array(educationItemSchema)
    .min(1, "At least one education record is required."),

  experience: z.array(experienceItemSchema),

  skills: z
    .array(z.string().trim().min(1))
    .min(1, "At least one skill is required.")
    .max(30, "You can add at most 30 skills."),

  resume: z.any().optional(),

  resumeKey: z.string().trim().min(1, "Resume is required."),

  pendingResumeUpload: z
    .object({
      file: z.any(),
      uploadUrl: z.string().url("Invalid upload URL."),
    })
    .optional(),

  preferences: preferencesSchema,

  links: linksSchema,
});
