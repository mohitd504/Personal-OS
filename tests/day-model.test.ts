import { describe, expect, it } from "vitest";
import { buildAgenda, dayProgress, lessonTitle, nextUp, sessionMinutes, type Plan } from "@/components/features/today/day-model";

const plan: Plan = {
  exSessions: [
    { id: "w", time: "06:30", type: "Walk", done: true, steps: "11000", selected: [] },
    { id: "g", time: "18:00", type: "Pull", done: false, selected: [{ name: "Deadlift", sets: "3", reps: "8" }, { name: "Row", sets: "4", reps: "10" }] },
  ],
  studyList: [
    { id: "a", courseId: "agentic", label: "Day 10: Vectorless RAG", plan: [{ time: "40 min", task: "Watch", done: true }, { time: "40 min", task: "Code" }, { time: "10 min", task: "Notes" }] },
    { id: "b", courseId: "dsa", label: "DSA Day 10: Linked lists", hours: "1.5", plan: [] },
  ],
  meals: { breakfast: [{ name: "Oats", cal: 420, protein: 32 }], lunch: [], dinner: [{ name: "Chicken", cal: "600", protein: "45" }] },
};

describe("day model", () => {
  it("orders the day: walk, breakfast, study blocks, gym, dinner", () => {
    expect(buildAgenda(plan).map((x) => x.key)).toEqual(["s-w", "m-breakfast", "st-a", "st-b", "s-g", "m-dinner"]);
  });
  it("estimates durations", () => {
    const [, , study, study2, gym] = buildAgenda(plan);
    expect(study.kind === "study" && study.minutes).toBe(90);
    expect(study2.kind === "study" && study2.minutes).toBe(90); // from hours when no tasks
    expect(gym.kind === "session" && gym.minutes).toBe(Math.round(7 * 2.5 + 10));
    expect(sessionMinutes({ type: "Walk", steps: "11000" })).toBe(100);
  });
  it("sums meal macros, including numeric strings", () => {
    const dinner = buildAgenda(plan).find((x) => x.key === "m-dinner");
    expect(dinner).toMatchObject({ kcal: 600, protein: 45 });
  });
  it("picks the next thing: a timed item within the hour beats study", () => {
    const items = buildAgenda(plan);
    expect(nextUp(items, 9 * 60)?.key).toBe("st-a");
    expect(nextUp(items, 17 * 60 + 20)?.key).toBe("s-g");
  });
  it("counts progress by study tasks and sessions", () => {
    expect(dayProgress(buildAgenda(plan))).toEqual({ done: 2, total: 6, pct: 33 });
  });
  it("strips the day prefix from lesson labels", () => {
    expect(lessonTitle("SD Day 10: CAP Theorem")).toBe("CAP Theorem");
    expect(lessonTitle("DSA Day 3: Arrays")).toBe("Arrays");
  });
});
