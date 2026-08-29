// Separate Google Health OAuth (its own project/client), independent of the Gmail/Calendar login.
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: KEY as string, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

export async function saveGhealth(email: string, tok: any, keepRefresh?: string) {
  if (!SB || !KEY) return;
  const expires_at = Math.floor(Date.now() / 1000) + (tok.expires_in || 3600);
  const refresh_token = tok.refresh_token || keepRefresh || "";
  await fetch(`${SB}/rest/v1/ghealth_tokens`, { method: "POST", headers: { ...H(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([{ email, access_token: tok.access_token, refresh_token, expires_at }]) });
}
export async function getGhealth(email: string) {
  if (!SB || !KEY) return null;
  const r = await fetch(`${SB}/rest/v1/ghealth_tokens?email=eq.${encodeURIComponent(email)}&select=*`, { headers: H() });
  const rows = await r.json(); return Array.isArray(rows) ? rows[0] : null;
}
export async function validGhealthToken(email: string): Promise<string | null> {
  const t = await getGhealth(email); if (!t) return null;
  const now = Math.floor(Date.now() / 1000);
  if (t.expires_at && t.expires_at - 120 > now) return t.access_token;
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GHEALTH_CLIENT_ID as string, client_secret: process.env.GHEALTH_CLIENT_SECRET as string, grant_type: "refresh_token", refresh_token: t.refresh_token }) });
  const nt = await r.json(); if (nt.access_token) { await saveGhealth(email, nt, t.refresh_token); return nt.access_token; } return null;
}
