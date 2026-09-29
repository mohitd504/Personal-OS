// Google refresh-token storage (Supabase), so sign-in doesn't need Google's consent
// screen every time. Google only returns a refresh token when consent is shown, so we
// keep the one from the first consent and reuse it on later one-click sign-ins.
// Server-only. Table + policy: supabase/google_tokens.sql.
const SB = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: KEY as string, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

export async function saveRefreshToken(email: string, refreshToken: string) {
  if (!SB || !KEY) return;
  try {
    const r = await fetch(`${SB}/rest/v1/google_tokens`, {
      method: "POST",
      headers: { ...H(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([{ email, refresh_token: refreshToken, updated_at: new Date().toISOString() }]),
    });
    if (!r.ok) console.error("[google-tokens] save failed", r.status, await r.text().catch(() => ""));
  } catch (err) { console.error("[google-tokens] save error", err); }
}

export async function loadRefreshToken(email: string): Promise<string | null> {
  if (!SB || !KEY) return null;
  try {
    const r = await fetch(`${SB}/rest/v1/google_tokens?email=eq.${encodeURIComponent(email)}&select=refresh_token`, { headers: H() });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows[0]?.refresh_token ? rows[0].refresh_token : null;
  } catch { return null; }
}
