import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validGhealthToken } from "@/lib/ghealth";

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* recursively find the first numeric value whose key matches the regex */
function findNum(obj: any, re: RegExp): number | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (re.test(k)) { const n = parseFloat(v); if (!isNaN(n)) return n; }
    if (v && typeof v === "object") { const r = findNum(v, re); if (r !== undefined) return r; }
  }
  return undefined;
}
function findStr(obj: any, re: RegExp): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (re.test(k) && typeof v === "string" && !/^\d/.test(v)) return v;
    if (v && typeof v === "object") { const r = findStr(v, re); if (r !== undefined) return r; }
  }
  return undefined;
}
/* find a start date: accepts RFC3339 strings and civil {year,month,day} objects */
function findStart(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (/start/i.test(k)) {
      if (typeof v === "string") { const m = v.match(/\d{4}-\d{2}-\d{2}/); if (m) return m[0]; }
      if (v && typeof v === "object" && v.year && v.month && v.day) return `${v.year}-${String(v.month).padStart(2, "0")}-${String(v.day).padStart(2, "0")}`;
    }
    if (v && typeof v === "object") { const r = findStart(v); if (r) return r; }
  }
  return undefined;
}
/* activity type: prefer explicit type fields, ignore resource paths, else infer from pace */
function findType(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (/activityType|exerciseType|workoutType|sportType|segmentType/i.test(k) && typeof v === "string" && !v.includes("/")) return v;
    if (v && typeof v === "object") { const r = findType(v); if (r) return r; }
  }
  return undefined;
}

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  if (!email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const at = await validGhealthToken(email);
  if (!at) return Response.json({ connected: false });

  const url = new URL(req.url);
  const days = Math.min(180, +(url.searchParams.get("days") || 14));
  const debug = url.searchParams.get("debug") === "1";
  const start = new Date(); start.setDate(start.getDate() - days);
  const end = new Date(); end.setDate(end.getDate() + 1);
  const filter = `exercise.interval.civil_start_time >= "${dstr(start)}" AND exercise.interval.civil_start_time < "${dstr(end)}"`;

  try {
    // page through the full history (exercise pageSize maxes at 25)
    let raw: any[] = []; let pageToken = ""; let guard = 0;
    do {
      const u = `https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints?pageSize=25&filter=${encodeURIComponent(filter)}` + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
      const rp = await fetch(u, { headers: { Authorization: `Bearer ${at}`, Accept: "application/json" } });
      const jp = await rp.json();
      if (jp.error) { if (!raw.length) return Response.json({ connected: true, error: jp.error.message || "api error", code: jp.error.code }); break; }
      raw = raw.concat(jp.dataPoints || []);
      pageToken = jp.nextPageToken || ""; guard++;
    } while (pageToken && guard < 30);
    const j = { dataPoints: raw };

    const localDate = (iso: string, off: string) => {
      const t = Date.parse(iso || ""); if (isNaN(t)) return dstr(new Date());
      const secs = parseInt(off || "0", 10) || 0;
      return new Date(t + secs * 1000).toISOString().slice(0, 10);
    };
    let activities = (j.dataPoints || []).map((dp: any) => {
      const ex = dp.exercise || dp;
      const ms = ex.metricsSummary || {};
      const iv = ex.interval || {};
      const date = localDate(iv.startTime, iv.startUtcOffset);
      const distance = ms.distanceMillimeters ? Math.round((+ms.distanceMillimeters) / 1_000_000 * 100) / 100 : 0;
      const steps = Math.round(+ms.steps || 0);
      const cal = Math.round(+ms.caloriesKcal || 0);
      const avgHR = Math.round(+ms.averageHeartRateBeatsPerMinute || 0);
      const azMin = Math.round(+ms.activeZoneMinutes || 0);
      const durSec = parseInt(ex.activeDuration || "0", 10) || 0;
      const duration = Math.round(durSec / 60);
      const avgSpeed = distance && duration ? Math.round(distance / (duration / 60) * 10) / 10 : 0;
      const laps = Array.isArray(ex.splits) ? ex.splits.length : 0;
      let type = (ex.exerciseType || ex.displayName || "Activity").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
      const resName = typeof dp.name === "string" ? dp.name : "";
      const id = "gh_" + (resName ? resName.split("/").pop() : `${iv.startTime || date}_${duration}`);
      return { id, date, type, distance, duration, avgSpeed, activeZone: azMin, cal, avgHR, maxHR: 0, minHR: 0, steps, laps, source: "watch" };
    });
    // drop tiny auto/idle blips, keep real sessions (incl. bike rides with calories but no distance)
    activities = activities.filter((a: any) => a.cal >= 30 || a.distance >= 0.3 || a.duration >= 8);
    const seen: any = {}; activities = activities.filter((a: any) => (seen[a.id] ? false : (seen[a.id] = true)));

    const out: any = { ok: true, connected: true, activities };
    if (debug) out.debug = j.dataPoints;
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ connected: true, error: e.message });
  }
}
