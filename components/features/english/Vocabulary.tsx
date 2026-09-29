"use client";
import { useMemo, useState } from "react";
import { addDays, dueCards, fromDstr, gradeCard, INTERVALS, isLearned, type Grade, type VocabItem } from "./english-core";
import { Busy, Empty, type StepProps } from "./shared";
import type { Speech } from "./useSpeech";

const shortDate = (d: string) => fromDstr(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export default function Vocabulary({ items, setItems, addWord, todayStr, speech, notify }: {
  items: VocabItem[]; setItems: (x: VocabItem[]) => void; addWord: (w: string) => Promise<void>;
  todayStr: string; speech: Speech; notify: StepProps["notify"];
}) {
  const due = useMemo(() => dueCards(items, todayStr), [items, todayStr]);
  const [reviewing, setReviewing] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [word, setWord] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const card = items.find((x) => x.id === queue[0]);
  const startReview = () => { setQueue(due.map((x) => x.id)); setReviewing(true); setFlipped(false); setReviewed(0); };
  const grade = (g: Grade) => {
    if (!card) return;
    setItems(items.map((x) => (x.id === card.id ? gradeCard(x, g, todayStr) : x)));
    setQueue((q) => (g === "again" ? [...q.slice(1), q[0]] : q.slice(1)));
    setFlipped(false); setReviewed((n) => n + 1);
  };
  const add = async () => { if (!word.trim()) return; setAdding(true); await addWord(word.trim()); setWord(""); setAdding(false); };
  const update = (id: string, patch: Partial<VocabItem>) => setItems(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => { setItems(items.filter((x) => x.id !== id)); notify("Word removed", "info"); };

  const learned = items.filter(isLearned).length;
  const list = items.filter((x) => !filter || (x.word + " " + x.meaning).toLowerCase().includes(filter.toLowerCase()));
  const nextDue = items.filter((x) => x.due > todayStr).map((x) => x.due).sort()[0];

  if (reviewing) {
    return (
      <section className="step-card vocab-review">
        <div className="between"><strong>Review · {queue.length} left</strong><button className="btn ghost sm" onClick={() => setReviewing(false)}>Done</button></div>
        {card ? (
          <>
            <button className={`flashcard${flipped ? " flipped" : ""}`} onClick={() => setFlipped(true)} aria-label={flipped ? "Card answer" : "Show answer"}>
              <span className="flashcard__word">{card.word}</span>
              {flipped ? (
                <span className="flashcard__back">
                  <span>{card.meaning || <i className="muted">No meaning saved yet</i>}</span>
                  {card.example && <em>“{card.example}”</em>}
                </span>
              ) : <span className="flashcard__hint">Say what it means, then tap to check</span>}
            </button>
            <div className="row center-row">
              <button className="btn ghost sm" onClick={() => speech.speak(card.word, true)}>🔊 Hear</button>
            </div>
            {flipped ? (
              <div className="grade">
                <button className="grade__btn grade__btn--again" onClick={() => grade("again")}><b>Again</b><small>see it again now</small></button>
                <button className="grade__btn grade__btn--good" onClick={() => grade("good")}><b>Good</b><small>{INTERVALS[Math.min(INTERVALS.length - 1, (card.level || 0) + 1)]}d</small></button>
                <button className="grade__btn grade__btn--easy" onClick={() => grade("easy")}><b>Easy</b><small>{INTERVALS[Math.min(INTERVALS.length - 1, (card.level || 0) + 2)]}d</small></button>
              </div>
            ) : <button className="btn" onClick={() => setFlipped(true)}>Show answer</button>}
          </>
        ) : (
          <div className="done-box"><div className="big-score">🎉</div><b>Review done — {reviewed} cards</b><span className="muted">{nextDue ? `Next review: ${nextDue === addDays(todayStr, 1) ? "tomorrow" : shortDate(nextDue)}` : "Add more words to keep growing"}</span><button className="btn" onClick={() => setReviewing(false)}>Back to deck</button></div>
        )}
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="vocab-top">
        <div className="stat-card"><span>Due today</span><b>{due.length}</b></div>
        <div className="stat-card"><span>In your deck</span><b>{items.length}</b></div>
        <div className="stat-card"><span>Learned</span><b>{learned}</b><small>reviewed 3+ times</small></div>
        <div className="stat-card stat-card--cta">
          {due.length ? <button className="btn" onClick={startReview}>▶ Review {due.length} card{due.length > 1 ? "s" : ""}</button> : <span className="muted">{items.length ? "All caught up ✓" : "Add your first word"}</span>}
        </div>
      </section>

      <section className="step-card">
        <div className="add-word">
          <input className="in" value={word} onChange={(e) => setWord(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Add a word or phrase — e.g. 'run into', 'meticulous'" aria-label="New word" />
          <button className="btn" onClick={add} disabled={adding || !word.trim()}>{adding ? <Busy label="Explaining…" /> : "＋ Add"}</button>
        </div>
        <p className="hint">AI fills in the meaning and an example. You can also save words straight from lessons, chats and essay corrections with <b>＋ Save word</b>.</p>
      </section>

      {items.length ? (
        <section className="step-card">
          <div className="between wrap"><strong>Your deck</strong><input className="in" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search…" aria-label="Search words" /></div>
          <div className="vocab-list">
            {list.map((x) => (
              <div key={x.id} className="vocab-item">
                <div className="vocab-item__head">
                  <b>{x.word}</b>
                  <span className={`level level--${Math.min(x.level || 0, 5)}`} title="Review level">{"●".repeat(Math.min(x.level || 0, 5)) || "new"}</span>
                  <span className="muted vocab-item__due">{x.due <= todayStr ? "due" : x.due === addDays(todayStr, 1) ? "tomorrow" : shortDate(x.due)}</span>
                  <button className="icon-btn" onClick={() => speech.speak(x.word, true)} aria-label={`Hear ${x.word}`}>🔊</button>
                  <button className="icon-btn" onClick={() => setEditing(editing === x.id ? null : x.id)} aria-label="Edit">✎</button>
                  <button className="icon-btn" onClick={() => remove(x.id)} aria-label={`Delete ${x.word}`}>🗑</button>
                </div>
                {editing === x.id ? (
                  <div className="vocab-item__edit">
                    <input className="in" value={x.word} onChange={(e) => update(x.id, { word: e.target.value })} aria-label="Word" />
                    <input className="in" value={x.meaning} onChange={(e) => update(x.id, { meaning: e.target.value })} placeholder="Meaning" aria-label="Meaning" />
                    <input className="in" value={x.example} onChange={(e) => update(x.id, { example: e.target.value })} placeholder="Example sentence" aria-label="Example" />
                  </div>
                ) : (
                  <>
                    {x.meaning ? <div className="vocab-item__meaning">{x.meaning}</div> : <div className="muted">No meaning yet — tap ✎ to add one.</div>}
                    {x.example && <div className="vocab-item__example">“{x.example}”</div>}
                  </>
                )}
              </div>
            ))}
            {!list.length && <div className="muted">No words match “{filter}”.</div>}
          </div>
        </section>
      ) : (
        <Empty icon="🃏" title="Build your word deck" text="Add words you want to use in conversation. They come back for review just before you'd forget them: after 1, 3, 7, 21 and 45 days." />
      )}
    </div>
  );
}
