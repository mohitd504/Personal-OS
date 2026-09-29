"use client";
import { useMemo, useState } from "react";
import { collectMistakes, groupByCategory, keys, load, norm, uid, type Mistake } from "./english-core";
import { post } from "./api";
import { Busy, Empty, type StepProps } from "./shared";

type QuizItem = { wrong: string; right: string; rule?: string };
const read = (k: string) => localStorage.getItem(k);

export default function Mistakes({ todayStr, rev, bump, notify }: { todayStr: string; rev: number; bump: () => void; notify: StepProps["notify"] }) {
  const [mastered, setMastered] = useState<string[]>(() => load(keys.mastered, []));
  const [showMastered, setShowMastered] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState({ issue: "", better: "" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => collectMistakes(read, todayStr), [todayStr, rev]);
  const active = all.filter((m) => !mastered.includes(m.id));
  const groups = groupByCategory(showMastered ? all : active);

  const toggleMastered = (id: string) => {
    const next = mastered.includes(id) ? mastered.filter((x) => x !== id) : [...mastered, id];
    setMastered(next); localStorage.setItem(keys.mastered, JSON.stringify(next));
  };
  const addNote = () => {
    if (!draft.issue.trim()) return;
    const notes = load<any[]>(keys.notes, []);
    localStorage.setItem(keys.notes, JSON.stringify([{ id: uid(), date: todayStr, issue: draft.issue.trim(), better: draft.better.trim() }, ...notes]));
    setDraft({ issue: "", better: "" }); bump(); notify("Added to your notebook", "ok");
  };
  const deleteNote = (m: Mistake) => {
    const notes = load<any[]>(keys.notes, []).filter((n, i) => (n.id || `note-${i}`) !== m.id && !(n.issue === m.issue && n.date === m.date));
    localStorage.setItem(keys.notes, JSON.stringify(notes)); bump();
  };

  // Quiz built from the most recent unmastered mistakes.
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const startQuiz = async () => {
    const source = active.slice(0, 12).map((m) => (m.better ? `${m.issue} (better: ${m.better})` : m.issue));
    if (!source.length) { notify("No open mistakes to practise — nice!", "info"); return; }
    setBusy(true);
    const { data, error } = await post<{ items: QuizItem[] }>("/api/mistake-quiz", { mistakes: source });
    setBusy(false);
    if (!data?.items?.length) { notify(error || "Couldn't build the quiz.", "error"); return; }
    setQuiz(data.items); setQi(0); setAnswer(""); setChecked(null); setScore(0);
  };
  const check = () => { if (!quiz) return; const ok = norm(answer) === norm(quiz[qi].right); setChecked(ok); if (ok) setScore((s) => s + 1); };
  const nextQ = () => { setQi((i) => i + 1); setAnswer(""); setChecked(null); };

  return (
    <div className="stack">
      <section className="step-card mistakes-hero">
        <div>
          <h2>Mistakes that teach</h2>
          <p className="muted">{active.length ? `${active.length} open correction${active.length > 1 ? "s" : ""} from your speaking sessions and notes, grouped by pattern.` : "No open mistakes. Have a speaking session to collect corrections."}</p>
        </div>
        <button className="btn" onClick={startQuiz} disabled={busy || !active.length}>{busy ? <Busy label="Building quiz…" /> : "🎯 Practise my mistakes"}</button>
      </section>

      {quiz && (
        <section className="step-card quiz">
          {qi < quiz.length ? (
            <>
              <div className="between"><strong>Fix the sentence · {qi + 1}/{quiz.length}</strong><button className="btn ghost sm" onClick={() => setQuiz(null)}>Close</button></div>
              <div className="progress-dots" aria-hidden>{quiz.map((_, i) => <i key={i} className={i < qi ? "on" : i === qi ? "cur" : ""} />)}</div>
              <blockquote className="quiz__wrong">{quiz[qi].wrong}</blockquote>
              <div className="composer__type">
                <input className="in" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { if (checked === null) check(); else nextQ(); } }}
                  placeholder="Rewrite it correctly…" disabled={checked !== null} aria-label="Corrected sentence" autoFocus />
                {checked === null ? <button className="btn sm" onClick={check} disabled={!answer.trim()}>Check</button> : <button className="btn sm" onClick={nextQ}>Next →</button>}
              </div>
              {checked !== null && (
                <div className={`verdict ${checked ? "ok" : "bad"}`}>
                  <b>{checked ? "✓ Correct!" : "✗ Compare with:"}</b>
                  {!checked && <span className="quiz__right">{quiz[qi].right}</span>}
                  {quiz[qi].rule && <span>💡 {quiz[qi].rule}</span>}
                  {!checked && <button className="btn ghost sm" onClick={() => { setChecked(true); setScore((s) => s + 1); }}>Mine was also correct</button>}
                </div>
              )}
            </>
          ) : (
            <div className="done-box"><div className="big-score">{score}/{quiz.length}</div><b>Quiz complete</b><span className="muted">Mark patterns you&apos;ve got as mastered so they leave your list.</span>
              <div className="row"><button className="btn" onClick={startQuiz} disabled={busy}>↻ New quiz</button><button className="btn ghost" onClick={() => setQuiz(null)}>Done</button></div></div>
          )}
        </section>
      )}

      {groups.length ? (
        <section className="step-card">
          <div className="between wrap"><strong>Patterns</strong>
            <label className="muted toggle"><input type="checkbox" checked={showMastered} onChange={(e) => setShowMastered(e.target.checked)} /> Show mastered ({mastered.filter((id) => all.some((m) => m.id === id)).length})</label>
          </div>
          <div className="pattern-list">
            {groups.map((g) => (
              <div key={g.key} className={`pattern${open === g.key ? " open" : ""}`}>
                <button className="pattern__head" onClick={() => setOpen(open === g.key ? null : g.key)} aria-expanded={open === g.key}>
                  <b>{g.label}</b>
                  <span className="pattern__bar"><i style={{ width: `${Math.min(100, (g.items.length / groups[0].items.length) * 100)}%` }} /></span>
                  <span className="pattern__count">{g.items.length}</span>
                  <span aria-hidden>{open === g.key ? "▾" : "▸"}</span>
                </button>
                {open === g.key && (
                  <div className="pattern__items">
                    {g.items.map((m) => (
                      <div key={m.id} className={`mistake${mastered.includes(m.id) ? " is-mastered" : ""}`}>
                        <div className="mistake__body">
                          <div>{m.issue}</div>
                          {m.better && <div className="mistake__better">✓ {m.better}</div>}
                          <small className="muted">{m.source === "manual" ? "Your note" : "Speaking"} · {m.date}</small>
                        </div>
                        <div className="mistake__actions">
                          <button className={`btn sm ${mastered.includes(m.id) ? "" : "ghost"}`} onClick={() => toggleMastered(m.id)}>{mastered.includes(m.id) ? "✓ Mastered" : "Mark mastered"}</button>
                          {m.source === "manual" && <button className="icon-btn" onClick={() => deleteNote(m)} aria-label="Delete note">🗑</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <Empty icon="✏️" title="Your notebook is empty" text="Corrections from the Speak step land here automatically. You can also add ones you notice yourself below." />
      )}

      <section className="step-card">
        <strong>Add your own</strong>
        <div className="note-form">
          <input className="in" value={draft.issue} onChange={(e) => setDraft({ ...draft, issue: e.target.value })} placeholder="What you said / the mistake — e.g. 'I am knowing him since 2019'" aria-label="Mistake" />
          <input className="in" value={draft.better} onChange={(e) => setDraft({ ...draft, better: e.target.value })} placeholder="Correct version — e.g. 'I have known him since 2019'" aria-label="Correct version" onKeyDown={(e) => { if (e.key === "Enter") addNote(); }} />
          <button className="btn" onClick={addNote} disabled={!draft.issue.trim()}>Add</button>
        </div>
      </section>
    </div>
  );
}
