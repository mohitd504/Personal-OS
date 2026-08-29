// Fitbit OAuth token storage (Supabase) + refresh. Server-only.
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: KEY as string, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });
function basic() { return Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64"); }

export async function saveFitbit(email: string, tok: any) {
  if (!SB || !KEY) return;
  const expires_at = Math.floor(Date.now() / 1000) + (tok.expires_in || 28800);
  await fetch(`${SB}/rest/v1/fitbit_tokens`, { method: "POST", headers: { ...H(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ email, access_token: tok.access_token, refresh_token: tok.refresh_token, expires_at }]) });
}
export async function getFitbit(email: string) {
  if (!SB || !KEY) return null;
  const r = await fetch(`${SB}/rest/v1/fitbit_tokens?email=eq.${encodeURIComponent(email)}&select=*`, { headers: H() });
  const rows = await r.json(); return Array.isArray(rows) ? rows[0] : null;
}
export async function fitbitToken(email: string): Promise<string | null> {
  const t = await getFitbit(email); if (!t) return null;
  const now = Math.floor(Date.now() / 1000);
  if (t.expires_at && t.expires_at - 120 > now) return t.access_token;
  const r = await fetch("https://api.fitbit.com/oauth2/token", { method: "POST",
    headers: { Authorization: `Basic ${basic()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: t.refresh_token }) });
  const nt = await r.json(); if (nt.access_token) { await saveFitbit(email, nt); return nt.access_token; } return null;
}
