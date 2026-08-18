import { z } from "zod";
import {
  DegreeTypeEnum,
  GradeTypeEnum,
  NoticePeriodEnum,
  WorkTypeEnum,
  avatarPresignedUrlSchema,
  resumePresignedUrlSchema,
  basicInfoSchema,
  educationItemSchema,
  educationSchema,
  skillsSchema,
  experienceItemSchema,
  experienceSchema,
  preferencesSchema,
  linksSchema,
  candidateProfileSchema,
} from "@/lib/validations/profile";

export type DegreeType = z.infer<typeof DegreeTypeEnum>;
export type GradeType = z.infer<typeof GradeTypeEnum>;
export type NoticePeriod = z.infer<typeof NoticePeriodEnum>;
export type WorkType = z.infer<typeof WorkTypeEnum>;

export type AvatarPresignedUrlBody = z.infer<typeof avatarPresignedUrlSchema>;
export type ResumePresignedUrlBody = z.infer<typeof resumePresignedUrlSchema>;
export type BasicInfoBody = z.infer<typeof basicInfoSchema>;
export type Education = z.infer<typeof educationItemSchema>;
export type EducationBody = z.infer<typeof educationSchema>;
export type SkillsBody = z.infer<typeof skillsSchema>;
export type Experience = z.infer<typeof experienceItemSchema>;
export type ExperienceBody = z.infer<typeof experienceSchema>;
export type PreferencesBody = z.infer<typeof preferencesSchema>;
export type LinksBody = z.infer<typeof linksSchema>;
export type CandidateProfileForm = z.infer<typeof candidateProfileSchema>;
