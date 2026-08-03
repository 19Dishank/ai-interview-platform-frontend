import { z } from "zod";
import {
  basicInfoSchema,
  educationSchema,
  experienceSchema,
  preferencesSchema,
  linksSchema,
  candidateProfileSchema,
} from "@/lib/validations/profile";

export type WorkType = "full-time" | "contract" | "part-time" | "open-to-all";

export type BasicInfo = z.infer<typeof basicInfoSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Links = z.infer<typeof linksSchema>;
export type CandidateProfileForm = z.infer<typeof candidateProfileSchema>;
