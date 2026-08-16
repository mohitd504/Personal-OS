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
  const days = Math.min(30, +(url.searchParams.get("days") || 14));
  const debug = url.searchParams.get("debug") === "1";
  const start = new Date(); start.setDate(start.getDate() - days);
  const end = new Date(); end.setDate(end.getDate() + 1);
  const filter = `exercise.interval.civil_start_time >= "${dstr(start)}" AND exercise.interval.civil_start_time < "${dstr(end)}"`;

  try {
    const r = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints?pageSize=25&filter=${encodeURIComponent(filter)}`, {
      headers: { Authorization: `Bearer ${at}`, Accept: "application/json" },
    });
    const j = await r.json();
    if (j.error) return Response.json({ connected: true, error: j.error.message || "api error", code: j.error.code });

    let activities = (j.dataPoints || []).map((dp: any) => {
      const date = findStart(dp) || dstr(new Date());
      const distMm = findNum(dp, /millimeter/i) || 0;
      const distance = distMm ? Math.round(distMm / 1_000_000 * 100) / 100 : (findNum(dp, /distance/i) || 0);
      let durSec = findNum(dp, /activeDuration|movingDuration|duration.*seconds|elapsed/i) || 0;
      const durStr = findStr(dp, /duration/i); if (!durSec && durStr) durSec = parseFloat(durStr) || 0;
      const duration = durSec > 300 ? Math.round(durSec / 60) : durSec;
      const cal = Math.round(findNum(dp, /kcal|calorie/i) || 0);
      const avgHR = Math.round(findNum(dp, /beatsPerMinuteAvg|averageHeartRate|avgHeartRate/i) || 0);
      const maxHR = Math.round(findNum(dp, /beatsPerMinuteMax|maxHeartRate|heartRateMax/i) || 0);
      const minHR = Math.round(findNum(dp, /beatsPerMinuteMin|minHeartRate|heartRateMin/i) || 0);
      const steps = Math.round(findNum(dp, /steps.*count|countSum/i) || 0);
      const azMin = Math.round(findNum(dp, /activeZone|zoneMinutes/i) || 0);
      const avgSpeed = distance && duration ? Math.round(distance / (duration / 60) * 10) / 10 : 0;
      // type: explicit field, else infer from pace / distance
      let type = findType(dp);
      if (type) type = type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      else type = avgSpeed >= 8 ? "Run" : avgSpeed >= 4 ? "Walk" : distance >= 0.3 ? "Walk" : "Workout";
      // unique id from the datapoint resource name
      const resName = typeof dp.name === "string" ? dp.name : "";
      const id = "gh_" + (resName ? resName.split("/").pop() : `${date}_${duration}_${distance}`);
      return { id, date, type, distance, duration, avgSpeed, activeZone: azMin, cal, avgHR, maxHR, minHR, steps, laps: 0, source: "watch" };
    });
    // drop noise: tiny auto-detected blips (very low speed standing periods, or nothing meaningful)
    activities = activities.filter((a: any) => (a.distance >= 0.5 || a.cal >= 50) && !(a.avgSpeed && a.avgSpeed < 0.5));
    // dedupe by id
    const seen: any = {}; activities = activities.filter((a: any) => (seen[a.id] ? false : (seen[a.id] = true)));

    const out: any = { ok: true, connected: true, activities };
    if (debug) out.debug = j.dataPoints;
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ connected: true, error: e.message });
  }
}
