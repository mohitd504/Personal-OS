import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validAccessToken } from "@/lib/strava";
export async function GET() {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  if (!email) return Response.json({ connected: false, error: "unauthorized" });
  const at = await validAccessToken(email);
  if (!at) return Response.json({ connected: false });
  const after = Math.floor(Date.now() / 1000) - 60 * 86400; // last 60 days
  const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`, { headers: { Authorization: `Bearer ${at}` } });
  const acts = await r.json();
  if (!Array.isArray(acts)) return Response.json({ connected: true, activities: [] });
  const isWatch = (dev: string) => /(fitbit|garmin|apple|amazfit|coros|polar|wahoo|watch|wear)/i.test(dev || "");
  const mapped = acts.map((a: any) => ({
    id: a.id, name: a.name, type: a.type, date: (a.start_date_local || "").slice(0, 10),
    distance: Math.round((a.distance || 0) / 100) / 10, duration: Math.round((a.moving_time || 0) / 60),
    cal: a.kilojoules ? Math.round(a.kilojoules) : 0,
    avgHR: a.average_heartrate ? Math.round(a.average_heartrate) : "", maxHR: a.max_heartrate ? Math.round(a.max_heartrate) : "",
    device: a.device_name || "", source: isWatch(a.device_name) ? "watch" : "app",
  }));
  return Response.json({ connected: true, activities: mapped });
}
