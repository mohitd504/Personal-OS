import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  const base = process.env.NEXTAUTH_URL || "";
  if (!email) return Response.redirect(base + "/?ghealth=signin");
  if (!process.env.GHEALTH_CLIENT_ID) return Response.redirect(base + "/?ghealth=noconfig");
  const redirect = `${base}/api/ghealth/callback`;
  const scope = [
    "openid", "email",
    "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
    "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
    "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
  ].join(" ");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GHEALTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&access_type=offline&prompt=consent&include_granted_scopes=false&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(email)}`;
  return Response.redirect(url);
}
