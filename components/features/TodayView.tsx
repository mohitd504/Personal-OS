"use client";
import { useEffect, useMemo, useState } from "react";
import type { AppSettings } from "@/lib/domain";
import { readJson } from "@/lib/client-storage";
import { loadPlan, planKey, SESS_EMOJI } from "@/components/dashboard/data";
import { buildAgenda, courseOf, dayProgress, fmtDuration, greeting, lessonTitle, nextUp, num, toMinutes, type AgendaItem, type Plan } from "./today/day-model";
import Agenda from "./today/AgendaTimeline";

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const pct = (v: number, goal: number) => Math.min(100, Math.round((v / Math.max(1, goal)) * 100));

export default function TodayView({ settings, onNavigate, tick }: { settings: AppSettings; onNavigate: (view: string) => void; tick: number }) {
  const [rev, setRev] = useState(0);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(id); }, []);
  const date = dstr(now);
  const refresh = () => setRev((r) => r + 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan: Plan = useMemo(() => loadPlan(date), [date, rev, tick]);
  const agenda = useMemo(() => buildAgenda(plan), [plan]);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = nextUp(agenda, nowMin);
  const progress = dayProgress(agenda);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nutrition = useMemo(() => readJson<any>(`pos_nutri_${date}`, { meals: [], water: 0 }), [date, rev, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const health = useMemo(() => readJson<any>("pos_health", {}), [rev, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const workouts = useMemo(() => readJson<any[]>("pos_workouts", []), [tick]);
  const meals = Array.isArray(nutrition.meals) ? nutrition.meals : [];
  const eaten = meals.reduce((a: any, m: any) => ({ cal: a.cal + num(m.cal), protein: a.protein + num(m.protein), carbs: a.carbs + num(m.carbs), fat: a.fat + num(m.fat) }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
  const steps = num(health.steps), sleep = num(health.sleepH), water = num(nutrition.water);

  const lastWeight = (name: string) => {
    for (const w of workouts) { const e = (w.exercises || []).find((x: any) => x.name === name); if (e && num(e.topWeight)) return num(e.topWeight); }
    return null;
  };

  const save = (next: Plan) => { localStorage.setItem(planKey(date), JSON.stringify(next)); refresh(); };
  const toggleTask = (si: number, ti: number) => save({ ...plan, studyList: plan.studyList.map((s, i) => i !== si ? s : { ...s, plan: (s.plan || []).map((t, j) => j !== ti ? t : { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined } as any) }) });
  const toggleSession = (idx: number) => save({ ...plan, exSessions: plan.exSessions.map((s, i) => i === idx ? { ...s, done: !s.done } : s) });

  const gym = plan.exSessions.find((s) => !/walk/i.test(s.type) && s.type !== "Rest");
  const studyMin = agenda.filter((x) => x.kind === "study").reduce((a, x) => a + (x as any).minutes, 0);
  const studyCount = plan.studyList.length;

  const metrics = [
    { k: "steps", icon: "🚶", label: "Steps", value: steps.toLocaleString(), goal: `${(settings.stepGoal || 10000).toLocaleString()}`, p: pct(steps, settings.stepGoal || 10000), color: "#22c55e", view: "health" },
    { k: "cal", icon: "🔥", label: "Calories", value: `${Math.round(eaten.cal)}`, goal: `${settings.calorieGoal} kcal`, p: pct(eaten.cal, settings.calorieGoal), color: "#f59e0b", view: "nutrition" },
    { k: "protein", icon: "💪", label: "Protein", value: `${Math.round(eaten.protein)} g`, goal: `${settings.proteinGoal} g`, p: pct(eaten.protein, settings.proteinGoal), color: "#a855f7", view: "nutrition" },
    { k: "water", icon: "💧", label: "Water", value: `${water} L`, goal: `${settings.waterGoal || 3} L`, p: pct(water, settings.waterGoal || 3), color: "#38bdf8", view: "nutrition" },
    { k: "sleep", icon: "😴", label: "Sleep", value: sleep ? `${sleep} h` : "—", goal: "8 h", p: pct(sleep, 8), color: "#818cf8", view: "health" },
  ];

  return (
    <div className="td">
      <section className="td-hero">
        <div className="td-hero__main">
          <div className="td-hero__date">{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1>{greeting(now.getHours())}, {settings.name || "there"} 👋</h1>
          <div className="td-chips">
            {gym && <span className="pill pill--violet">{SESS_EMOJI[gym.type] || "🏋️"} {gym.type} day{gym.time ? ` · ${gym.time}` : ""}</span>}
            {!gym && <span className="pill">😴 Rest day</span>}
            {studyCount > 0 && <span className="pill pill--sky">📚 {studyCount} lesson{studyCount > 1 ? "s" : ""} · {fmtDuration(studyMin)}</span>}
            <span className="pill pill--amber">🍽️ {settings.calorieGoal} kcal · {settings.proteinGoal} g protein</span>
          </div>
          <NextCard item={next} nowMin={nowMin} onNavigate={onNavigate} />
        </div>
        <div className="td-hero__ring">
          <div className="ring lg" style={{ ["--p" as any]: progress.pct, ["--c" as any]: "#3b82f6" }}>
            <div className="rc"><b>{progress.pct}%</b><small>{progress.done}/{progress.total} done</small></div>
          </div>
          <span className="muted">Today&apos;s plan</span>
        </div>
      </section>

      <section className="td-metrics">
        {metrics.map((m) => (
          <button key={m.k} className="td-metric" onClick={() => onNavigate(m.view)} style={{ ["--c" as any]: m.color }}>
            <div className="td-metric__top"><span>{m.icon} {m.label}</span><span className="td-metric__pct">{m.p}%</span></div>
            <b>{m.value}</b><small>of {m.goal}</small>
            <div className="td-metric__bar"><i style={{ width: `${m.p}%` }} /></div>
          </button>
        ))}
      </section>

      <div className="td-grid">
        <section className="step-card">
          <div className="between wrap"><div><h2 className="td-h2">Your day</h2><span className="muted">Tap any block for details</span></div><button className="btn ghost sm" onClick={() => onNavigate("goals")}>Edit plan</button></div>
          <Agenda items={agenda} nextKey={next?.key ?? null} lastWeight={lastWeight} stepsNow={steps} loggedMeals={meals.length}
            onToggleTask={toggleTask} onToggleSession={toggleSession} onNavigate={onNavigate} />
        </section>
        <aside className="td-side">
          <Priorities date={date} />
          <NutritionCard eaten={eaten} settings={settings} meals={meals} onNavigate={onNavigate} />
          <WeekAhead date={date} rev={rev + tick} onNavigate={onNavigate} />
          <Journal date={date} plan={plan} onSave={save} />
        </aside>
      </div>
    </div>
  );
}

function NextCard({ item, nowMin, onNavigate }: { item: AgendaItem | null; nowMin: number; onNavigate: (v: string) => void }) {
  if (!item) return <div className="td-next td-next--done"><span>🎉</span><div><b>Everything planned for today is done</b><small>Great work — log your meals and wind down.</small></div></div>;
  const t = item.time ? toMinutes(item.time) : null;
  const when = t == null ? "Anytime today" : t - nowMin > 0 ? `in ${fmtDuration(t - nowMin)} · ${item.time}` : t - nowMin > -30 ? "Now" : `Was at ${item.time}`;
  const title = item.kind === "session" ? (/walk/i.test(item.session.type) ? "Morning walk" : `${item.session.type} workout`) : item.kind === "study" ? lessonTitle(item.study.label) : "";
  const sub = item.kind === "study" ? `${courseOf(item.study).name} · ${item.tasksDone}/${(item.study.plan || []).length} tasks` : item.kind === "session" ? `${(item.session.selected || []).length || ""}${(item.session.selected || []).length ? " exercises · " : ""}~${fmtDuration(item.minutes)}` : "";
  const view = item.kind === "study" ? "study" : item.kind === "session" && !/walk/i.test(item.session.type) ? "exercise" : "health";
  return (
    <div className="td-next">
      <div className="td-next__label">Up next <span>{when}</span></div>
      <div className="td-next__row"><div><b>{title}</b><small>{sub}</small></div><button className="btn sm" onClick={() => onNavigate(view)}>Start →</button></div>
    </div>
  );
}

function Priorities({ date }: { date: string }) {
  const key = `pos_priorities_${date}`;
  const [items, setItems] = useState<{ text: string; done: boolean }[]>(() => readJson(key, []));
  useEffect(() => { setItems(readJson(key, [])); }, [key]);
  const save = (next: { text: string; done: boolean }[]) => { setItems(next); localStorage.setItem(key, JSON.stringify(next)); };
  const set = (i: number, patch: Partial<{ text: string; done: boolean }>) => { const next = [0, 1, 2].map((j) => items[j] || { text: "", done: false }); next[i] = { ...next[i], ...patch }; save(next); };
  const done = items.filter((x) => x?.done && x.text).length;
  return (
    <section className="step-card">
      <div className="between"><h2 className="td-h2">Top 3 priorities</h2><span className="muted">{done}/3</span></div>
      <div className="prio">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`prio__row${items[i]?.done ? " done" : ""}`}>
            <button className="check" onClick={() => set(i, { done: !items[i]?.done })} aria-pressed={!!items[i]?.done} aria-label={`Priority ${i + 1} done`}>{items[i]?.done ? "✓" : i + 1}</button>
            <input className="prio__input" value={items[i]?.text || ""} onChange={(e) => set(i, { text: e.target.value })} placeholder={["The one thing that matters most", "Second most important", "Third"][i]} aria-label={`Priority ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

function NutritionCard({ eaten, settings, meals, onNavigate }: { eaten: { cal: number; protein: number; carbs: number; fat: number }; settings: AppSettings; meals: any[]; onNavigate: (v: string) => void }) {
  const left = Math.max(0, settings.calorieGoal - eaten.cal);
  const macros = [
    { l: "Protein", v: eaten.protein, g: settings.proteinGoal, c: "#a855f7" },
    { l: "Carbs", v: eaten.carbs, g: settings.carbGoal, c: "#f59e0b" },
    { l: "Fat", v: eaten.fat, g: settings.fatGoal, c: "#ec4899" },
  ];
  return (
    <section className="step-card">
      <div className="between"><h2 className="td-h2">Fuel</h2><button className="btn ghost sm" onClick={() => onNavigate("nutrition")}>＋ Log food</button></div>
      <div className="fuel">
        <div className="ring sm" style={{ ["--p" as any]: pct(eaten.cal, settings.calorieGoal), ["--c" as any]: "#f59e0b" }}><div className="rc"><b>{Math.round(left)}</b><small>kcal left</small></div></div>
        <div className="fuel__macros">{macros.map((m) => (
          <div key={m.l}><div className="between"><span>{m.l}</span><span className="muted">{Math.round(m.v)}/{m.g || "—"} g</span></div><div className="mini-bar"><i style={{ width: `${pct(m.v, m.g || 1)}%`, background: m.c }} /></div></div>
        ))}</div>
      </div>
      {meals.length > 0 && <ul className="meal-list">{meals.slice(-3).map((m: any, i: number) => <li key={i}><span>{m.time ? <span className="muted">{m.time} · </span> : null}{m.name}</span><span className="muted">{num(m.cal)} kcal</span></li>)}</ul>}
    </section>
  );
}

function WeekAhead({ date, rev, onNavigate }: { date: string; rev: number; onNavigate: (v: string) => void }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${date}T12:00`); d.setDate(d.getDate() + i);
    const ds = dstr(d); const p = loadPlan(ds);
    const gym = p.exSessions.find((s: any) => !/walk/i.test(s.type));
    const tasks = p.studyList.flatMap((s: any) => s.plan || []);
    return { ds, d, gym: gym?.type || "Rest", study: p.studyList.length, pct: tasks.length ? Math.round((tasks.filter((t: any) => t.done).length / tasks.length) * 100) : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [date, rev]);
  return (
    <section className="step-card">
      <div className="between"><h2 className="td-h2">Week ahead</h2><button className="btn ghost sm" onClick={() => onNavigate("calendar")}>Calendar</button></div>
      <div className="week">
        {days.map((x, i) => (
          <div key={x.ds} className={`week__day${i === 0 ? " today" : ""}`} title={`${x.ds}: ${x.gym}, ${x.study} lessons`}>
            <span className="week__dow">{i === 0 ? "Today" : x.d.toLocaleDateString(undefined, { weekday: "short" })}</span>
            <span className="week__icon" aria-hidden>{SESS_EMOJI[x.gym] || "🏋️"}</span>
            <span className="week__type">{x.gym}</span>
            <span className="week__study">📚 {x.study}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Journal({ date, plan, onSave }: { date: string; plan: Plan; onSave: (p: Plan) => void }) {
  const [text, setText] = useState(plan.journal || "");
  useEffect(() => { setText(plan.journal || ""); }, [date, plan.journal]);
  return (
    <section className="step-card">
      <div className="between"><h2 className="td-h2">Journal</h2><span className="muted">{text.trim() ? "Saved" : "One line is enough"}</span></div>
      <textarea className="in td-journal" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== (plan.journal || "") && onSave({ ...plan, journal: text })}
        placeholder="How did today go? What will you do better tomorrow?" aria-label="Journal" />
    </section>
  );
}
