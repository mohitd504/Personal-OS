"use client";
import { useState } from "react";
import { keys, type EngDay } from "../english-core";
import { post } from "../api";
import { Busy, Empty, Md, SaveSelection, StepHeader, useStored, type StepProps } from "../shared";

export default function LessonStep({ date, topic, dayNo, onChange, saveWord, notify }: StepProps) {
  const [day, save] = useStored<EngDay>(keys.day(date), {}, onChange);
  const [busy, setBusy] = useState(false);
  const getLesson = async () => {
    setBusy(true);
    const { data, error } = await post("/api/english-lesson", { day: dayNo, topic });
    setBusy(false);
    if (data?.lesson) { save({ lesson: data.lesson }); notify("Lesson ready", "ok"); } else notify(error || "Couldn't build the lesson.", "error");
  };
  return (
    <section className="step-card">
      <StepHeader step="lesson" subtitle={topic} actions={day.lesson ? <>
        <SaveSelection saveWord={saveWord} notify={notify} />
        <button className="btn ghost sm" onClick={getLesson} disabled={busy}>{busy ? <Busy label="Writing…" /> : "↻ New lesson"}</button>
      </> : null} />
      {day.lesson ? <Md text={day.lesson} /> : (
        <Empty icon="📘" title={`Day ${dayNo}: ${topic}`} text="A focused 15-minute lesson with examples, common mistakes, useful phrases and practice prompts."
          action={<button className="btn" onClick={getLesson} disabled={busy}>{busy ? <Busy label="Writing your lesson…" /> : "✨ Get today's lesson"}</button>} />
      )}
      {day.lesson && <p className="hint">Tip: highlight any word or phrase and tap <b>＋ Save word</b> to add it to your vocabulary deck.</p>}
    </section>
  );
}
