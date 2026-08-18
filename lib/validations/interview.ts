import { z } from "zod";

export const startInterviewSchema = z.object({
  type: z.enum(["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "FULL_STACK", "DSA"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ADAPTIVE"]).optional(),
  targetRole: z.string().optional(),
});

export const transcriptTurnSchema = z.object({
  role: z.enum(["AI", "CANDIDATE"]),
  text: z.string().min(1, "Transcript text is required"),
});
