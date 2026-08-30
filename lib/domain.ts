import { z } from "zod";

export const APP_DATA_VERSION = 2;

export type AppSettings = {
  name: string;
  age: number;
  heightFt: number;
  heightIn: number;
  planStart: string;
  planDays: number;
  weightGoal: number;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  fiberGoal: number;
  waterGoal: number;
  stepGoal: number;
};

export type NutritionEstimate = {
  source: "ai" | "table" | "none";
  estimated: true;
  assumption: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

const finiteNumber = z.coerce.number().finite();

export const nutritionRequestSchema = z.object({
  food: z.string().trim().min(1).max(300),
}).strict();

export const exerciseRequestSchema = z.object({
  weightKg: finiteNumber.min(25).max(350).default(75),
  duration: finiteNumber.min(0).max(1440).default(0),
  steps: finiteNumber.min(0).max(200000).optional(),
  distance: finiteNumber.min(0).max(1000).optional(),
  volume: finiteNumber.min(0).max(2_000_000).optional(),
  activity: z.string().trim().max(120).optional(),
  kind: z.string().trim().max(120).optional(),
}).strict();

export const nutritionEstimateSchema = z.object({
  cal: finiteNumber.min(0).max(10000),
  protein: finiteNumber.min(0).max(1000),
  carbs: finiteNumber.min(0).max(2000),
  fat: finiteNumber.min(0).max(1000),
  fiber: finiteNumber.min(0).max(500),
});

export const exerciseEstimateSchema = z.object({
  cal: finiteNumber.min(0).max(10000),
});

export const studyAiRequestSchema = z.object({
  topic: z.string().trim().min(1).max(300),
  context: z.string().max(12_000).default(""),
  question: z.string().trim().max(1_000).optional(),
}).strict();

export const gmailAiRequestSchema = z.object({
  mode: z.literal("analyze"),
  message: z.object({
    from: z.string().max(500), subject: z.string().max(500), snippet: z.string().max(5_000), date: z.string().max(200).optional(),
  }).passthrough(),
}).strict();
