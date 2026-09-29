// Pure logic for the English tab: day plan, step completion, streaks, scores,
// spaced-repetition vocabulary and mistake grouping. No React, no DOM (except the
// small `load` helper), so it can be unit-tested.
// Storage keys are unchanged from the original English tab:
//   pos_eng_start, pos_eng_<date>, pos_engdrill_<date>, pos_engpron_<date>,
//   pos_engspell_<date>, pos_eng_vocab, pos_eng_mistakes
// New: pos_eng_mastered (ids of mistakes marked as mastered).

export const PLAN_DAYS = 45;

export type StepKey = "lesson" | "speak" | "write" | "drill" | "pronounce" | "spell";
export const STEPS: { key: StepKey; label: string; icon: string; minutes: number; core: boolean; blurb: string }[] = [
  { key: "lesson", label: "Lesson", icon: "📘", minutes: 15, core: true, blurb: "Learn today's topic" },
  { key: "speak", label: "Speak", icon: "🎤", minutes: 15, core: true, blurb: "Chat with your coach" },
  { key: "write", label: "Write", icon: "✍️", minutes: 15, core: true, blurb: "Get your essay corrected" },
  { key: "drill", label: "Shadow", icon: "🔁", minutes: 10, core: false, blurb: "Repeat after me" },
  { key: "pronounce", label: "Pronounce", icon: "🗣️", minutes: 5, core: false, blurb: "Say tricky words" },
  { key: "spell", label: "Spell", icon: "🔤", minutes: 5, core: false, blurb: "Dictation practice" },
];

export type ChatMsg = { role: "user" | "bot"; content: string; corrected?: string; issues?: string[] };
export type EngDay = { lesson?: string; chat?: ChatMsg[]; essay?: string; essayResult?: string; report?: string };
export type Drill = { sentences: string[]; idx: number; attempts: { target: string; said: string }[]; review: string };
export type WordSet = { items: { word: string; tip?: string; hint?: string }[]; idx: number; right: number; last?: any; input?: string };

export type Reader = (key: string) => string | null;

export const keys = {
  start: "pos_eng_start",
  day: (d: string) => `pos_eng_${d}`,
  drill: (d: string) => `pos_engdrill_${d}`,
  pron: (d: string) => `pos_engpron_${d}`,
  spell: (d: string) => `pos_engspell_${d}`,
  vocab: "pos_eng_vocab",
  notes: "pos_eng_mistakes",
  mastered: "pos_eng_mastered",
};

export function parse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try { const v = JSON.parse(raw); return v == null ? fallback : v; } catch { return fallback; }
}
export const load = <T,>(key: string, fallback: T): T =>
  typeof window === "undefined" ? fallback : parse(localStorage.getItem(key), fallback);

