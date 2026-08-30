import { describe, expect, it } from "vitest";
import { exerciseRequestSchema, gmailAiRequestSchema, nutritionEstimateSchema, nutritionRequestSchema, studyAiRequestSchema } from "@/lib/domain";
import { migratePersonalOsData } from "@/lib/client-storage";
import { addDays } from "@/lib/study";

describe("AI request validation", () => {
  it("accepts a concise food description", () => {
    expect(nutritionRequestSchema.parse({ food: "2 rotis and dal" }).food).toBe("2 rotis and dal");
  });

  it("rejects oversized or unexpected nutrition input", () => {
    expect(nutritionRequestSchema.safeParse({ food: "x".repeat(301) }).success).toBe(false);
    expect(nutritionRequestSchema.safeParse({ food: "dal", admin: true }).success).toBe(false);
  });

  it("bounds exercise measurements", () => {
    expect(exerciseRequestSchema.safeParse({ weightKg: 75, duration: 60, activity: "run" }).success).toBe(true);
    expect(exerciseRequestSchema.safeParse({ weightKg: 75, duration: 5000 }).success).toBe(false);
  });

  it("rejects implausible model output", () => {
    expect(nutritionEstimateSchema.safeParse({ cal: -1, protein: 2, carbs: 2, fat: 1, fiber: 1 }).success).toBe(false);
  });

  it("bounds grounded study requests", () => {
    expect(studyAiRequestSchema.safeParse({ topic: "Graphs", context: "BFS and DFS", question: "Compare them" }).success).toBe(true);
    expect(studyAiRequestSchema.safeParse({ topic: "Graphs", context: "x".repeat(12_001) }).success).toBe(false);
  });

  it("accepts only bounded Gmail analysis requests", () => {
    expect(gmailAiRequestSchema.safeParse({ mode:"analyze", message:{ from:"a@example.com",subject:"Hello",snippet:"Please review" } }).success).toBe(true);
    expect(gmailAiRequestSchema.safeParse({ mode:"send", message:{ from:"a",subject:"b",snippet:"c" } }).success).toBe(false);
  });
});

describe("data migrations", () => {
  it("preserves existing keys and initializes v2 reminders", () => {
    const result = migratePersonalOsData({ pos_health: "{}" }, 1);
    expect(result.pos_health).toBe("{}");
    expect(result.pos_reminders).toBe("[]");
    expect(JSON.parse(result.pos_data_version)).toBe(2);
  });
});

describe("study scheduling", () => {
  it("schedules reviews across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-02-28", 3)).toBe("2026-03-03");
  });
});
