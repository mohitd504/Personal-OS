import { saveTokens } from "@/lib/strava";
export async function GET(req: Request) {
  const base = process.env.NEXTAUTH_URL || "";
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const email = url.searchParams.get("state");
  if (!code || !email) return Response.redirect(base + "/?strava=error");
  try {
    const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, code, grant_type: "authorization_code" }) });
    const tok = await r.json();
    if (tok.access_token) { await saveTokens(email, tok); return Response.redirect(base + "/?strava=connected"); }
  } catch (e) {}
  return Response.redirect(base + "/?strava=error");
}
