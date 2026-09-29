"use client";
import { useMemo, useState } from "react";
import { addDays, localDate, readStore, studySessions, subjectsFor, writeStore, type StudySubject } from "@/lib/study";
import { courseOf, dayNumber, firstUrl, fmtDuration, lessonTitle, minutesOf } from "@/components/features/today/day-model";
import { buildCourses, type Course } from "./study-model";
import { FocusTimer } from "./StudyDashboard";

// Today's lessons in full detail: course progress, per-lesson brief, resources,
// timed tasks with a focus timer for each, and today's focus time.
export default function StudyToday({ date, setDate, onRefresh, onOpenRoadmap }: { date: string; setDate: (d: string) => void; onRefresh: () => void; onOpenRoadmap: (courseId: string) => void }) {
  const [rev, setRev] = useState(0);
  const [focus, setFocus] = useState<{ subject: string; task: string; minutes: number } | null>(null);
  const today = localDate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const subjects = useMemo(() => subjectsFor(date), [date, rev]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const courses = useMemo(() => buildCourses((k) => localStorage.getItem(k), today), [today, rev]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const focusMin = useMemo(() => studySessions().filter((s) => s.date === date).reduce((a, s) => a + s.minutes, 0), [date, rev]);

  const allTasks = subjects.flatMap((s) => s.plan || []);
  const doneTasks = allTasks.filter((t) => t.done).length;
  const plannedMin = allTasks.reduce((a, t) => a + minutesOf(t.time), 0);

  const update = (id: string, fn: (s: StudySubject) => StudySubject) => {
    const plan = readStore<any>(`pos_plan_${date}`, {});
    plan.studyList = (plan.studyList || []).map((s: StudySubject) => (s.id === id ? fn(s) : s));
    writeStore(`pos_plan_${date}`, plan); setRev((r) => r + 1); onRefresh();
  };
  const toggleTask = (s: StudySubject, i: number) => update(s.id, (x) => ({ ...x, plan: (x.plan || []).map((t, j) => j !== i ? t : { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }) }));
  const completeAll = (s: StudySubject, done: boolean) => update(s.id, (x) => ({ ...x, plan: (x.plan || []).map((t) => ({ ...t, done, completedAt: done ? t.completedAt || new Date().toISOString() : undefined })) }));

  return (
    <div className="st">
      <section className="st-head">
        <div>
          <div className="st-head__nav">
            <button className="btn ghost sm" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">‹</button>
            <input className="in" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Study date" />
            <button className="btn ghost sm" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">›</button>
            {date !== today && <button className="btn ghost sm" onClick={() => setDate(today)}>Today</button>}
          </div>
          <h2>{date === today ? "Today's study" : new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</h2>
          <p className="muted">{subjects.length ? `${subjects.length} lesson${subjects.length > 1 ? "s" : ""} · ${fmtDuration(plannedMin)} planned · ${doneTasks}/${allTasks.length} tasks done` : "Nothing scheduled for this day."}</p>
        </div>
        <div className="st-head__stats">
          <div className="st-stat"><span>Tasks</span><b>{doneTasks}<small>/{allTasks.length}</small></b></div>
          <div className="st-stat"><span>Focus time</span><b>{fmtDuration(focusMin) || "0m"}</b></div>
          <div className="st-stat"><span>Planned</span><b>{fmtDuration(plannedMin) || "—"}</b></div>
        </div>
      </section>

      <section className="course-strip">
        {courses.filter((c) => c.id !== "other").map((c) => <CourseCard key={c.id} c={c} onOpen={() => onOpenRoadmap(c.id)} />)}
      </section>

      {subjects.length ? subjects.map((s) => {
        const c = courseOf(s), tasks = s.plan || [], dn = dayNumber(s.label), done = tasks.filter((t) => t.done).length, all = tasks.length > 0 && done === tasks.length;
        const res = firstUrl(s.resource);
        return (
          <article key={s.id} className={`lesson${all ? " is-done" : ""}`} style={{ ["--accent" as any]: c.color }}>
            <header className="lesson__head">
              <span className="lesson__icon" aria-hidden>{c.icon}</span>
              <div className="lesson__title">
                <span className="course-tag">{c.name}{dn ? ` · Day ${dn}` : ""}</span>
                <h3>{lessonTitle(s.label)}</h3>
                <div className="tl-meta">{done}/{tasks.length} tasks · {fmtDuration(tasks.reduce((a, t) => a + minutesOf(t.time), 0))}</div>
              </div>
              <div className="lesson__ring"><div className="ring sm" style={{ ["--p" as any]: tasks.length ? Math.round((done / tasks.length) * 100) : 0, ["--c" as any]: c.color }}><div className="rc"><b>{tasks.length ? Math.round((done / tasks.length) * 100) : 0}%</b></div></div></div>
            </header>
            {s.brief && <p className="lesson__brief">{s.brief}</p>}
            <div className="lesson__res">
              {s.pdf && <a className="res" href={s.pdf} target="_blank" rel="noreferrer"><span>📄</span><div><b>PDF notes</b><small>Day {dn} handout</small></div></a>}
              {s.courseVideo && <a className="res" href={s.courseVideo} target="_blank" rel="noreferrer"><span>{s.courseId === "dsa" ? "📖" : "▶"}</span><div><b>{s.courseId === "dsa" ? "Textbook" : "Video"}</b><small>{(s as any).video ? String((s as any).video).replace(/^[▶📖]\s*/u, "").slice(0, 60) : "Open"}</small></div></a>}
              {res && <a className="res" href={res} target="_blank" rel="noreferrer"><span>🔗</span><div><b>Resource</b><small>{res.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}</small></div></a>}
            </div>
            <ol className="lesson__tasks">
              {tasks.map((t, i) => (
                <li key={i} className={t.done ? "done" : ""}>
                  <button className="check" onClick={() => toggleTask(s, i)} aria-pressed={!!t.done} aria-label={t.done ? "Mark not done" : "Mark done"}>{t.done ? "✓" : ""}</button>
                  <div className="lesson__task"><span>{t.task}</span>{t.time && <small>⏱ {t.time}</small>}</div>
                  {!t.done && <button className="btn ghost sm" onClick={() => setFocus({ subject: lessonTitle(s.label), task: t.task, minutes: minutesOf(t.time) || 25 })}>▶ Focus</button>}
                </li>
              ))}
            </ol>
            <footer className="lesson__foot">
              <button className={`btn sm ${all ? "ghost" : ""}`} onClick={() => completeAll(s, !all)}>{all ? "↺ Reopen lesson" : "✓ Mark lesson complete"}</button>
              <button className="btn ghost sm" onClick={() => onOpenRoadmap(s.courseId || "other")}>🗺️ Course roadmap</button>
            </footer>
          </article>
        );
      }) : <div className="step-card td-empty"><b>No lessons on this day</b><span>Pick another date, or add a subject in Study Plan.</span></div>}

      {focus && <FocusTimer {...focus} onClose={() => setFocus(null)} onSaved={() => { setRev((r) => r + 1); onRefresh(); }} />}
    </div>
  );
}

function CourseCard({ c, onOpen }: { c: Course; onOpen: () => void }) {
  const at = c.current || c.next;
  return (
    <button className="course-card" onClick={onOpen} style={{ ["--accent" as any]: c.color }}>
      <div className="course-card__top"><span className="course-card__icon" aria-hidden>{c.icon}</span><div><b>{c.name}</b><small>{c.done}/{c.lessons.length} days complete</small></div><span className="course-card__pct">{c.pct}%</span></div>
      <div className="mini-bar"><i style={{ width: `${c.pct}%` }} /></div>
      <div className="course-card__next">{at ? <><span>{c.current ? "Today" : "Next"} · Day {at.day}</span>{at.title}</> : <span>Course finished 🎉</span>}</div>
      {c.behind > 0 && <div className="course-card__behind">{c.behind} day{c.behind > 1 ? "s" : ""} to catch up</div>}
    </button>
  );
}
