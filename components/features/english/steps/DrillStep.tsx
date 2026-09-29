"use client";
import { useRef, useState } from "react";
import { keys, type Drill } from "../english-core";
import { post } from "../api";
import { Busy, Empty, Md, MicButton, StepHeader, useStored, type StepProps } from "../shared";

const EMPTY: Drill = { sentences: [], idx: 0, attempts: [], review: "" };

// Shadowing: the coach reads a short paragraph, the learner repeats it aloud.
export default function DrillStep({ date, topic, speech, onChange, notify }: StepProps) {
  const [drill, save] = useStored<Drill>(keys.drill(date), EMPTY, onChange);
  const [busy, setBusy] = useState<"" | "start" | "review">("");
  const drillRef = useRef(drill);
  drillRef.current = drill;
  const sentences = drill.sentences || [];
  const done = sentences.length > 0 && drill.idx >= sentences.length;

  const start = async () => {
    setBusy("start");
    const { data, error } = await post("/api/english-drill", { topic, count: 20 });
    setBusy("");
    if (!Array.isArray(data?.sentences) || !data.sentences.length) { notify(error || "Couldn't prepare the drill.", "error"); return; }
    const paras: string[] = [];
    for (let i = 0; i < data.sentences.length; i += 4) paras.push(data.sentences.slice(i, i + 4).join(" "));
    save({ ...EMPTY, sentences: paras });
    speech.speak(paras[0], true);
  };
  const record = (said: string) => {
    const d = drillRef.current;
    const attempts = [...(d.attempts || []), { target: d.sentences[d.idx] || "", said }];
    const idx = d.idx + 1;
    save({ attempts, idx });
    if (idx < d.sentences.length) setTimeout(() => speech.speak(d.sentences[idx], true), 500);
  };
  const review = async () => {
    if (!drill.attempts?.length) { notify("Repeat at least one paragraph first.", "info"); return; }
    setBusy("review");
    const { data, error } = await post("/api/drill-review", { attempts: drill.attempts });
    setBusy("");
    if (data?.review) save({ review: data.review }); else notify(error || "Couldn't review the drill.", "error");
  };

  return (
    <section className="step-card">
      <StepHeader step="drill" subtitle={sentences.length ? `Paragraph ${Math.min(drill.idx + 1, sentences.length)} of ${sentences.length}` : "Listen, then repeat the whole paragraph aloud"}
        actions={sentences.length ? <button className="btn ghost sm" onClick={() => save(EMPTY)}>↺ New drill</button> : null} />
      {!sentences.length ? (
        <Empty icon="🔁" title="Shadowing drill" text="Your coach reads a short paragraph; you repeat it aloud. Every attempt is recorded and reviewed at the end — great for rhythm, linking and confidence."
          action={<button className="btn" onClick={() => start()} disabled={busy === "start"}>{busy === "start" ? <Busy label="Preparing…" /> : "▶ Start drill"}</button>} />
      ) : !done ? (
        <>
          <div className="progress-dots" aria-hidden>{sentences.map((_, i) => <i key={i} className={i < drill.idx ? "on" : i === drill.idx ? "cur" : ""} />)}</div>
          <blockquote className="shadow-text">{sentences[drill.idx]}</blockquote>
          <div className="row wrap">
            <button className="btn ghost sm" onClick={() => speech.speak(sentences[drill.idx], true)}>🔊 Hear it</button>
            <button className="btn ghost sm" onClick={() => record("(skipped)")}>Skip</button>
            {drill.attempts?.length > 0 && <button className="btn ghost sm" onClick={review} disabled={busy === "review"}>{busy === "review" ? <Busy label="Reviewing…" /> : "Finish early & review"}</button>}
          </div>
          <MicButton speech={speech} ctx="drill" onText={record} label="Tap, then repeat the paragraph" stopLabel="Tap when finished" disabled={busy !== ""} notify={notify} />
        </>
      ) : (
        <div className="done-box">
          <b>All {sentences.length} paragraphs done 🎉</b>
          {!drill.review && <button className="btn" onClick={review} disabled={busy === "review"}>{busy === "review" ? <Busy label="Reviewing…" /> : "📋 Review my mistakes"}</button>}
        </div>
      )}
      {drill.review && <div className="result"><Md text={drill.review} /></div>}
    </section>
  );
}
