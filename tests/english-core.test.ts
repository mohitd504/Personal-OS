import { describe, expect, it } from "vitest";
import { addDays, categorize, collectMistakes, dayIndex, dayState, dueCards, gradeCard, groupByCategory, keys, parseScores, stepStatus, streak, type VocabItem } from "@/components/features/english/english-core";

const T = "2026-09-29";
const store = (data: Record<string, unknown>) => (k: string) => (k in data ? JSON.stringify(data[k]) : null);

describe("step status & day state", () => {
  it("reads completion from the existing storage keys", () => {
    const read = store({
      [keys.day(T)]: { lesson: "x", chat: [{ role: "user", content: "a" }], essayResult: "ok" },
      [keys.pron(T)]: { items: [{ word: "a" }, { word: "b" }], idx: 2, right: 1 },
      [keys.drill(T)]: { sentences: ["p1", "p2"], idx: 1, attempts: [], review: "" },
    });
    const s = stepStatus(read, T);
    expect(s).toEqual({ lesson: true, speak: false, write: true, drill: false, pronounce: true, spell: false });
  });
  it("speak counts as done with a report or 4 answers", () => {
    const four = Array.from({ length: 4 }, () => ({ role: "user", content: "hi" }));
    expect(stepStatus(store({ [keys.day(T)]: { chat: four } }), T).speak).toBe(true);
    expect(stepStatus(store({ [keys.day(T)]: { report: "Fluency 70" } }), T).speak).toBe(true);
  });
  it("classifies days", () => {
    const full = { lesson: true, speak: true, write: true, drill: false, pronounce: false, spell: false };
    const none = { lesson: false, speak: false, write: false, drill: false, pronounce: false, spell: false };
    expect(dayState(full, "2026-09-20", T)).toBe("done");
    expect(dayState({ ...none, lesson: true }, "2026-09-20", T)).toBe("partial");
    expect(dayState(none, "2026-09-20", T)).toBe("missed");
    expect(dayState(none, T, T)).toBe("today");
    expect(dayState(none, "2026-10-01", T)).toBe("future");
  });
  it("clamps the plan day index to 1..45", () => {
    expect(dayIndex("2026-09-20", T)).toBe(9);
    expect(dayIndex("2026-01-01", T)).toBe(44);
    expect(dayIndex(T, "2026-09-01")).toBe(0);
  });
});

describe("streak", () => {
  const active = (d: string) => ({ [keys.day(d)]: { lesson: "x" } });
  it("counts consecutive days and survives an unfinished today", () => {
    const read = store({ ...active(addDays(T, -1)), ...active(addDays(T, -2)), ...active(addDays(T, -4)) });
    expect(streak(read, T, 30)).toEqual({ current: 2, best: 2 });
    expect(streak(store({ ...active(T), ...active(addDays(T, -1)) }), T, 30).current).toBe(2);
  });
});

describe("scores", () => {
  it("parses the feedback report and pronunciation accuracy", () => {
    const s = parseScores("## Scores — Fluency 72/100, Grammar: 64/100, Vocabulary 70/100. Level B1", { items: [{ word: "a" }, { word: "b" }, { word: "c" }, { word: "d" }], idx: 4, right: 3 });
    expect(s).toMatchObject({ fluency: 72, grammar: 64, vocabulary: 70, overall: 69, level: "B1", pronunciation: 75 });
  });
  it("returns nulls without a report", () => {
    expect(parseScores("").overall).toBeNull();
  });
});

describe("spaced repetition", () => {
  const card: VocabItem = { id: "1", word: "punctual", meaning: "", example: "", level: 1, due: T };
  it("schedules by grade", () => {
    expect(gradeCard(card, "good", T)).toMatchObject({ level: 2, due: addDays(T, 7) });
    expect(gradeCard(card, "easy", T)).toMatchObject({ level: 3, due: addDays(T, 21) });
    expect(gradeCard(card, "again", T)).toMatchObject({ level: 0, due: T });
  });
  it("caps the level and finds due cards", () => {
    expect(gradeCard({ ...card, level: 5 }, "easy", T).level).toBe(5);
    expect(dueCards([card, { ...card, id: "2", due: addDays(T, 3) }], T).map((c) => c.id)).toEqual(["1"]);
  });
});

describe("mistakes", () => {
  it("categorizes common correction notes", () => {
    expect(categorize("Use past tense 'went' for a finished action")).toBe("tense");
    expect(categorize("Missing article 'the' before market")).toBe("article");
    expect(categorize("Pronounce: 'vegetable' has 3 syllables")).toBe("pronunciation");
    expect(categorize("Capitalise days: Saturday")).toBe("mechanics");
    expect(categorize("Something else entirely")).toBe("other");
  });
  it("collects from chats and manual notes with stable ids, grouped by frequency", () => {
    const read = store({
      [keys.day(T)]: { chat: [{ role: "bot", content: "x", corrected: "I went", issues: ["Use past tense 'went'", "Missing article 'the'"] }] },
      [keys.day(addDays(T, -1))]: { chat: [{ role: "bot", content: "y", issues: ["Wrong tense: use past simple"] }] },
      [keys.notes]: [{ date: T, issue: "I am knowing him", better: "I have known him" }],
    });
    const list = collectMistakes(read, T, 7);
    expect(list).toHaveLength(4);
    expect(collectMistakes(read, T, 7).map((m) => m.id)).toEqual(list.map((m) => m.id));
    expect(groupByCategory(list)[0]).toMatchObject({ key: "tense" });
  });
});
