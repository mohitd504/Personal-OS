import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  const base = process.env.NEXTAUTH_URL || "";
  if (!email) return Response.redirect(base + "/?strava=signin");
  if (!process.env.STRAVA_CLIENT_ID) return Response.redirect(base + "/?strava=noconfig");
  const redirect_uri = `${base}/api/strava/callback`;
  const url = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&approval_prompt=auto&scope=read,activity:read_all&state=${encodeURIComponent(email)}`;
  return Response.redirect(url);
}
