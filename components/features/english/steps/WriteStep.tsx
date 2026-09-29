"use client";
import { useState } from "react";
import { keys, type EngDay } from "../english-core";
import { post } from "../api";
import { Busy, Md, SaveSelection, StepHeader, useStored, type StepProps } from "../shared";

export default function WriteStep({ date, topic, onChange, saveWord, notify }: StepProps) {
  const [day, save] = useStored<EngDay>(keys.day(date), {}, onChange);
  const [busy, setBusy] = useState(false);
  const essay = day.essay || "";
  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const check = async () => {
    if (!essay.trim()) { notify("Write a few sentences first.", "info"); return; }
    setBusy(true);
    const { data, error } = await post("/api/essay-check", { text: essay });
    setBusy(false);
    if (data?.result) { save({ essayResult: data.result }); notify("Essay corrected", "ok"); } else notify(error || "Couldn't check the essay.", "error");
  };
  return (
    <section className="step-card">
      <StepHeader step="write" subtitle={`Write 120–200 words on: ${topic}`} actions={day.essayResult ? <SaveSelection saveWord={saveWord} notify={notify} /> : null} />
      <div className="write">
        <textarea className="in write__area" value={essay} onChange={(e) => save({ essay: e.target.value })}
          placeholder={`Write about: ${topic}.\n\nUse today's grammar point. Don't worry about mistakes — you'll get a corrected version, the key fixes and better word choices.`} aria-label="Your essay" />
        <div className="write__bar">
          <span className={`muted ${words >= 120 ? "ok" : ""}`}>{words} words{words < 120 ? ` · aim for 120+` : " ✓"}</span>
          <button className="btn" onClick={check} disabled={busy || !essay.trim()}>{busy ? <Busy label="Checking…" /> : day.essayResult ? "↻ Check again" : "✨ Correct my essay"}</button>
        </div>
      </div>
      {day.essayResult && <div className="result"><Md text={day.essayResult} /></div>}
    </section>
  );
}
