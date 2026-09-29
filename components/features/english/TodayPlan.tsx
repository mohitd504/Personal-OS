"use client";
import { useEffect, useMemo, useState } from "react";
import { ENGLISH_TOPICS } from "@/components/dashboard/data";
import { addDays, CORE_TOTAL, coreDone, dayIndex, dayState, doneCount, PLAN_DAYS, STEPS, stepStatus, streak, type StepKey } from "./english-core";
import type { Speech } from "./useSpeech";
import type { StepProps } from "./shared";
import LessonStep from "./steps/LessonStep";
import SpeakStep from "./steps/SpeakStep";
import WriteStep from "./steps/WriteStep";
import DrillStep from "./steps/DrillStep";
import WordSetStep from "./steps/WordSetStep";

const read = (k: string) => (typeof window === "undefined" ? null : localStorage.getItem(k));
// First unfinished core step for a day (else first unfinished bonus step, else the lesson).
function firstOpen(date: string): StepKey {
  const s = stepStatus(read, date);
  return (STEPS.find((x) => x.core && !s[x.key]) || STEPS.find((x) => !s[x.key]) || STEPS[0]).key;
}

function journeyDays(start: string, todayStr: string) {
  return Array.from({ length: PLAN_DAYS }, (_, i) => {
    const d = addDays(start, i);
    const s = stepStatus(read, d);
    return { d, i, state: dayState(s, d, todayStr), done: doneCount(s) };
  });
}

export default function TodayPlan({ start, todayStr, speech, saveWord, notify, rev, bump, scenarioRequest, onScenarioHandled, jumpTo }: {
  start: string; todayStr: string; speech: Speech; saveWord: (w: string) => void; notify: StepProps["notify"];
  rev: number; bump: () => void; scenarioRequest: string | null; onScenarioHandled: () => void; jumpTo?: { date?: string; step?: StepKey } | null;
}) {
  const [date, setDate] = useState(todayStr);
  const [active, setActive] = useState<StepKey>(() => firstOpen(todayStr));
  // Changing day and step together, so a requested step isn't overridden by the day's default.
  const go = (d: string, step?: StepKey) => { setDate(d); setActive(step ?? firstOpen(d)); };
  const idx = dayIndex(start, date);
  const topic = ENGLISH_TOPICS[idx] || ENGLISH_TOPICS[ENGLISH_TOPICS.length - 1];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const status = useMemo(() => stepStatus(read, date), [date, rev]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (scenarioRequest) go(todayStr, "speak"); }, [scenarioRequest, todayStr]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (jumpTo) go(jumpTo.date || date, jumpTo.step); }, [jumpTo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const streakInfo = useMemo(() => streak(read, todayStr, 120), [todayStr, rev]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const journey = useMemo(() => journeyDays(start, todayStr), [start, todayStr, rev]);
  const daysDone = journey.filter((j) => j.state === "done").length;
  // Open on wide screens; collapsed on phones so today's steps come first.
  const [journeyOpen, setJourneyOpen] = useState(() => typeof window === "undefined" || window.innerWidth > 680);

  const done = doneCount(status), core = coreDone(status);
  const pct = Math.round((done / STEPS.length) * 100);
  const nextStep = STEPS.find((s) => !status[s.key] && s.key !== active);
  const props: StepProps = { date, topic, dayNo: idx + 1, speech, onChange: bump, saveWord, notify };
  const shift = (n: number) => { const d = addDays(date, n); if (d <= todayStr) go(d); };

  return (
    <div className="eng-today">
      <section className="eng-hero">
        <div className="eng-hero__main">
          <div className="eng-hero__eyebrow">
            <span className="pill pill--violet">Day {idx + 1} of {PLAN_DAYS}</span>
            {date !== todayStr && <span className="pill">Reviewing {date}</span>}
            <span className="pill pill--flame" title={`Best streak: ${streakInfo.best} days`}>🔥 {streakInfo.current}-day streak</span>
          </div>
          <h1>{topic}</h1>
          <p>{core === CORE_TOTAL ? `Core practice done${done < STEPS.length ? ` — ${STEPS.length - done} bonus step${STEPS.length - done > 1 ? "s" : ""} left` : " — every step complete!"}` : `${core} of ${CORE_TOTAL} core steps done · about ${STEPS.filter((s) => !status[s.key] && s.core).reduce((a, s) => a + s.minutes, 0)} min to go`}</p>
          <div className="eng-hero__nav">
            <button className="btn ghost sm" onClick={() => shift(-1)} aria-label="Previous day">‹</button>
            <input className="in" type="date" value={date} max={todayStr} onChange={(e) => e.target.value && e.target.value <= todayStr && go(e.target.value)} aria-label="Practice date" />
            <button className="btn ghost sm" onClick={() => shift(1)} disabled={date >= todayStr} aria-label="Next day">›</button>
            {date !== todayStr && <button className="btn ghost sm" onClick={() => go(todayStr)}>Today</button>}
          </div>
        </div>
        <div className="eng-hero__ring">
          <div className="ring" style={{ ["--p" as any]: pct, ["--c" as any]: "#a855f7" }}>
            <div className="rc"><b>{done}/{STEPS.length}</b><small>steps today</small></div>
          </div>
        </div>
      </section>

      <details className="journey" open={journeyOpen} onToggle={(e) => setJourneyOpen((e.target as HTMLDetailsElement).open)}>
        <summary><strong>45-day journey</strong><span className="muted">{daysDone} of {PLAN_DAYS} days complete</span></summary>
        <div className="journey__grid" role="list">
          {journey.map((j) => (
            <button key={j.d} role="listitem" className={`journey__cell is-${j.state}${j.d === date ? " is-selected" : ""}`} disabled={j.state === "future"}
              onClick={() => go(j.d)} title={`Day ${j.i + 1} · ${j.d}${j.state === "future" ? "" : ` · ${j.done}/6 steps`}\n${ENGLISH_TOPICS[j.i] || ""}`} aria-label={`Day ${j.i + 1}, ${j.state}`}>
              {j.i + 1}
            </button>
          ))}
        </div>
        <div className="journey__legend"><span><i className="is-done" />Complete</span><span><i className="is-partial" />Started</span><span><i className="is-missed" />Missed</span><span><i className="is-future" />Upcoming</span></div>
      </details>

      <div className="eng-layout">
        <nav className="step-rail" aria-label="Today's steps">
          {STEPS.map((s, i) => (
            <button key={s.key} className={`step-item${active === s.key ? " on" : ""}${status[s.key] ? " done" : ""}`} onClick={() => setActive(s.key)} aria-current={active === s.key ? "step" : undefined}>
              <span className="step-item__num">{status[s.key] ? "✓" : i + 1}</span>
              <span className="step-item__body"><b>{s.icon} {s.label}</b><small>{s.blurb} · {s.minutes} min{s.core ? "" : " · bonus"}</small></span>
            </button>
          ))}
        </nav>
        <div className="step-stage">
          {active === "lesson" && <LessonStep {...props} />}
          {active === "speak" && <SpeakStep {...props} scenarioRequest={scenarioRequest} onScenarioHandled={onScenarioHandled} />}
          {active === "write" && <WriteStep {...props} />}
          {active === "drill" && <DrillStep {...props} />}
          {active === "pronounce" && <WordSetStep key={`p-${date}`} kind="pronounce" {...props} />}
          {active === "spell" && <WordSetStep key={`s-${date}`} kind="spell" {...props} />}
          {nextStep && status[active] && (
            <button className="next-step" onClick={() => setActive(nextStep.key)}>
              <span>Nice work! Up next</span><b>{nextStep.icon} {nextStep.label} →</b>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
