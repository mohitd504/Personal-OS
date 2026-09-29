// Builds a time-ordered agenda for one day from the existing stores:
//   pos_plan_<date>  { exSessions[], studyList[], meals{breakfast,lunch,dinner}, journal }
//   pos_nutri_<date> { meals[], water }   pos_health   pos_workouts
// Pure functions (data in, view model out) so they can be unit-tested.

export type Exercise = { name: string; sets?: string | number; reps?: string | number; weight?: string | number; note?: string };
export type Session = { id?: string; time?: string; type: string; done?: boolean; steps?: string; distance?: string; duration?: string; detail?: string; selected?: Exercise[] };
export type StudyTask = { time?: string; task: string; done?: boolean };
export type StudyItem = { id?: string; courseId?: string; label: string; hours?: string; brief?: string; resource?: string; pdf?: string; video?: string; courseVideo?: string; plan?: StudyTask[] };
export type Meal = { name?: string; cal?: number | string; protein?: number | string };
export type Plan = { exSessions: Session[]; studyList: StudyItem[]; meals: { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[] }; journal?: string };

export type AgendaItem =
  | { kind: "session"; key: string; sort: number; time: string | null; done: boolean; session: Session; index: number; minutes: number }
  | { kind: "study"; key: string; sort: number; time: null; done: boolean; study: StudyItem; index: number; minutes: number; tasksDone: number }
  | { kind: "meal"; key: string; sort: number; time: null; done: boolean; slot: "breakfast" | "lunch" | "dinner"; items: Meal[]; kcal: number; protein: number };

// Typical order for untimed items: breakfast before study, lunch mid-day, dinner late.
const MEAL_SORT = { breakfast: 8 * 60, lunch: 13 * 60 + 30, dinner: 20 * 60 + 30 };
const STUDY_SORT = 9 * 60; // study blocks sit after breakfast, in plan order

export const toMinutes = (t?: string | null) => {
  const m = String(t || "").match(/^(\d{1,2}):(\d{2})/);
  return m ? +m[1] * 60 + +m[2] : null;
};
export const minutesOf = (t?: string) => { const m = String(t || "").match(/(\d+)\s*(h|hr|hour)?/i); if (!m) return 0; return m[2] ? +m[1] * 60 : +m[1]; };
export const num = (v: unknown) => (Number.isFinite(+(v as number)) ? +(v as number) : 0);

// Rough session length: ~2.5 min per working set incl. rest, plus warm-up; walks by steps.
export function sessionMinutes(s: Session) {
  if (num(s.duration)) return num(s.duration);
  const sets = (s.selected || []).reduce((a, x) => a + (num(x.sets) || 3), 0);
  if (sets) return Math.round(sets * 2.5 + 10);
  if (num(s.steps)) return Math.round(num(s.steps) / 110);
  return 30;
}

export function buildAgenda(plan: Plan): AgendaItem[] {
  const items: AgendaItem[] = [];
  plan.exSessions.forEach((session, index) => {
    const t = toMinutes(session.time);
    items.push({ kind: "session", key: `s-${session.id || index}`, sort: t ?? 17 * 60, time: t == null ? null : session.time!.slice(0, 5), done: !!session.done, session, index, minutes: sessionMinutes(session) });
  });
  plan.studyList.forEach((study, index) => {
    const tasks = study.plan || [];
    const tasksDone = tasks.filter((x) => x.done).length;
    const minutes = tasks.reduce((a, x) => a + minutesOf(x.time), 0) || Math.round(num(study.hours) * 60);
    items.push({ kind: "study", key: `st-${study.id || index}`, sort: STUDY_SORT + index / 10, time: null, done: tasks.length > 0 && tasksDone === tasks.length, study, index, minutes, tasksDone });
  });
  (["breakfast", "lunch", "dinner"] as const).forEach((slot) => {
    const list = plan.meals?.[slot] || [];
    if (!list.length) return;
    items.push({ kind: "meal", key: `m-${slot}`, sort: MEAL_SORT[slot], time: null, done: false, slot, items: list, kcal: list.reduce((a, x) => a + num(x.cal), 0), protein: list.reduce((a, x) => a + num(x.protein), 0) });
  });
  return items.sort((a, b) => a.sort - b.sort);
}

// The next thing to do: first unfinished timed item still ahead (or overdue today),
// otherwise the first unfinished study block, otherwise the first unfinished item.
export function nextUp(items: AgendaItem[], nowMin: number): AgendaItem | null {
  const open = items.filter((x) => x.kind !== "meal" && !x.done);
  const timedAhead = open.find((x) => x.time != null && (toMinutes(x.time) ?? 0) >= nowMin - 30);
  const study = open.find((x) => x.kind === "study");
  if (timedAhead && study) return (toMinutes(timedAhead.time) ?? 0) - nowMin <= 60 ? timedAhead : study;
  return timedAhead || study || open[0] || null;
}

export function dayProgress(items: AgendaItem[]) {
  let done = 0, total = 0;
  for (const x of items) {
    if (x.kind === "study") { total += (x.study.plan || []).length || 1; done += x.tasksDone; }
    else if (x.kind === "session") { total += 1; done += x.done ? 1 : 0; }
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export const COURSE_META: Record<string, { name: string; icon: string; color: string }> = {
  agentic: { name: "Agentic AI", icon: "🤖", color: "#a855f7" },
  sysdesign: { name: "System Design", icon: "🗄️", color: "#06b6d4" },
  dsa: { name: "DSA", icon: "🧩", color: "#f59e0b" },
};
export const courseOf = (s: StudyItem) => COURSE_META[s.courseId || ""] || { name: "Study", icon: "📚", color: "#3b82f6" };
export const lessonTitle = (label: string) => label.replace(/^(SD |DSA )?Day \d+:\s*/, "");
export const dayNumber = (label: string) => (label.match(/Day (\d+)/) || [])[1] || null;
export const firstUrl = (s?: string) => (String(s || "").match(/https?:\/\/\S+/) || [])[0] || null;

export function greeting(hour: number) { return hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; }
export function fmtDuration(min: number) { if (!min) return ""; const h = Math.floor(min / 60), m = min % 60; return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`; }
