import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const basicInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  profilePhoto: z.any().optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, { message: "Institution is required" }),
  degreeType: z.string().min(1, { message: "Degree type is required" }),
  fieldOfStudy: z.string().min(1, { message: "Field of study is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  currentlyPursuing: z.boolean(),
  gradeType: z.string().optional(),
  grade: z.string().optional(),
});

export const experienceSchema = z.object({
  jobTitle: z.string().min(1, { message: "Job title is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  description: z.string().optional(),
});

export const preferencesSchema = z.object({
  salaryExpectation: z
    .string()
    .min(1, { message: "Salary expectation is required" }),
  noticePeriod: z.string().min(1, { message: "Notice period is required" }),
  preferredLocations: z
    .array(z.string())
    .min(1, { message: "Select at least one preferred location" }),
  workType: z
    .array(z.enum(["full-time", "contract", "part-time", "open-to-all"]))
    .min(1, { message: "Select at least one work type" }),
});

export const linksSchema = z.object({
  github: z.string().url({ message: "Must be a valid URL" }).or(z.literal("")),
  linkedin: z
    .string()
    .url({ message: "Must be a valid URL" })
    .or(z.literal("")),
  portfolio: z
    .string()
    .url({ message: "Must be a valid URL" })
    .or(z.literal("")),
});

export const candidateProfileSchema = z.object({
  basicInfo: basicInfoSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  skills: z.array(z.string()).min(1, { message: "Add at least one skill" }),
  resume: z.any().optional(),
  preferences: preferencesSchema,
  links: linksSchema,
});
