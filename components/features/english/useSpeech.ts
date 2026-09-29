"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Browser speech (Web Speech API): text-to-speech for the coach and speech-to-text for
// the learner. Voice + recognizer use Indian English (en-IN). One microphone session
// at a time, identified by `ctx` so each step knows whether the mic is "theirs".
export type Speech = ReturnType<typeof useSpeech>;

export function useSpeech() {
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [ctx, setCtx] = useState("");
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef("");
  const transcriptRef = useRef("");
  const stoppingRef = useRef(false);
  const onDoneRef = useRef<((text: string) => void) | null>(null);
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;

  const synth = () => (typeof window !== "undefined" ? (window as any).speechSynthesis : null);
  const supported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const speak = useCallback((text: string, force = false) => {
    const s = synth();
    if (!s || (!voiceOnRef.current && !force)) return;
    try {
      const u = new (window as any).SpeechSynthesisUtterance(String(text).replace(/^Fix:[^\n]*\n?/im, ""));
      u.lang = "en-IN"; u.rate = 0.95;
      const vs = s.getVoices() || [];
      const v = vs.find((x: any) => x.lang === "en-IN") || vs.find((x: any) => /en[-_]IN|India|Ravi|Heera|Aditi|Rishi/i.test((x.lang || "") + (x.name || "")));
      if (v) u.voice = v;
      s.cancel(); s.speak(u);
    } catch {}
  }, []);

  const stopVoice = useCallback(() => { try { synth()?.cancel(); } catch {} }, []);

  const start = useCallback((context: string, onDone: (text: string) => void): string | null => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return "Voice input needs Chrome or Edge. You can still type.";
    stopVoice();
    try {
      const rec = new SR();
      rec.lang = "en-IN"; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
      recRef.current = rec; finalRef.current = ""; transcriptRef.current = ""; stoppingRef.current = false; onDoneRef.current = onDone;
      setCtx(context); setListening(true); setTranscript("");
      rec.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i += 1) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalRef.current += t + " "; else interim += t;
        }
        transcriptRef.current = (finalRef.current + interim).trim();
        setTranscript(transcriptRef.current);
      };
      rec.onerror = () => {};
      // Chrome ends recognition after a pause; keep listening until the user taps stop.
      rec.onend = () => { if (!stoppingRef.current) { try { rec.start(); return; } catch {} } setListening(false); };
      rec.start();
      return null;
    } catch {
      setListening(false);
      return "Couldn't start the microphone.";
    }
  }, [stopVoice]);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    const text = (finalRef.current || transcriptRef.current).trim();
    const cb = onDoneRef.current;
    finalRef.current = ""; transcriptRef.current = ""; onDoneRef.current = null;
    setTranscript(""); setCtx("");
    if (text && cb) cb(text);
  }, []);

  useEffect(() => () => { stoppingRef.current = true; try { recRef.current?.stop(); } catch {} stopVoice(); }, [stopVoice]);

  return { voiceOn, setVoiceOn, speak, stopVoice, listening, ctx, transcript, start, stop, supported };
}
