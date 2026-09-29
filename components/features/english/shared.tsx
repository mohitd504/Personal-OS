"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { mdToHtml } from "@/components/dashboard/data";
import { MiniTimer } from "@/components/dashboard/ui";
import { load, STEPS, type StepKey } from "./english-core";
import type { Speech } from "./useSpeech";

export type StepProps = {
  date: string;
  topic: string;
  dayNo: number;
  speech: Speech;
  onChange: () => void;          // a step's stored data changed (refresh checkmarks)
  saveWord: (word: string) => void;
  notify: (text: string, kind?: "ok" | "error" | "info") => void;
};

// A localStorage-backed value that reloads when its key changes (e.g. switching day).
export function useStored<T extends object>(key: string, fallback: T, onChange?: () => void) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setValue(load(key, fallback)); }, [key]);
  const save = useCallback((patch: Partial<T> | ((v: T) => Partial<T>)) => {
    setValue((v) => {
      const next = { ...v, ...(typeof patch === "function" ? patch(v) : patch) };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
    onChange?.();
  }, [key, onChange]);
  return [value, save] as const;
}

export function Md({ text }: { text: string }) {
  return <div className="md" dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />;
}

export function StepHeader({ step, subtitle, actions, timer = true }: { step: StepKey; subtitle?: ReactNode; actions?: ReactNode; timer?: boolean }) {
  const s = STEPS.find((x) => x.key === step)!;
  return (
    <div className="step-head">
      <div className="step-head__title">
        <span className={`ic-chip step-ic step-ic--${step}`} aria-hidden>{s.icon}</span>
        <div><h2>{s.label}</h2>{subtitle && <p>{subtitle}</p>}</div>
      </div>
      <div className="step-head__actions">{actions}{timer && <MiniTimer minutes={s.minutes} />}</div>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden>{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

// Big round mic button bound to one context of the shared speech recognizer.
export function MicButton({ speech, ctx, onText, label = "Tap to speak", stopLabel = "Stop", disabled, notify }: {
  speech: Speech; ctx: string; onText: (t: string) => void; label?: string; stopLabel?: string; disabled?: boolean; notify: StepProps["notify"];
}) {
  const mine = speech.listening && speech.ctx === ctx;
  const busyElsewhere = speech.listening && !mine;
  const click = () => {
    if (mine) { speech.stop(); return; }
    const err = speech.start(ctx, onText);
    if (err) notify(err, "error");
  };
  return (
    <div className="mic">
      <button type="button" className={`mic-btn${mine ? " on" : ""}`} onClick={click} disabled={disabled || busyElsewhere} aria-pressed={mine} aria-label={mine ? stopLabel : label}>
        {mine ? "■" : "🎙️"}
      </button>
      <div className="mic__label">
        <b>{mine ? stopLabel : label}</b>
        {mine ? (speech.transcript ? <span>“{speech.transcript}”</span> : <span className="wave" aria-hidden><i /><i style={{ animationDelay: ".15s" }} /><i style={{ animationDelay: ".3s" }} /><i style={{ animationDelay: ".45s" }} /><i style={{ animationDelay: ".6s" }} /></span>) : <span>{speech.supported ? "Speak naturally, then tap again" : "Voice needs Chrome/Edge — type instead"}</span>}
      </div>
    </div>
  );
}

// Saves the currently highlighted text (1–6 words) to vocabulary.
export function SaveSelection({ saveWord, notify }: { saveWord: (w: string) => void; notify: StepProps["notify"] }) {
  return (
    <button
      type="button"
      className="btn ghost sm"
      title="Highlight a word or phrase, then tap to save it to Vocabulary"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        const text = (window.getSelection()?.toString() || "").replace(/\s+/g, " ").trim().replace(/^[^\w']+|[^\w']+$/g, "");
        const words = text ? text.split(" ").length : 0;
        if (!words) notify("Highlight a word or phrase first, then tap Save word.", "info");
        else if (words > 6) notify("Pick a shorter phrase (up to 6 words).", "info");
        else saveWord(text);
      }}
    >＋ Save word</button>
  );
}

export const Busy = ({ label }: { label: string }) => <span className="busy"><span className="spinner" aria-hidden />{label}</span>;
