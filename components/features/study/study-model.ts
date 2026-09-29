// Course roadmap model: every seeded lesson per course, with status, built from the
// existing pos_plan_<date>.studyList entries. Pure (takes a reader) so it's testable.
import { COURSE_META, dayNumber, lessonTitle, minutesOf } from "@/components/features/today/day-model";
import type { StudySubject } from "@/lib/study";

export type LessonStatus = "done" | "partial" | "missed" | "today" | "upcoming";
export type Lesson = { date: string; day: number; title: string; subject: StudySubject; tasksDone: number; tasks: number; minutes: number; status: LessonStatus };
export type Course = { id: string; name: string; icon: string; color: string; lessons: Lesson[]; done: number; pct: number; current: Lesson | null; next: Lesson | null; behind: number };

const ds = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function lessonStatus(date: string, today: string, tasksDone: number, tasks: number): LessonStatus {
  if (tasks > 0 && tasksDone === tasks) return "done";
  if (date === today) return "today";
  if (date > today) return "upcoming";
  return tasksDone > 0 ? "partial" : "missed";
}

export function buildCourses(read: (key: string) => string | null, today: string, back = 200, forward = 260): Course[] {
  const byCourse = new Map<string, Lesson[]>();
  const start = new Date(`${today}T12:00`); start.setDate(start.getDate() - back);
  for (let i = 0; i <= back + forward; i += 1) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const date = ds(d);
    let plan: any = null;
    try { plan = JSON.parse(read(`pos_plan_${date}`) || "null"); } catch {}
    const list: StudySubject[] = Array.isArray(plan?.studyList) ? plan.studyList : [];
    for (const subject of list) {
      const id = subject.courseId && COURSE_META[subject.courseId] ? subject.courseId : "other";
      const tasks = subject.plan || [];
      const tasksDone = tasks.filter((t) => t.done).length;
      const lesson: Lesson = {
        date, day: +(dayNumber(subject.label) || 0), title: lessonTitle(subject.label), subject, tasksDone, tasks: tasks.length,
        minutes: tasks.reduce((a, t) => a + minutesOf(t.time), 0), status: lessonStatus(date, today, tasksDone, tasks.length),
      };
      if (!byCourse.has(id)) byCourse.set(id, []);
      byCourse.get(id)!.push(lesson);
    }
  }
  return [...byCourse.entries()].map(([id, lessons]) => {
    const meta = COURSE_META[id] || { name: "Other subjects", icon: "📚", color: "#3b82f6" };
    lessons.sort((a, b) => a.date.localeCompare(b.date));
    const done = lessons.filter((l) => l.status === "done").length;
    return {
      id, ...meta, lessons, done, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
      current: lessons.find((l) => l.date === today) || null,
      next: lessons.find((l) => l.date >= today && l.status !== "done") || null,
      behind: lessons.filter((l) => l.status === "missed" || l.status === "partial").length,
    };
  }).sort((a, b) => (a.id === "other" ? 1 : b.id === "other" ? -1 : 0));
}
