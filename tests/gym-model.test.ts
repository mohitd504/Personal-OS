import { describe, expect, it } from "vitest";
import { exerciseHistory, muscleFocus, suggestion, weekStats, type Workout } from "@/components/features/exercise/gym-model";

const workouts: Workout[] = [
  { date: "2026-09-20", type: "Push", volume: 7000, duration: 50, exercises: [{ name: "Bench Press", topWeight: 67.5, sets: [{ w: 67.5, r: 10 }] }] },
  { date: "2026-09-26", type: "Push", volume: 8450, duration: 58, exercises: [{ name: "Bench Press", topWeight: 70, missedSets: 0, sets: [{ w: 70, r: 10 }, { w: 70, r: 10 }, { w: 70, r: 10 }] }] },
];

describe("gym model", () => {
  it("finds the latest and best sets for an exercise", () => {
    expect(exerciseHistory("Bench Press", workouts)).toMatchObject({ date: "2026-09-26", topWeight: 70, best: 70, sessions: 2, missedSets: 0 });
    expect(exerciseHistory("Squat", workouts)).toBeNull();
  });
  it("adds load only when every planned set hit the target reps", () => {
    const h = exerciseHistory("Bench Press", workouts);
    expect(suggestion(h, 10, 3)).toMatchObject({ kind: "up", weight: 72.5 });
    expect(suggestion(h, 12, 3)).toMatchObject({ kind: "repeat", weight: 70 });
    expect(suggestion({ ...h!, missedSets: 1 }, 10, 3).kind).toBe("repeat");
    expect(suggestion({ ...h!, topWeight: 12, sets: [{ w: 12, r: 10 }, { w: 12, r: 10 }, { w: 12, r: 10 }] }, 10, 3).weight).toBe(13.25);
    expect(suggestion(null, 10, 3).kind).toBe("new");
  });
  it("counts muscle focus from setup targets", () => {
    expect(muscleFocus(["Chest · triceps · front delts", "Upper chest · triceps", "See today’s training focus"]).slice(0, 2)).toEqual([{ name: "Chest", count: 2 }, { name: "Triceps", count: 2 }]);
  });
  it("sums the last 7 days", () => {
    expect(weekStats(workouts, "2026-09-29")).toEqual({ sessions: 1, volume: 8450, minutes: 58 });
  });
});
