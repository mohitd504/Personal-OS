"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { dstr, dueCards, keys, load, uid, type StepKey, type VocabItem } from "./english-core";
import { post } from "./api";
import { useSpeech } from "./useSpeech";
import TodayPlan from "./TodayPlan";
import Vocabulary from "./Vocabulary";
import Mistakes from "./Mistakes";
import Progress from "./Progress";
import Scenarios from "./Scenarios";

type Tab = "today" | "vocab" | "mistakes" | "progress" | "scenarios";

export default function EnglishWorkspace() {
  return <ToastProvider><Workspace /></ToastProvider>;
}

function normalizeVocab(raw: any[]): VocabItem[] {
  const today = dstr(new Date());
  return (Array.isArray(raw) ? raw : []).filter((x) => x && x.word).map((x) => ({
    id: x.id || uid(), word: String(x.word), meaning: x.meaning || "", example: x.example || "", level: Number(x.level) || 0, due: x.due || today, added: x.added,
  }));
}

function Workspace() {
  const notify = useToast();
  const speech = useSpeech();
  const todayStr = dstr(new Date());
  const [tab, setTab] = useState<Tab>("today");
  const [start] = useState<string>(() => {
    const s = load<string>(keys.start, "");
    if (s) return s;
    try { localStorage.setItem(keys.start, JSON.stringify(todayStr)); } catch {}
    return todayStr;
  });

  // `rev` tells derived views (checkmarks, journey, progress) that stored data changed.
  // Debounced so typing an essay doesn't recompute the journey on every keystroke.
  const [rev, setRev] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bump = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setRev((r) => r + 1), 250); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const [vocab, setVocabState] = useState<VocabItem[]>(() => normalizeVocab(load(keys.vocab, [])));
  const setVocab = useCallback((items: VocabItem[]) => {
    setVocabState(items);
    try { localStorage.setItem(keys.vocab, JSON.stringify(items)); } catch {}
    bump();
  }, [bump]);
  const vocabRef = useRef(vocab);
  vocabRef.current = vocab;

  const addWord = useCallback(async (word: string) => {
    const w = word.trim();
    if (!w) return;
    if (vocabRef.current.some((x) => x.word.toLowerCase() === w.toLowerCase())) { notify(`“${w}” is already in your deck`, "info"); return; }
    const item: VocabItem = { id: uid(), word: w, meaning: "", example: "", level: 0, due: todayStr, added: todayStr };
    setVocab([item, ...vocabRef.current]);
    notify(`Saved “${w}” — adding meaning…`, "ok");
    const { data } = await post<{ word: string; meaning: string; example: string }>("/api/vocab-explain", { word: w });
    if (data?.meaning) setVocab(vocabRef.current.map((x) => (x.id === item.id ? { ...x, word: data.word || x.word, meaning: data.meaning, example: data.example || "" } : x)));
  }, [notify, setVocab, todayStr]);
  const saveWord = useCallback((w: string) => { void addWord(w); }, [addWord]);

  const [scenarioRequest, setScenarioRequest] = useState<string | null>(null);
  const [jumpTo, setJumpTo] = useState<{ date?: string; step?: StepKey } | null>(null);
  const due = useMemo(() => dueCards(vocab, todayStr).length, [vocab, todayStr]);

  const tabs: [Tab, string, string | number | null][] = [
    ["today", "Today", null], ["vocab", "Vocabulary", due || null], ["mistakes", "Mistakes", null], ["progress", "Progress", null], ["scenarios", "Scenarios", null],
  ];

  return (
    <div className="eng">
      <div className="eng-top">
        <div className="head"><h1>English Fluency</h1><p>Speak, write and review every day — a 45-day plan from intermediate to fluent.</p></div>
        <div className="tabbar" role="tablist" aria-label="English sections">
          {tabs.map(([k, label, badge]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={`tabbar__tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>
              {label}{badge ? <span className="tabbar__badge">{badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Today stays mounted so an in-progress conversation or drill survives switching tabs. */}
      <div hidden={tab !== "today"}>
        <TodayPlan start={start} todayStr={todayStr} speech={speech} saveWord={saveWord} notify={notify} rev={rev} bump={bump}
          scenarioRequest={scenarioRequest} onScenarioHandled={() => setScenarioRequest(null)} jumpTo={jumpTo} />
      </div>
      {tab === "vocab" && <Vocabulary items={vocab} setItems={setVocab} addWord={addWord} todayStr={todayStr} speech={speech} notify={notify} />}
      {tab === "mistakes" && <Mistakes todayStr={todayStr} rev={rev} bump={bump} notify={notify} />}
      {tab === "progress" && <Progress start={start} todayStr={todayStr} rev={rev} onOpenDay={(date) => { setJumpTo({ date }); setTab("today"); }} />}
      {tab === "scenarios" && <Scenarios onStart={(s) => { setScenarioRequest(s); setTab("today"); }} />}
    </div>
  );
}
