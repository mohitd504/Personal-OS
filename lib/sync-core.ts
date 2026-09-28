// Pure per-key sync logic shared by SyncManager (client) and /api/sync (validation).
// Each pos_* key carries the time it was last edited ("t"). The newest edit wins per key,
// so edits to different keys on different devices no longer overwrite each other.

export type SyncChange = { v: string; t: number };
export type SyncChanges = Record<string, SyncChange>;

export type SyncMeta = {
  times: Record<string, number>; // last known edit time per key (local or applied from server)
  dirty: Record<string, true>;   // keys edited locally and not yet acknowledged by the server
  cursor: number;                // server time of the last pull (-1 = never pulled / full pull)
};

export type Store = { get(key: string): string | null; set(key: string, value: string): void };

// Kept outside the pos_ namespace so it is neither synced nor exported in backups.
export const SYNC_META_KEY = "possync_meta";
// Pull a little before the last cursor to cover pushes that committed while we pulled.
export const CURSOR_OVERLAP_MS = 10_000;

export const emptyMeta = (): SyncMeta => ({ times: {}, dirty: {}, cursor: -1 });

export function parseMeta(raw: string | null): SyncMeta {
  try {
    const m = raw ? JSON.parse(raw) : null;
    if (m && typeof m === "object" && m.times && m.dirty && typeof m.cursor === "number") return m;
  } catch {}
  return emptyMeta();
}

export function parseChanges(input: unknown): SyncChanges | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: SyncChanges = {};
  for (const [key, c] of Object.entries(input as Record<string, any>)) {
    if (!key.startsWith("pos_") || !c || typeof c.v !== "string") return null;
    const t = Number(c.t ?? 0);
    if (!Number.isFinite(t)) return null;
    out[key] = { v: c.v, t: Math.trunc(t) };
  }
  return out;
}

export function recordLocalWrite(meta: SyncMeta, key: string, now: number) {
  // Never go backwards in time for a key, even if the device clock jumps back.
  meta.times[key] = Math.max(now, (meta.times[key] ?? 0) + 1);
  meta.dirty[key] = true;
}

export function buildPush(meta: SyncMeta, store: Store): SyncChanges {
  const changes: SyncChanges = {};
  for (const key of Object.keys(meta.dirty)) {
    const v = store.get(key);
    if (v == null) { delete meta.dirty[key]; continue; }
    changes[key] = { v, t: meta.times[key] ?? 0 };
  }
  return changes;
}

// After the server accepted a push. A key edited again while the request was in flight
// has a newer time than what was sent, so it stays dirty for the next push.
// Rejected keys (server already had a newer edit) take the server's value.
export function ackPush(meta: SyncMeta, sent: SyncChanges, rejected: SyncChanges, store: Store): number {
  let applied = 0;
  for (const [key, c] of Object.entries(sent)) {
    if ((meta.times[key] ?? 0) !== c.t) continue;
    delete meta.dirty[key];
    const r = rejected[key];
    if (r && typeof r.v === "string") {
      if (store.get(key) !== r.v) { store.set(key, r.v); applied += 1; }
      meta.times[key] = r.t;
    }
  }
  return applied;
}

// Apply changes pulled from the server. Returns how many local values changed.
export function applyRemote(meta: SyncMeta, changes: SyncChanges, store: Store): number {
  let applied = 0;
  for (const [key, c] of Object.entries(changes)) {
    if (!key.startsWith("pos_") || typeof c?.v !== "string") continue;
    if (meta.dirty[key]) continue; // our pending edit is newer; the push will settle it
    if (c.t < (meta.times[key] ?? 0)) continue;
    if (store.get(key) !== c.v) { store.set(key, c.v); applied += 1; }
    meta.times[key] = c.t;
  }
  return applied;
}

// After a full pull: local keys the server has never seen get pushed.
export function markLocalOnly(meta: SyncMeta, localKeys: string[], remote: SyncChanges) {
  for (const key of localKeys) if (key.startsWith("pos_") && !(key in remote)) meta.dirty[key] = true;
}

export function advanceCursor(meta: SyncMeta, serverNow: number) {
  if (serverNow >= 0) meta.cursor = Math.max(meta.cursor, serverNow - CURSOR_OVERLAP_MS);
}
