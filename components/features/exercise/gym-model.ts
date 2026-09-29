// Gym plan helpers: per-exercise history from pos_workouts, a simple progression
// suggestion, and muscle focus. Pure, so they can be unit-tested.
// pos_workouts entries: { date, type, volume, completion, duration,
//   exercises: [{ name, sets: [{ w, r }], topWeight, reps, missedSets }] }

export type LoggedSet = { w: number; r: number };
export type LoggedExercise = { name: string; sets?: LoggedSet[]; topWeight?: number; reps?: number; missedSets?: number };
export type Workout = { id?: string; date: string; type?: string; volume?: number; completion?: number; duration?: number; exercises?: LoggedExercise[] };

export type History = { date: string; topWeight: number; sets: LoggedSet[]; missedSets: number; best: number; sessions: number };

export function exerciseHistory(name: string, workouts: Workout[]): History | null {
  const hits = workouts
    .filter((w) => (w.exercises || []).some((e) => e.name === name))
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!hits.length) return null;
  const last = hits[0].exercises!.find((e) => e.name === name)!;
  const sets = Array.isArray(last.sets) ? last.sets.map((s) => ({ w: +s.w || 0, r: +s.r || 0 })) : [];
  const top = +(last.topWeight ?? 0) || Math.max(0, ...sets.map((s) => s.w));
  const best = Math.max(0, ...hits.map((w) => +(w.exercises!.find((e) => e.name === name)!.topWeight ?? 0) || 0));
  return { date: hits[0].date, topWeight: top, sets, missedSets: +(last.missedSets ?? 0) || 0, best, sessions: hits.length };
}

// Double progression: hit every planned set at the target reps → add load; otherwise repeat.
export function suggestion(h: History | null, targetReps: number, targetSets: number): { weight: number | null; text: string; kind: "new" | "up" | "repeat" } {
  if (!h || !h.topWeight) return { weight: null, text: "Find a weight you can do for all sets with 1–2 reps in reserve", kind: "new" };
  const hitAll = h.missedSets === 0 && h.sets.length >= targetSets && h.sets.slice(0, targetSets).every((s) => s.r >= targetReps);
  if (!hitAll) return { weight: h.topWeight, text: `Repeat ${h.topWeight} kg and hit ${targetSets}×${targetReps}`, kind: "repeat" };
  const step = h.topWeight >= 40 ? 2.5 : h.topWeight >= 10 ? 1.25 : 1;
  const next = Math.round((h.topWeight + step) * 4) / 4;
  return { weight: next, text: `Try ${next} kg (+${step})`, kind: "up" };
}

// Muscle groups from "Chest · triceps · front delts" style target strings.
export function muscleFocus(targets: string[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of targets) {
    for (const raw of t.split(/[·,/]/)) {
      const m = raw.trim().toLowerCase().replace(/^(upper|lower|front|rear|side)\s+/, "");
      if (!m || /see today|training focus/.test(m)) continue;
      const name = m.charAt(0).toUpperCase() + m.slice(1);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function weekStats(workouts: Workout[], today: string) {
  const since = new Date(`${today}T12:00`); since.setDate(since.getDate() - 6);
  const s = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-${String(since.getDate()).padStart(2, "0")}`;
  const week = workouts.filter((w) => w.date >= s && w.date <= today);
  return { sessions: week.length, volume: Math.round(week.reduce((a, w) => a + (+(w.volume ?? 0) || 0), 0)), minutes: week.reduce((a, w) => a + (+(w.duration ?? 0) || 0), 0) };
}
