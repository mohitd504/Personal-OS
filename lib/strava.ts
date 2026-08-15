// Strava OAuth token storage (Supabase) + refresh helpers. Server-only.
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: KEY as string, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

export async function saveTokens(email: string, tok: any) {
  if (!SB || !KEY) return;
  await fetch(`${SB}/rest/v1/strava_tokens`, { method: "POST", headers: { ...H(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ email, access_token: tok.access_token, refresh_token: tok.refresh_token, expires_at: tok.expires_at }]) });
}
export async function getTokens(email: string) {
  if (!SB || !KEY) return null;
  const r = await fetch(`${SB}/rest/v1/strava_tokens?email=eq.${encodeURIComponent(email)}&select=*`, { headers: H() });
  const rows = await r.json(); return Array.isArray(rows) ? rows[0] : null;
}
export async function validAccessToken(email: string): Promise<string | null> {
  const t = await getTokens(email); if (!t) return null;
  const now = Math.floor(Date.now() / 1000);
  if (t.expires_at && t.expires_at - 120 > now) return t.access_token;
  const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: t.refresh_token }) });
  const nt = await r.json(); if (nt.access_token) { await saveTokens(email, nt); return nt.access_token; } return null;
}
