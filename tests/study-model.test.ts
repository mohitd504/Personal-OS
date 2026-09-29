import { describe, expect, it } from "vitest";
import { buildCourses, lessonStatus } from "@/components/features/study/study-model";

const T = "2026-09-29";
const day = (label: string, courseId: string, done: number, total = 3) => ({ studyList: [{ id: label, courseId, label, plan: Array.from({ length: total }, (_, i) => ({ task: `t${i}`, time: "30 min", done: i < done })) }] });
const store: Record<string, unknown> = {
  "pos_plan_2026-09-27": day("Day 1: Intro", "agentic", 3),
  "pos_plan_2026-09-28": day("Day 2: Prompts", "agentic", 1),
  "pos_plan_2026-09-29": day("Day 3: Tools", "agentic", 0),
  "pos_plan_2026-09-30": day("Day 4: Graphs", "agentic", 0),
};
const read = (k: string) => (k in store ? JSON.stringify(store[k]) : null);

describe("study roadmap", () => {
  it("assigns lesson status", () => {
    expect(lessonStatus("2026-09-20", T, 3, 3)).toBe("done");
    expect(lessonStatus("2026-09-20", T, 1, 3)).toBe("partial");
    expect(lessonStatus("2026-09-20", T, 0, 3)).toBe("missed");
    expect(lessonStatus(T, T, 1, 3)).toBe("today");
    expect(lessonStatus("2026-10-01", T, 0, 3)).toBe("upcoming");
  });
  it("builds a course with progress, today's lesson and catch-up count", () => {
    const [c] = buildCourses(read, T, 5, 5);
    expect(c).toMatchObject({ id: "agentic", name: "Agentic AI", done: 1, pct: 25, behind: 1 });
    expect(c.lessons.map((l) => [l.day, l.title, l.status])).toEqual([[1, "Intro", "done"], [2, "Prompts", "partial"], [3, "Tools", "today"], [4, "Graphs", "upcoming"]]);
    expect(c.current?.day).toBe(3);
    expect(c.next?.day).toBe(3);
    expect(c.lessons[0].minutes).toBe(90);
  });
});
