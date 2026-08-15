import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validAccessToken } from "@/lib/strava";

const isWatch = (dev: string) => /(fitbit|garmin|apple|amazfit|coros|polar|wahoo|watch|wear|versa|charge|sense|inspire|luxe)/i.test(dev || "");

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

  const list = acts.slice(0, 30); // cap detail lookups to stay within rate limits
  const mapped = await Promise.all(list.map(async (a: any) => {
    let device = a.device_name || ""; let calDetail = 0;
    try {
      const dr = await fetch(`https://www.strava.com/api/v3/activities/${a.id}`, { headers: { Authorization: `Bearer ${at}` } });
      if (dr.ok) { const det = await dr.json(); device = det.device_name || device; if (det.calories) calDetail = Math.round(det.calories); }
    } catch (e) {}
    const hasGPS = Array.isArray(a.start_latlng) && a.start_latlng.length > 0;
    const source = isWatch(device) ? "watch" : (device ? "app" : (hasGPS ? "app" : "watch"));
    return {
      id: a.id, name: a.name, type: a.type, date: (a.start_date_local || "").slice(0, 10),
      distance: Math.round((a.distance || 0) / 100) / 10, duration: Math.round((a.moving_time || 0) / 60),
      cal: calDetail || (a.kilojoules ? Math.round(a.kilojoules) : 0),
      avgHR: a.average_heartrate ? Math.round(a.average_heartrate) : "", maxHR: a.max_heartrate ? Math.round(a.max_heartrate) : "",
      device, source,
    };
  }));
  return Response.json({ connected: true, activities: mapped });
}
