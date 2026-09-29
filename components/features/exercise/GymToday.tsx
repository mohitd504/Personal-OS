"use client";
import { useMemo, useState } from "react";
import { readJson } from "@/lib/client-storage";
import { loadPlan, planKey, SESS_EMOJI } from "@/components/dashboard/data";
import { SPLIT_VISUAL, exerciseSetup } from "@/components/fitness/data";
import { demoLink, exEmoji, HOWTO } from "@/lib/exercise-guide";
import { fmtDuration, num, sessionMinutes } from "@/components/features/today/day-model";
import { exerciseHistory, muscleFocus, suggestion, weekStats, type Workout } from "./gym-model";

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const SPLIT_COLOR: Record<string, string> = { Push: "#3b82f6", Pull: "#a855f7", Legs: "#10b981", Arms: "#f59e0b", Rest: "#64748b", Cardio: "#ef4444", HIIT: "#f97316", Yoga: "#06b6d4" };

export default function GymToday({ onOpenTracker }: { onOpenTracker: () => void }) {
  const [rev, setRev] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const today = dstr(new Date());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo(() => loadPlan(today), [today, rev]);
  const workouts = useMemo(() => readJson<Workout[]>("pos_workouts", []), []);
  const health = useMemo(() => readJson<any>("pos_health", {}), []);
  const gymIdx = plan.exSessions.findIndex((s: any) => !/walk/i.test(s.type) && s.type !== "Rest");
  const gym = gymIdx >= 0 ? plan.exSessions[gymIdx] : null;
  const walk = plan.exSessions.find((s: any) => /walk/i.test(s.type));
  const exercises: any[] = gym?.selected || [];
  const color = SPLIT_COLOR[gym?.type] || "#8b5cf6";
  const totalSets = exercises.reduce((a, x) => a + (num(x.sets) || 3), 0);
  const focus = muscleFocus(exercises.map((x) => exerciseSetup(x.name).target)).slice(0, 5);
  const lastSame = gym ? workouts.filter((w) => w.type === gym.type).sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const stats = weekStats(workouts, today);

  const cycle = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const p = loadPlan(dstr(d)); const g = p.exSessions.find((s: any) => !/walk/i.test(s.type));
    return { d, type: g?.type || "Rest", count: (g?.selected || []).length, done: !!g?.done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rev]);

  const toggleDone = (i: number) => {
    const p = loadPlan(today); p.exSessions = p.exSessions.map((s: any, j: number) => (j === i ? { ...s, done: !s.done } : s));
    localStorage.setItem(planKey(today), JSON.stringify(p)); setRev((r) => r + 1);
  };

  const sleep = num(health.sleepH), recovery = num(health.recovery);
  const advice = !recovery && !sleep ? "Sync your watch in Health to get a readiness check." : recovery >= 75 && sleep >= 7 ? "You're well recovered — go for the suggested weights." : recovery >= 50 ? "Moderate recovery — keep the weights, drop 1 set per exercise if it feels heavy." : "Low recovery — do a lighter technique session or a long walk today.";

  return (
    <div className="gym">
      <section className="gym-hero" style={{ ["--accent" as any]: color }}>
        {/* Small local .webp; plain <img> avoids spending Vercel image-optimisation quota. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {gym && SPLIT_VISUAL[gym.type] && <img className="gym-hero__img" src={SPLIT_VISUAL[gym.type]} alt="" />}
        <div className="gym-hero__body">
          <div className="td-chips">
            <span className="pill pill--violet">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</span>
            {gym?.time && <span className="pill">⏰ {gym.time}</span>}
            {gym?.done && <span className="pill pill--ok">✓ Done</span>}
          </div>
          <h2>{gym ? `${SESS_EMOJI[gym.type] || "🏋️"} ${gym.type} day` : "😴 Rest & recover"}</h2>
          {gym ? (
            <>
              <div className="gym-hero__facts">
                <span><b>{exercises.length}</b> exercises</span><span><b>{totalSets}</b> sets</span><span><b>~{fmtDuration(sessionMinutes(gym))}</b></span>
                {lastSame && <span>last {gym.type}: <b>{new Date(`${lastSame.date}T12:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</b>{lastSame.volume ? ` · ${Math.round(lastSame.volume).toLocaleString()} kg` : ""}</span>}
              </div>
              {focus.length > 0 && <div className="chips">{focus.map((m) => <span key={m.name} className="chip-tag gym-chip">{m.name}</span>)}</div>}
              <div className="row wrap"><button className="btn" onClick={onOpenTracker}>▶ {gym.done ? "Review workout" : "Start workout"}</button><button className="btn ghost" onClick={() => toggleDone(gymIdx)}>{gym.done ? "↺ Mark not done" : "✓ Mark done"}</button></div>
            </>
          ) : <p className="muted">No gym session today. A walk, mobility work and good sleep make tomorrow&apos;s session better.</p>}
        </div>
      </section>

      <div className="gym-grid">
        <div className="stack">
          {walk && (
            <section className="step-card gym-walk">
              <span className="gym-walk__icon" aria-hidden>🚶</span>
              <div className="gym-walk__body">
                <b>Walk{walk.time ? ` · ${walk.time}` : ""}</b>
                <div className="between"><small className="muted">{num(health.steps).toLocaleString()} / {(num(walk.steps) || 10000).toLocaleString()} steps</small><small className="muted">{Math.min(100, Math.round((num(health.steps) / (num(walk.steps) || 10000)) * 100))}%</small></div>
                <div className="mini-bar" style={{ ["--accent" as any]: "#22c55e" }}><i style={{ width: `${Math.min(100, (num(health.steps) / (num(walk.steps) || 10000)) * 100)}%` }} /></div>
              </div>
              <button className="btn ghost sm" onClick={() => toggleDone(plan.exSessions.indexOf(walk))}>{walk.done ? "✓ Done" : "Mark done"}</button>
            </section>
          )}

          {exercises.length > 0 && (
            <section className="step-card">
              <div className="between wrap"><h3 className="td-h2">Today&apos;s exercises</h3><span className="muted">Tap an exercise for setup & form</span></div>
              <ol className="exlist">
                {exercises.map((x, i) => {
                  const sets = num(x.sets) || 3, reps = num(x.reps) || 10;
                  const h = exerciseHistory(x.name, workouts), sug = suggestion(h, reps, sets), setup = exerciseSetup(x.name), expanded = open === i;
                  return (
                    <li key={i} className={`exc${expanded ? " open" : ""}`} style={{ ["--accent" as any]: color }}>
                      <button className="exc__head" onClick={() => setOpen(expanded ? null : i)} aria-expanded={expanded}>
                        <span className="exc__num">{i + 1}</span>
                        <span className="exc__name"><b>{exEmoji(x.name)} {x.name}</b><small>{setup.target}</small></span>
                        <span className="exc__target"><b>{sets} × {reps}</b><small>{num(x.weight) ? `@ ${num(x.weight)} kg` : "sets × reps"}</small></span>
                        <span className={`exc__sug is-${sug.kind}`}>{sug.kind === "up" ? `↑ ${sug.weight} kg` : sug.kind === "repeat" ? `= ${sug.weight} kg` : "new"}</span>
                      </button>
                      {expanded && (
                        <div className="exc__body">
                          <div className="exc__stats">
                            <div><span>Last time</span><b>{h ? (h.sets.length ? h.sets.map((s) => `${s.w}×${s.r}`).join(" · ") : `${h.topWeight} kg`) : "—"}</b><small>{h ? new Date(`${h.date}T12:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "No history yet"}{h?.missedSets ? ` · ${h.missedSets} missed` : ""}</small></div>
                            <div><span>Best</span><b>{h?.best ? `${h.best} kg` : "—"}</b><small>{h ? `${h.sessions} session${h.sessions > 1 ? "s" : ""}` : ""}</small></div>
                            <div className={`is-${sug.kind}`}><span>Today</span><b>{sug.weight ? `${sug.weight} kg` : "Set a baseline"}</b><small>{sug.text}</small></div>
                          </div>
                          <div className="exercise-guide">
                            <div className="exercise-guide__item"><span>Machine / setup</span><b>{setup.machine}</b></div>
                            <div className="exercise-guide__item"><span>Movement</span><b>{setup.pattern}</b></div>
                            <div className="exercise-guide__item"><span>Muscles</span><b>{setup.target}</b></div>
                            <div className="exercise-guide__cue"><span>FORM CUE</span>{setup.cue}</div>
                          </div>
                          {HOWTO[x.name] && <div className="exercise-howto"><b>How to do it</b>{HOWTO[x.name]}</div>}
                          <div className="row wrap"><a className="btn ghost sm" href={demoLink(x.name)} target="_blank" rel="noreferrer">▶ Watch form demo</a>{x.note && <span className="muted">📝 {x.note}</span>}</div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        <aside className="stack">
          <section className="step-card">
            <h3 className="td-h2">Split cycle</h3>
            <div className="cycle">
              {cycle.map((c, i) => (
                <div key={i} className={`cycle__day${i === 0 ? " today" : ""}${c.done ? " done" : ""}`} style={{ ["--accent" as any]: SPLIT_COLOR[c.type] || "#64748b" }}>
                  <span className="cycle__dow">{i === 0 ? "Today" : c.d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span className="cycle__icon" aria-hidden>{SESS_EMOJI[c.type] || "🏋️"}</span>
                  <b>{c.type}</b>
                  <small>{c.count ? `${c.count} ex` : "recover"}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="step-card">
            <h3 className="td-h2">This week</h3>
            <div className="gym-week">
              <div><span>Sessions</span><b>{stats.sessions}</b></div>
              <div><span>Volume</span><b>{stats.volume ? `${(stats.volume / 1000).toFixed(1)}t` : "—"}</b></div>
              <div><span>Time</span><b>{stats.minutes ? fmtDuration(stats.minutes) : "—"}</b></div>
            </div>
          </section>
          <section className="step-card">
            <h3 className="td-h2">Readiness</h3>
            <div className="gym-week">
              <div><span>Recovery</span><b>{recovery ? `${recovery}%` : "—"}</b></div>
              <div><span>Sleep</span><b>{sleep ? `${sleep} h` : "—"}</b></div>
              <div><span>Resting HR</span><b>{health.restingHR || "—"}</b></div>
            </div>
            <p className="hint">{advice}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
