import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseChanges, type SyncChanges } from "@/lib/sync-core";

// Per-key sync. New clients push only changed keys ({ changes }) and pull only keys the
// server received since their cursor (GET ?since=). Uses the sync_push / sync_pull
// functions from supabase/sync_v2.sql; if those aren't installed yet it falls back to a
// read-merge-write so partial pushes never wipe other keys.
// Old cached clients (full { data } snapshots, GET without ?since) keep working.

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: SB_KEY as string, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" });
const MAX_BYTES = 4_000_000;

async function email() {
  const s = await getServerSession(authOptions);
  return (s as any)?.user?.email as string | undefined;
}

// Returns the RPC result, or null if the function isn't installed (PostgREST 404).
async function rpc(name: string, args: Record<string, unknown>): Promise<any | null> {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${name}`, { method: "POST", headers: H(), body: JSON.stringify(args) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${name} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function readData(e: string): Promise<Record<string, unknown> | null> {
  const r = await fetch(`${SB_URL}/rest/v1/user_data?email=eq.${encodeURIComponent(e)}&select=data`, { headers: H() });
  if (!r.ok) throw new Error(`read failed: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return Array.isArray(rows) && rows[0]?.data && typeof rows[0].data === "object" ? rows[0].data : null;
}

export async function GET(req: Request) {
  const e = await email();
  if (!e) return Response.json({ error: "unauthorized" }, { status: 401 });
  const sinceParam = new URL(req.url).searchParams.get("since");
  if (!SB_URL || !SB_KEY) {
    return sinceParam == null ? Response.json({ data: null, version: 2, note: "sync not configured" }) : Response.json({ now: -1, changes: {}, note: "sync not configured" });
  }
  try {
    if (sinceParam == null) return Response.json({ data: await readData(e), version: 2 }); // legacy clients
    const since = Number(sinceParam);
    const result = await rpc("sync_pull", { p_email: e, p_since: Number.isFinite(since) ? Math.trunc(since) : -1 });
    if (result) return Response.json(result);
    // sync_v2.sql not installed: send everything with t=0 and no cursor (same cost as before).
    const data = (await readData(e)) || {};
    const changes: SyncChanges = {};
    for (const [key, v] of Object.entries(data)) if (key.startsWith("pos_") && typeof v === "string") changes[key] = { v, t: 0 };
    return Response.json({ now: -1, changes, legacy: true });
  } catch (err: any) {
    console.error("[sync] GET", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const e = await email();
  if (!e) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!SB_URL || !SB_KEY) return Response.json({ ok: false, note: "sync not configured" });
  const text = await req.text();
  if (text.length > MAX_BYTES) return Response.json({ ok: false, error: "sync payload too large" }, { status: 413 });
  let body: any;
  try { body = JSON.parse(text); } catch { return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 }); }

  // New clients send { changes: { key: { v, t } } }; legacy clients send { data: { key: value } }.
  let changes: SyncChanges | null;
  if (body?.changes !== undefined) {
    changes = parseChanges(body.changes);
  } else if (body?.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    changes = parseChanges(Object.fromEntries(Object.entries(body.data).map(([k, v]) => [k, { v, t: 0 }])));
  } else {
    changes = null;
  }
  if (!changes) return Response.json({ ok: false, error: "invalid sync payload" }, { status: 400 });
  if (!Object.keys(changes).length) return Response.json({ ok: true, now: -1, rejected: {} });

  try {
    const result = await rpc("sync_push", { p_email: e, p_changes: changes });
    if (result) return Response.json({ ok: true, ...result });
    // sync_v2.sql not installed: merge into the stored blob instead of replacing it.
    const merged: Record<string, unknown> = { ...((await readData(e)) || {}) };
    for (const [key, c] of Object.entries(changes)) merged[key] = c.v;
    const r = await fetch(`${SB_URL}/rest/v1/user_data`, {
      method: "POST",
      headers: { ...H(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([{ email: e, data: merged, updated_at: new Date().toISOString() }]),
    });
    if (!r.ok) throw new Error(`upsert failed: ${r.status} ${await r.text()}`);
    return Response.json({ ok: true, now: -1, rejected: {}, legacy: true });
  } catch (err: any) {
    console.error("[sync] POST", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
