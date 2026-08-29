import { saveFitbit } from "@/lib/fitbit";
export async function GET(req: Request) {
  const base = process.env.NEXTAUTH_URL || "";
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const email = url.searchParams.get("state");
  if (!code || !email) return Response.redirect(base + "/?fitbit=error");
  try {
    const basic = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64");
    const r = await fetch("https://api.fitbit.com/oauth2/token", { method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: `${base}/api/fitbit/callback` }) });
    const tok = await r.json();
    if (tok.access_token) { await saveFitbit(email, tok); return Response.redirect(base + "/?fitbit=connected"); }
  } catch (e) {}
  return Response.redirect(base + "/?fitbit=error");
}
