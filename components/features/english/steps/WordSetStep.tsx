"use client";
import { useRef, useState } from "react";
import { keys, norm, type WordSet } from "../english-core";
import { post } from "../api";
import { Busy, Empty, MicButton, StepHeader, useStored, type StepProps } from "../shared";

const EMPTY: WordSet = { items: [], idx: 0, right: 0, last: null, input: "" };

// Pronunciation (say the word) and Spelling (type the dictated word) share one flow.
export default function WordSetStep({ kind, date, topic, speech, onChange, saveWord, notify }: StepProps & { kind: "pronounce" | "spell" }) {
  const key = kind === "pronounce" ? keys.pron(date) : keys.spell(date);
  const [set, save] = useStored<WordSet>(key, EMPTY, onChange);
  const [busy, setBusy] = useState(false);
  const setRef = useRef(set);
  setRef.current = set;
  const items = set.items || [];
  const item = items[set.idx];
  const finished = items.length > 0 && set.idx >= items.length;

  const start = async () => {
    setBusy(true);
    const { data, error } = await post("/api/word-set", { kind: kind === "pronounce" ? "pronunciation" : "spelling", topic, count: 12 });
    setBusy(false);
    if (!Array.isArray(data?.items) || !data.items.length) { notify(error || "Couldn't build the word set.", "error"); return; }
    save({ ...EMPTY, items: data.items });
    setTimeout(() => speech.speak(data.items[0].word, true), 300);
  };
  const judge = (answer: string) => {
    const s = setRef.current; const it = s.items[s.idx]; if (!it) return;
    const a = norm(answer), w = norm(it.word);
    const ok = kind === "spell" ? a === w : !!a && (a === w || a.includes(w) || (w.includes(a) && a.length >= w.length - 2));
    save({ last: { word: it.word, answer, ok }, right: s.right + (ok ? 1 : 0) });
  };
  const next = () => {
    const idx = Math.min(set.idx + 1, items.length);
    save({ idx, last: null, input: "" });
    if (idx < items.length) setTimeout(() => speech.speak(items[idx].word, true), 250);
  };

  const pron = kind === "pronounce";
  return (
    <section className="step-card">
      <StepHeader step={kind} timer={false}
        subtitle={items.length ? `${Math.min(set.idx + (finished ? 0 : 1), items.length)} of ${items.length} · ✓ ${set.right} correct` : pron ? "Hear a word, then say it back" : "Hear a word, then type its spelling"}
        actions={items.length ? <button className="btn ghost sm" onClick={start} disabled={busy}>↺ New set</button> : null} />
      {!items.length ? (
        <Empty icon={pron ? "🗣️" : "🔤"} title={pron ? "Pronunciation practice" : "Spelling dictation"}
          text={pron ? "12 commonly mispronounced words and today's topic words, with stress tips. Checked with speech-to-text." : "Your coach says 12 tricky words out loud — you type each one."}
          action={<button className="btn" onClick={start} disabled={busy}>{busy ? <Busy label="Picking words…" /> : "▶ Start"}</button>} />
      ) : finished ? (
        <div className="done-box">
          <div className="big-score">{Math.round((set.right / items.length) * 100)}%</div>
          <b>{set.right} of {items.length} {pron ? "said clearly" : "spelled correctly"}</b>
          <button className="btn" onClick={start} disabled={busy}>{busy ? <Busy label="Picking words…" /> : "↺ Another set"}</button>
        </div>
      ) : (
        <>
          <div className="progress-dots" aria-hidden>{items.map((_, i) => <i key={i} className={i < set.idx ? "on" : i === set.idx ? "cur" : ""} />)}</div>
          <div className="word-card">
            {pron ? <div className="word-card__word">{item.word}</div> : <div className="word-card__hidden" aria-label="Hidden word">• • • • •</div>}
            {(item.tip || item.hint) && <div className="word-card__tip">💡 {item.tip || item.hint}</div>}
            <button className="btn ghost sm" onClick={() => speech.speak(item.word, true)}>🔊 {pron ? "Hear it" : "Hear the word"}</button>
          </div>
          {!set.last ? (
            pron ? (
              <div className="row wrap">
                <MicButton speech={speech} ctx={`pron`} onText={judge} label="Tap and say the word" stopLabel="Tap when done" notify={notify} />
                <button className="btn ghost sm" onClick={next}>Skip</button>
              </div>
            ) : (
              <div className="composer__type">
                <input className="in" value={set.input || ""} onChange={(e) => save({ input: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && set.input?.trim()) judge(set.input); }}
                  placeholder="Type the spelling…" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Spelling" />
                <button className="btn sm" onClick={() => judge(set.input || "")} disabled={!set.input?.trim()}>Check</button>
                <button className="btn ghost sm" onClick={next}>Skip</button>
              </div>
            )
          ) : (
            <div className={`verdict ${set.last.ok ? "ok" : "bad"}`}>
              <b>{set.last.ok ? (pron ? "✓ Clear!" : "✓ Correct!") : "✗ Not quite"}</b>
              <span>{pron ? "Heard" : "You typed"}: “{set.last.answer ?? set.last.said ?? set.last.typed ?? "—"}” · Correct: <b>{set.last.word}</b></span>
              <div className="row wrap">
                {!set.last.ok && <button className="btn ghost sm" onClick={() => save({ last: null, right: set.right })}>Try again</button>}
                {!set.last.ok && <button className="btn ghost sm" onClick={() => saveWord(set.last.word)}>＋ Save word</button>}
                <button className="btn sm" onClick={next}>Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
