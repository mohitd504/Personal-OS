import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  const base = process.env.NEXTAUTH_URL || "";
  if (!email) return Response.redirect(base + "/?fitbit=signin");
  if (!process.env.FITBIT_CLIENT_ID) return Response.redirect(base + "/?fitbit=noconfig");
  const redirect = `${base}/api/fitbit/callback`;
  const scope = "activity heartrate profile";
  const url = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.FITBIT_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect)}&state=${encodeURIComponent(email)}&expires_in=604800`;
  return Response.redirect(url);
}