/* ---------- dates ---------- */
export function dstr(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function fromDstr(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
export function addDays(s: string, n: number) { const d = fromDstr(s); d.setDate(d.getDate() + n); return dstr(d); }
export function daysBetween(a: string, b: string) { return Math.round((fromDstr(b).getTime() - fromDstr(a).getTime()) / 86_400_000); }
export function dayIndex(start: string, date: string) { return Math.max(0, Math.min(PLAN_DAYS - 1, daysBetween(start, date))); }

/* ---------- step completion ---------- */
export type DayStatus = Record<StepKey, boolean>;

export function stepStatus(read: Reader, date: string): DayStatus {
  const day = parse<EngDay>(read(keys.day(date)), {});
  const drill = parse<Partial<Drill>>(read(keys.drill(date)), {});
  const pron = parse<Partial<WordSet>>(read(keys.pron(date)), {});
  const spell = parse<Partial<WordSet>>(read(keys.spell(date)), {});
  const userTurns = (day.chat || []).filter((m) => m.role === "user").length;
  const setDone = (s: Partial<WordSet>) => !!s.items?.length && (s.idx ?? 0) >= s.items.length;
  return {
    lesson: !!day.lesson?.trim(),
    speak: !!day.report?.trim() || userTurns >= 4,
    write: !!day.essayResult?.trim(),
    drill: !!drill.review?.trim() || (!!drill.sentences?.length && (drill.idx ?? 0) >= drill.sentences.length),
    pronounce: setDone(pron),
    spell: setDone(spell),
  };
}

export const doneCount = (s: DayStatus) => STEPS.filter((x) => s[x.key]).length;
export const coreDone = (s: DayStatus) => STEPS.filter((x) => x.core && s[x.key]).length;
export const CORE_TOTAL = STEPS.filter((x) => x.core).length;

export type DayState = "done" | "partial" | "missed" | "today" | "future";
export function dayState(s: DayStatus, date: string, todayStr: string): DayState {
  if (date > todayStr) return "future";
  if (coreDone(s) === CORE_TOTAL) return "done";
  if (doneCount(s) > 0) return date === todayStr ? "today" : "partial";
  return date === todayStr ? "today" : "missed";
}

// Consecutive practice days ending today (or yesterday, so an unfinished today doesn't break it).
export function streak(read: Reader, todayStr: string, maxLookback = 400): { current: number; best: number } {
  const active = (d: string) => doneCount(stepStatus(read, d)) > 0;
  let current = 0;
  let d = active(todayStr) ? todayStr : addDays(todayStr, -1);
  while (current < maxLookback && active(d)) { current += 1; d = addDays(d, -1); }
  let best = 0, run = 0;
  for (let i = maxLookback; i >= 0; i -= 1) { if (active(addDays(todayStr, -i))) { run += 1; best = Math.max(best, run); } else run = 0; }
  return { current, best: Math.max(best, current) };
}

/* ---------- scores ---------- */
export type Scores = { fluency: number | null; grammar: number | null; vocabulary: number | null; pronunciation: number | null; overall: number | null; level: string | null };

export function parseScores(report: string | undefined, pron?: Partial<WordSet>): Scores {
  const r = String(report || "");
  const grab = (re: RegExp) => { const m = r.match(re); if (!m) return null; const v = +m[1]; return v >= 0 && v <= 100 ? v : null; };
  const fluency = grab(/fluency[^0-9]*(\d{1,3})/i), grammar = grab(/grammar[^0-9]*(\d{1,3})/i), vocabulary = grab(/vocab\w*[^0-9]*(\d{1,3})/i);
  // Pronunciation = word accuracy from that day's pronunciation set (speech-to-text based).
  const pronunciation = pron?.items?.length && (pron.idx ?? 0) > 0 ? Math.round(((pron.right ?? 0) / Math.min(pron.idx ?? 0, pron.items.length)) * 100) : null;
  const vals = [fluency, grammar, vocabulary].filter((v): v is number => v != null);
  const overall = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const level = (r.match(/\b(A1|A2|B1|B2|C1|C2)\b/) || [])[1] || null;
  return { fluency, grammar, vocabulary, pronunciation, overall, level };
}

export function scoreHistory(read: Reader, todayStr: string, days = 90): ({ date: string } & Scores)[] {
  const out: ({ date: string } & Scores)[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(todayStr, -i);
    const day = parse<EngDay>(read(keys.day(date)), {});
    if (!day.report) continue;
    const s = parseScores(day.report, parse<Partial<WordSet>>(read(keys.pron(date)), {}));
    if (s.overall != null) out.push({ date, ...s });
  }
  return out;
}

export function levelLabel(overall: number | null) {
  if (overall == null) return "Not scored yet";
  return overall >= 85 ? "Advanced" : overall >= 70 ? "Upper-intermediate" : overall >= 55 ? "Intermediate" : "Building up";
}

/* ---------- vocabulary (spaced repetition) ---------- */
export type VocabItem = { id: string; word: string; meaning: string; example: string; level: number; due: string; added?: string };
export const INTERVALS = [1, 3, 7, 21, 45, 90]; // days until next review, by level
export type Grade = "again" | "good" | "easy";

export function gradeCard(item: VocabItem, grade: Grade, todayStr: string): VocabItem {
  if (grade === "again") return { ...item, level: 0, due: todayStr };
  const level = Math.min(INTERVALS.length - 1, (item.level || 0) + (grade === "easy" ? 2 : 1));
  return { ...item, level, due: addDays(todayStr, INTERVALS[level]) };
}
export const dueCards = (items: VocabItem[], todayStr: string) => items.filter((x) => (x.due || todayStr) <= todayStr);
export const isLearned = (x: VocabItem) => (x.level || 0) >= 3;

/* ---------- mistakes ---------- */
export type Mistake = { id: string; date: string; issue: string; better: string; source: "speaking" | "manual"; category: string };

export const CATEGORIES: { key: string; label: string; re: RegExp }[] = [
  { key: "pronunciation", label: "Pronunciation", re: /pronounc/i },
  { key: "tense", label: "Verb tenses", re: /tense|past simple|present perfect|\bpast\b|\bfuture\b|irregular|went|bought|\bhad\b/i },
  { key: "article", label: "Articles (a / an / the)", re: /article|'the'|"the"|\ban?\b article|missing 'an?'/i },
  { key: "preposition", label: "Prepositions", re: /preposition|\b(in|on|at|to|for|with|of|about) instead\b|'(in|on|at|to|for|with)'/i },
  { key: "agreement", label: "Subject–verb agreement", re: /agree|subject|third person|\bplural\b|singular/i },
  { key: "order", label: "Word order", re: /word order|\border\b/i },
  { key: "choice", label: "Word choice", re: /word choice|more natural|better word|instead of|collocation|vocabulary/i },
  { key: "mechanics", label: "Spelling & capitals", re: /capital|spell/i },
];
export function categorize(issue: string) { return (CATEGORIES.find((c) => c.re.test(issue)) || { key: "other" }).key; }
export const categoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label || "Other";

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

export function collectMistakes(read: Reader, todayStr: string, days = 90): Mistake[] {
  const out: Mistake[] = [];
  const notes = parse<any[]>(read(keys.notes), []);
  notes.forEach((n, i) => {
    if (!n || typeof n.issue !== "string") return;
    out.push({ id: n.id || `note-${i}-${hash(n.issue)}`, date: n.date || todayStr, issue: n.issue, better: n.better || "", source: "manual", category: categorize(n.issue) });
  });
  for (let i = 0; i < days; i += 1) {
    const date = addDays(todayStr, -i);
    const day = parse<EngDay>(read(keys.day(date)), {});
    for (const m of day.chat || []) {
      if (m.role !== "bot") continue;
      for (const issue of m.issues || []) {
        if (typeof issue !== "string" || !issue.trim()) continue;
        out.push({ id: `${date}-${hash(issue)}`, date, issue, better: m.corrected || "", source: "speaking", category: categorize(issue) });
      }
    }
  }
  return out;
}

export function groupByCategory(list: Mistake[]) {
  const groups = new Map<string, Mistake[]>();
  for (const m of list) { if (!groups.has(m.category)) groups.set(m.category, []); groups.get(m.category)!.push(m); }
  return [...groups.entries()].map(([key, items]) => ({ key, label: categoryLabel(key), items })).sort((a, b) => b.items.length - a.items.length);
}

/* ---------- text helpers ---------- */
export const norm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
export const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
