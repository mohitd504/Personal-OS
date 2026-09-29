"use client";
import { useMemo, useState } from "react";
import { localDate } from "@/lib/study";
import { fmtDuration } from "@/components/features/today/day-model";
import { buildCourses, type LessonStatus } from "./study-model";

const LABEL: Record<LessonStatus, string> = { done: "Done", partial: "Started", missed: "Missed", today: "Today", upcoming: "Upcoming" };

// Every lesson of a course, week by week, with status. Click a lesson to open that day.
export default function Roadmap({ initial, onOpenDay }: { initial?: string | null; onOpenDay: (date: string) => void }) {
  const today = localDate();
  const courses = useMemo(() => buildCourses((k) => localStorage.getItem(k), today), [today]);
  const [sel, setSel] = useState(initial && courses.some((c) => c.id === initial) ? initial : courses[0]?.id);
  const [filter, setFilter] = useState<"all" | "open">("all");
  const course = courses.find((c) => c.id === sel);
  if (!course) return <div className="step-card td-empty"><b>No courses scheduled yet</b><span>Courses appear here once they are seeded in Study Plan.</span></div>;

  const lessons = course.lessons.filter((l) => filter === "all" || l.status !== "done");
  const weeks: typeof lessons[] = [];
  lessons.forEach((l, i) => { const w = Math.floor(i / 7); (weeks[w] ||= []).push(l); });
  const totalMin = course.lessons.reduce((a, l) => a + l.minutes, 0);
  const endDate = course.lessons[course.lessons.length - 1]?.date;

  return (
    <div className="stack">
      <div className="tabbar" role="tablist" aria-label="Courses">
        {courses.map((c) => <button key={c.id} role="tab" aria-selected={c.id === sel} className={`tabbar__tab${c.id === sel ? " on" : ""}`} onClick={() => setSel(c.id)}>{c.icon} {c.name}</button>)}
      </div>
      <section className="roadmap-hero" style={{ ["--accent" as any]: course.color }}>
        <div className="ring" style={{ ["--p" as any]: course.pct, ["--c" as any]: course.color }}><div className="rc"><b>{course.pct}%</b><small>complete</small></div></div>
        <div className="roadmap-hero__body">
          <h2>{course.icon} {course.name}</h2>
          <p className="muted">{course.lessons.length} lessons · about {fmtDuration(totalMin)} of study · ends {endDate ? new Date(`${endDate}T12:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—"}</p>
          <div className="roadmap-hero__stats">
            <span><b>{course.done}</b> done</span>
            <span><b>{course.lessons.filter((l) => l.status === "partial").length}</b> started</span>
            <span className={course.behind ? "warn" : ""}><b>{course.lessons.filter((l) => l.status === "missed").length}</b> missed</span>
            <span><b>{course.lessons.filter((l) => l.status === "upcoming" || l.status === "today").length}</b> to go</span>
          </div>
          {course.next && <button className="btn sm" onClick={() => onOpenDay(course.next!.date)}>▶ {course.current && course.current.status !== "done" ? "Continue today" : `Next: Day ${course.next.day}`}</button>}
        </div>
        <label className="toggle muted"><input type="checkbox" checked={filter === "open"} onChange={(e) => setFilter(e.target.checked ? "open" : "all")} /> Hide completed</label>
      </section>
      {weeks.map((w, wi) => (
        <section key={wi} className="step-card">
          <div className="between"><h3 className="td-h2">Week {wi + 1}</h3><span className="muted">{w.filter((l) => l.status === "done").length}/{w.length} done</span></div>
          <ol className="road">
            {w.map((l) => (
              <li key={l.date}>
                <button className={`road__item is-${l.status}`} onClick={() => onOpenDay(l.date)} style={{ ["--accent" as any]: course.color }}>
                  <span className="road__day">{l.day || "•"}</span>
                  <span className="road__body"><b>{l.title}</b><small>{new Date(`${l.date}T12:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · {l.tasksDone}/{l.tasks} tasks · {fmtDuration(l.minutes)}</small></span>
                  <span className={`road__status is-${l.status}`}>{LABEL[l.status]}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
