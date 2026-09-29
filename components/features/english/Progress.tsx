"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, collectMistakes, dayIndex, dayState, doneCount, fromDstr, groupByCategory, isLearned, keys, levelLabel, load, parse, PLAN_DAYS, scoreHistory, stepStatus, streak, STEPS, type EngDay, type VocabItem } from "./english-core";
import { Empty } from "./shared";

const read = (k: string) => localStorage.getItem(k);
const SERIES = [
  { key: "fluency", label: "Fluency", color: "#f59e0b" },
  { key: "grammar", label: "Grammar", color: "#a855f7" },
  { key: "vocabulary", label: "Vocabulary", color: "#3b82f6" },
] as const;

export default function Progress({ start, todayStr, rev, onOpenDay }: { start: string; todayStr: string; rev: number; onOpenDay: (date: string) => void }) {
  const data = useMemo(() => {
    const history = scoreHistory(read, todayStr, 120);
    const st = streak(read, todayStr, 120);
    const weeks = 20;
    // Heatmap: columns are weeks (Mon–Sun), last column is this week.
    const todayDow = (fromDstr(todayStr).getDay() + 6) % 7;
    const gridStart = addDays(todayStr, -(weeks * 7 - 1) + (6 - todayDow));
    const cells = Array.from({ length: weeks * 7 }, (_, i) => {
      const d = addDays(gridStart, i);
      return { d, n: d > todayStr ? -1 : doneCount(stepStatus(read, d)) };
    });
    const practiceDays = cells.filter((c) => c.n > 0).length;
    let turns = 0, essays = 0;
    for (let i = 0; i < 120; i += 1) {
      const day = parse<EngDay>(read(keys.day(addDays(todayStr, -i))), {});
      turns += (day.chat || []).filter((m) => m.role === "user").length;
      if (day.essayResult) essays += 1;
    }
    const journeyDone = Array.from({ length: PLAN_DAYS }, (_, i) => addDays(start, i)).filter((d) => dayState(stepStatus(read, d), d, todayStr) === "done").length;
    const vocab = load<VocabItem[]>(keys.vocab, []);
    const mastered = load<string[]>(keys.mastered, []);
    const mistakes = collectMistakes(read, todayStr).filter((m) => !mastered.includes(m.id));
    return { history, st, cells, turns, essays, practiceDays, journeyDone, vocab, focus: groupByCategory(mistakes).slice(0, 3), masteredCount: mastered.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, todayStr, rev]);

  // On narrow screens the heatmap scrolls; start at the most recent week.
  const heatRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = heatRef.current; if (el) el.scrollLeft = el.scrollWidth; }, [data]);
  const latest = data.history[data.history.length - 1];
  const first = data.history[0];
  const delta = latest && first && latest !== first && latest.overall != null && first.overall != null ? latest.overall - first.overall : null;

  return (
    <div className="stack">
      <section className="progress-top">
        <div className="score-hero">
          <div className="ring lg" style={{ ["--p" as any]: latest?.overall ?? 0, ["--c" as any]: "#a855f7" }}>
            <div className="rc"><b>{latest?.overall ?? "—"}</b><small>fluency score</small></div>
          </div>
          <div>
            <div className="score-hero__level">{latest?.level ? `${latest.level} · ` : ""}{levelLabel(latest?.overall ?? null)}</div>
            <div className="muted">{latest ? `Last scored ${latest.date === todayStr ? "today" : latest.date}` : "Finish a speaking session to get scored"}</div>
            {delta != null && <div className={`delta ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} since {first.date}</div>}
            <div className="subscores">
              {SERIES.map((s) => <span key={s.key} style={{ color: s.color }}>{s.label} <b>{(latest as any)?.[s.key] ?? "—"}</b></span>)}
              <span style={{ color: "#22c55e" }}>Pronunciation <b>{latest?.pronunciation ?? "—"}</b></span>
            </div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card"><span>Streak</span><b>🔥 {data.st.current}</b><small>best {data.st.best} days</small></div>
          <div className="stat-card"><span>Journey</span><b>{data.journeyDone}<small>/{PLAN_DAYS}</small></b><small>day {dayIndex(start, todayStr) + 1} today</small></div>
          <div className="stat-card"><span>Words learned</span><b>{data.vocab.filter(isLearned).length}<small>/{data.vocab.length}</small></b><small>in your deck</small></div>
          <div className="stat-card"><span>Spoken answers</span><b>{data.turns}</b><small>{data.essays} essays corrected</small></div>
        </div>
      </section>

      <section className="step-card">
        <div className="between wrap"><strong>Score trend</strong><div className="legend">{SERIES.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>)}</div></div>
        {data.history.length >= 2 ? <TrendChart history={data.history} /> : (
          <p className="muted">{data.history.length === 1 ? "One session scored so far — finish another to see your trend." : "Your trend appears after two scored speaking sessions."}</p>
        )}
      </section>

      <div className="two-col">
        <section className="step-card">
          <div className="between"><strong>Practice activity</strong><span className="muted">{data.practiceDays} active days · last 20 weeks</span></div>
          <div ref={heatRef} className="heat" role="group" aria-label="Practice heatmap, last 20 weeks">
            {data.cells.map((c) => (
              <button key={c.d} className={`heat__cell h${c.n < 0 ? "x" : Math.min(c.n, 4)}`} disabled={c.n < 0} onClick={() => onOpenDay(c.d)}
                title={c.n < 0 ? "" : `${c.d}: ${c.n}/${STEPS.length} steps`} aria-label={c.n < 0 ? "future" : `${c.d}, ${c.n} steps`} />
            ))}
          </div>
          <div className="heat__legend"><span>Less</span><i className="heat__cell h0" /><i className="heat__cell h1" /><i className="heat__cell h2" /><i className="heat__cell h3" /><i className="heat__cell h4" /><span>More</span></div>
        </section>

        <section className="step-card">
          <strong>Focus next</strong>
          {data.focus.length ? (
            <ul className="focus-list">
              {data.focus.map((g, i) => (
                <li key={g.key}><span className="focus-list__n">{i + 1}</span><div><b>{g.label}</b><small>{g.items.length} open correction{g.items.length > 1 ? "s" : ""} · e.g. “{g.items[0].issue}”</small></div></li>
              ))}
            </ul>
          ) : <Empty icon="🎯" title="No patterns yet" text="After a few speaking sessions your most common mistake types show up here." />}
          {data.masteredCount > 0 && <p className="hint">✓ {data.masteredCount} mistake{data.masteredCount > 1 ? "s" : ""} mastered so far.</p>}
        </section>
      </div>
    </div>
  );
}

function TrendChart({ history }: { history: ReturnType<typeof scoreHistory> }) {
  // Rendered at the container's pixel width so labels keep their size on any screen.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = 220, P = { l: 30, r: 14, t: 12, b: 26 };
  const n = history.length;
  const x = (i: number) => P.l + (n === 1 ? 0 : (i / (n - 1)) * (W - P.l - P.r));
  const y = (v: number) => P.t + (1 - v / 100) * (H - P.t - P.b);
  const path = (k: "fluency" | "grammar" | "vocabulary") => history.map((h, i) => (h[k] == null ? null : `${x(i)},${y(h[k] as number)}`)).filter(Boolean).join(" ");
  const ticks = [0, 25, 50, 75, 100];
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  return (
    <div ref={box} className="trend-box"><svg className="trend" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fluency, grammar and vocabulary scores over time">
      {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="trend__grid" /><text x={P.l - 6} y={y(t) + 3} className="trend__axis" textAnchor="end">{t}</text></g>)}
      {history.map((h, i) => (i % labelEvery === 0 || i === n - 1) && <text key={h.date} x={x(i)} y={H - 8} className="trend__axis" textAnchor={i === n - 1 ? "end" : i === 0 ? "start" : "middle"}>{h.date.slice(5)}</text>)}
      {SERIES.map((s) => <polyline key={s.key} points={path(s.key)} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />)}
      {SERIES.map((s) => history.map((h, i) => h[s.key] != null && <circle key={s.key + i} cx={x(i)} cy={y(h[s.key] as number)} r={3.5} fill={s.color}><title>{`${h.date} · ${s.label} ${h[s.key]}`}</title></circle>))}
    </svg></div>
  );
}
