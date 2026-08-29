import { saveGhealth } from "@/lib/ghealth";
export async function GET(req: Request) {
  const base = process.env.NEXTAUTH_URL || "";
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const email = url.searchParams.get("state");
  if (!code || !email) return Response.redirect(base + "/?ghealth=error");
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GHEALTH_CLIENT_ID as string, client_secret: process.env.GHEALTH_CLIENT_SECRET as string, redirect_uri: `${base}/api/ghealth/callback`, grant_type: "authorization_code" }) });
    const tok = await r.json();
    if (tok.access_token) { await saveGhealth(email, tok); return Response.redirect(base + "/?ghealth=connected"); }
  } catch (e) {}
  return Response.redirect(base + "/?ghealth=error");
}
