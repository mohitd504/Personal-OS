import { describe, expect, it } from "vitest";
import { ackPush, advanceCursor, applyRemote, buildPush, emptyMeta, markLocalOnly, parseChanges, parseMeta, recordLocalWrite, type Store, type SyncChanges, type SyncMeta } from "@/lib/sync-core";

// In-memory stand-in for the sync_push / sync_pull SQL functions (supabase/sync_v2.sql).
function fakeServer(initial: Record<string, string> = {}) {
  let clock = 1_000_000;
  const data: Record<string, string> = { ...initial };
  const times: Record<string, { t: number; s: number }> = {};
  return {
    data,
    push(changes: SyncChanges) {
      const now = (clock += 100);
      const rejected: SyncChanges = {};
      for (const [k, c] of Object.entries(changes)) {
        if (c.t >= (times[k]?.t ?? 0)) { data[k] = c.v; times[k] = { t: c.t, s: now }; }
        else rejected[k] = { v: data[k], t: times[k].t };
      }
      return { now, rejected };
    },
    pull(since: number) {
      const now = (clock += 100);
      const changes: SyncChanges = {};
      for (const k of Object.keys(data)) if (since < 0 || (times[k]?.s ?? 0) > since) changes[k] = { v: data[k], t: times[k]?.t ?? 0 };
      return { now, changes };
    },
  };
}

function device(server: ReturnType<typeof fakeServer>, initial: Record<string, string> = {}) {
  const local: Record<string, string> = { ...initial };
  const store: Store = { get: (k) => local[k] ?? null, set: (k, v) => { local[k] = v; } };
  const meta: SyncMeta = emptyMeta();
  return {
    local, meta,
    write(key: string, value: string, now: number) { local[key] = value; recordLocalWrite(meta, key, now); },
    push() { const sent = buildPush(meta, store); const r = server.push(sent); return ackPush(meta, sent, r.rejected, store); },
    pull() {
      const full = meta.cursor < 0;
      const r = server.pull(meta.cursor);
      const applied = applyRemote(meta, r.changes, store);
      if (full) markLocalOnly(meta, Object.keys(local), r.changes);
      advanceCursor(meta, r.now);
      return applied;
    },
  };
}

describe("per-key sync", () => {
  it("keeps edits to different keys made on two devices (old sync lost one)", () => {
    const server = fakeServer({ pos_plan: "old-plan", pos_meals: "old-meals" });
    const phone = device(server), laptop = device(server);
    phone.pull(); laptop.pull();
    phone.write("pos_meals", "phone-meals", 5_000);
    laptop.write("pos_plan", "laptop-plan", 5_001);
    phone.push(); laptop.push();
    phone.pull(); laptop.pull();
    expect(server.data).toEqual({ pos_plan: "laptop-plan", pos_meals: "phone-meals" });
    expect(phone.local).toEqual(server.data);
    expect(laptop.local).toEqual(server.data);
  });

  it("newest edit wins when both devices edit the same key", () => {
    const server = fakeServer();
    const a = device(server), b = device(server);
    a.pull(); b.pull();
    b.write("pos_settings", "newer", 9_000);
    a.write("pos_settings", "older", 8_000);
    b.push();
    a.push(); // rejected: server already has a newer edit, a adopts it
    expect(server.data.pos_settings).toBe("newer");
    expect(a.local.pos_settings).toBe("newer");
    expect(a.meta.dirty).toEqual({});
  });

  it("pushes only dirty keys", () => {
    const server = fakeServer();
    const d = device(server, { pos_a: "1", pos_b: "2" });
    d.pull(); d.push();
    d.write("pos_b", "3", 5_000);
    expect(Object.keys(buildPush(d.meta, { get: (k) => d.local[k] ?? null, set: () => {} }))).toEqual(["pos_b"]);
  });

  it("first full pull adopts server values and uploads local-only keys", () => {
    const server = fakeServer({ pos_shared: "server" });
    const d = device(server, { pos_shared: "stale-local", pos_offline_only: "x" });
    expect(d.pull()).toBe(1);
    expect(d.local.pos_shared).toBe("server");
    d.push();
    expect(server.data.pos_offline_only).toBe("x");
  });

  it("does not overwrite a pending local edit with an older server value", () => {
    const server = fakeServer({ pos_k: "server" });
    const d = device(server);
    d.pull();
    d.write("pos_k", "local-pending", 5_000);
    d.pull();
    expect(d.local.pos_k).toBe("local-pending");
  });

  it("keeps a key dirty if it was edited again while the push was in flight", () => {
    const meta = emptyMeta();
    const local: Record<string, string> = {};
    const store: Store = { get: (k) => local[k] ?? null, set: (k, v) => { local[k] = v; } };
    local.pos_k = "v1"; recordLocalWrite(meta, "pos_k", 1_000);
    const sent = buildPush(meta, store);
    local.pos_k = "v2"; recordLocalWrite(meta, "pos_k", 2_000);
    ackPush(meta, sent, {}, store);
    expect(meta.dirty.pos_k).toBe(true);
  });

  it("never moves a key's time backwards when the clock jumps back", () => {
    const meta = emptyMeta();
    recordLocalWrite(meta, "pos_k", 5_000);
    recordLocalWrite(meta, "pos_k", 1_000);
    expect(meta.times.pos_k).toBeGreaterThan(5_000);
  });
});

describe("validation", () => {
  it("rejects non-pos keys and non-string values", () => {
    expect(parseChanges({ other: { v: "x", t: 1 } })).toBeNull();
    expect(parseChanges({ pos_a: { v: 1, t: 1 } })).toBeNull();
    expect(parseChanges({ pos_a: { v: "x" } })).toEqual({ pos_a: { v: "x", t: 0 } });
  });
  it("falls back to empty meta on corrupt storage", () => {
    expect(parseMeta("{not json")).toEqual(emptyMeta());
  });
});
