"use client";
import { useState } from "react";
import { SESS_EMOJI } from "@/components/dashboard/data";
import { exEmoji, HOWTO } from "@/lib/exercise-guide";
import { courseOf, dayNumber, firstUrl, fmtDuration, lessonTitle, num, type AgendaItem } from "./day-model";

const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" } as const;
const MEAL_ICON = { breakfast: "🥣", lunch: "🍛", dinner: "🍽️" } as const;

export default function Agenda({ items, nextKey, lastWeight, stepsNow, loggedMeals, onToggleTask, onToggleSession, onNavigate }: {
  items: AgendaItem[]; nextKey: string | null; lastWeight: (name: string) => number | null; stepsNow: number;
  loggedMeals: number; onToggleTask: (studyIndex: number, taskIndex: number) => void; onToggleSession: (index: number) => void; onNavigate: (view: string) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (k: string) => open[k] ?? k === nextKey;
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !isOpen(k) }));

  if (!items.length) return (
    <div className="td-empty"><b>Nothing planned for today</b><span>Open Goals to plan workouts, meals and study.</span><button className="btn sm" onClick={() => onNavigate("goals")}>Plan my day</button></div>
  );

  return (
    <ol className="timeline">
      {items.map((it) => {
        const k = it.key, expanded = isOpen(k), next = k === nextKey;
        const cls = `tl-item tl-item--${it.kind}${it.done ? " is-done" : ""}${next ? " is-next" : ""}`;
        if (it.kind === "session") {
          const s = it.session, walk = /walk/i.test(s.type), ex = s.selected || [];
          const stepGoal = num(s.steps);
          return (
            <li key={k} className={cls}>
              <div className="tl-time">{it.time || "—"}</div>
              <div className="tl-dot" aria-hidden>{it.done ? "✓" : SESS_EMOJI[s.type] || "🏋️"}</div>
              <div className="tl-card">
                <button className="tl-head" onClick={() => toggle(k)} aria-expanded={expanded}>
                  <div className="tl-title"><b>{walk ? "Morning walk" : `${s.type} workout`}</b>{next && <span className="pill pill--next">Up next</span>}</div>
                  <div className="tl-meta">
                    {walk ? `${stepGoal ? stepGoal.toLocaleString() + " steps · " : ""}~${fmtDuration(it.minutes)}` : `${ex.length} exercises · ${ex.reduce((a, x) => a + (num(x.sets) || 3), 0)} sets · ~${fmtDuration(it.minutes)}`}
                  </div>
                </button>
                {expanded && (walk ? (
                  <div className="tl-body">
                    {stepGoal > 0 && <div className="tl-progress"><div className="between"><span>Steps so far</span><b>{stepsNow.toLocaleString()} / {stepGoal.toLocaleString()}</b></div><div className="bar"><span style={{ width: `${Math.min(100, (stepsNow / stepGoal) * 100)}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }} /></div></div>}
                    {s.detail && <p className="muted">{s.detail}</p>}
                    <div className="row wrap"><button className={`btn sm ${it.done ? "ghost" : ""}`} onClick={() => onToggleSession(it.index)}>{it.done ? "↺ Mark not done" : "✓ Mark done"}</button><button className="btn ghost sm" onClick={() => onNavigate("health")}>Open Health</button></div>
                  </div>
                ) : (
                  <div className="tl-body">
                    <table className="ex-table">
                      <thead><tr><th>Exercise</th><th>Sets × reps</th><th>Last time</th></tr></thead>
                      <tbody>{ex.map((x, i) => {
                        const last = lastWeight(x.name), w = num(x.weight);
                        return (
                          <tr key={i} title={HOWTO[x.name] || ""}>
                            <td><span aria-hidden>{exEmoji(x.name)}</span> {x.name}</td>
                            <td>{x.sets || 3} × {x.reps || 10}{w ? ` @ ${w}kg` : ""}</td>
                            <td className="muted">{last ? `${last} kg` : "—"}</td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                    <div className="row wrap"><button className="btn sm" onClick={() => onNavigate("exercise")}>▶ {it.done ? "Review workout" : "Start workout"}</button><button className="btn ghost sm" onClick={() => onToggleSession(it.index)}>{it.done ? "↺ Mark not done" : "✓ Mark done"}</button></div>
                  </div>
                ))}
              </div>
            </li>
          );
        }
        if (it.kind === "study") {
          const s = it.study, c = courseOf(s), tasks = s.plan || [], dn = dayNumber(s.label);
          const video = s.courseVideo, res = firstUrl(s.resource);
          return (
            <li key={k} className={cls} style={{ ["--accent" as any]: c.color }}>
              <div className="tl-time">{it.done ? "done" : "study"}</div>
              <div className="tl-dot" aria-hidden>{it.done ? "✓" : c.icon}</div>
              <div className="tl-card">
                <button className="tl-head" onClick={() => toggle(k)} aria-expanded={expanded}>
                  <div className="tl-title"><span className="course-tag">{c.name}{dn ? ` · Day ${dn}` : ""}</span>{next && <span className="pill pill--next">Up next</span>}</div>
                  <b className="tl-lesson">{lessonTitle(s.label)}</b>
                  <div className="tl-meta">{it.tasksDone}/{tasks.length} tasks · ~{fmtDuration(it.minutes)}</div>
                  <div className="mini-bar"><i style={{ width: `${tasks.length ? (it.tasksDone / tasks.length) * 100 : 0}%` }} /></div>
                </button>
                {expanded && (
                  <div className="tl-body">
                    {s.brief && <p className="tl-brief">{s.brief}</p>}
                    <ul className="task-list">
                      {tasks.map((t, ti) => (
                        <li key={ti} className={t.done ? "done" : ""}>
                          <button className="check" onClick={() => onToggleTask(it.index, ti)} aria-pressed={!!t.done} aria-label={t.done ? "Mark not done" : "Mark done"}>{t.done ? "✓" : ""}</button>
                          <span className="task-list__text">{t.task}</span>
                          {t.time && <span className="task-list__time">{t.time}</span>}
                        </li>
                      ))}
                    </ul>
                    <div className="row wrap">
                      {s.pdf && <a className="btn ghost sm" href={s.pdf} target="_blank" rel="noreferrer">📄 PDF notes</a>}
                      {video && <a className="btn ghost sm" href={video} target="_blank" rel="noreferrer">{s.courseId === "dsa" ? "📖 Book" : "▶ Video"}</a>}
                      {res && <a className="btn ghost sm" href={res} target="_blank" rel="noreferrer">🔗 Resource</a>}
                      <button className="btn ghost sm" onClick={() => onNavigate("study")}>Focus in Study →</button>
                    </div>
                    {s.video && <p className="hint">{s.video}</p>}
                  </div>
                )}
              </div>
            </li>
          );
        }
        return (
          <li key={k} className={cls}>
            <div className="tl-time">meal</div>
            <div className="tl-dot" aria-hidden>{MEAL_ICON[it.slot]}</div>
            <div className="tl-card">
              <button className="tl-head" onClick={() => toggle(k)} aria-expanded={expanded}>
                <div className="tl-title"><b>{MEAL_LABEL[it.slot]}</b></div>
                <div className="tl-meta">{it.items.map((m) => m.name).filter(Boolean).join(", ") || "Planned meal"} · {it.kcal} kcal · {it.protein} g protein</div>
              </button>
              {expanded && (
                <div className="tl-body">
                  <ul className="meal-list">{it.items.map((m, i) => <li key={i}><span>{m.name || "Meal"}</span><span className="muted">{num(m.cal)} kcal · {num(m.protein)} g</span></li>)}</ul>
                  <div className="row wrap"><button className="btn ghost sm" onClick={() => onNavigate("nutrition")}>Log in Nutrition →</button><span className="muted">{loggedMeals} meal{loggedMeals === 1 ? "" : "s"} logged today</span></div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
