import { z } from "zod";

export const PilotSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  initialReadiness: z.number(),
  finalPerformance: z.number().optional(),
  commanderNotes: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  vitalsHistory: z.array(z.object({
    timestamp: z.date(),
    heartRate: z.number(),
    bloodPressure: z.object({
      sys: z.number(),
      dia: z.number()
    }),
    oxygenLevel: z.number(),
    g_force: z.number(),
    readinessScore: z.number(),
    performanceScore: z.number()
  }))
});

export const MissionSessionSchema = z.object({
  missionId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  activePilots: z.array(PilotSessionSchema),
  commanderFeedback: z.string().optional(),
  missionDuration: z.number().optional(), // in milliseconds
  overallPerformance: z.number().optional(),
  // Fields for future Mistral API integration
  aiRecommendations: z.array(z.object({
    pilotId: z.string(),
    recommendation: z.string(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    category: z.enum(["HEALTH", "PERFORMANCE", "TRAINING"]),
    timestamp: z.date()
  })).optional()
});

export type PilotSession = z.infer<typeof PilotSessionSchema>;
export type MissionSession = z.infer<typeof MissionSessionSchema>;

// Utility type for initializing a new mission session
export type NewMissionSession = Omit<MissionSession, "endTime" | "missionDuration" | "overallPerformance" | "aiRecommendations">;
