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
      const startTime = findStr(dp, /civilStartTime|startTime|start_time/i) || "";
      const date = (startTime || "").slice(0, 10) || dstr(new Date());
      const distMm = findNum(dp, /millimeter/i) || 0;
      const distance = distMm ? Math.round(distMm / 1_000_000 * 100) / 100 : (findNum(dp, /distance/i) || 0);
      let durSec = findNum(dp, /activeDuration|movingDuration|duration.*seconds|elapsed/i) || 0;
      const durStr = findStr(dp, /duration/i); if (!durSec && durStr) durSec = parseFloat(durStr) || 0;
      const duration = durSec > 300 ? Math.round(durSec / 60) : durSec;
      const cal = Math.round(findNum(dp, /kcal|calorie/i) || 0);
      const avgHR = Math.round(findNum(dp, /beatsPerMinuteAvg|averageHeartRate|avgHeartRate/i) || 0);
      const maxHR = Math.round(findNum(dp, /beatsPerMinuteMax|maxHeartRate/i) || 0);
      const minHR = Math.round(findNum(dp, /beatsPerMinuteMin|minHeartRate/i) || 0);
      const steps = Math.round(findNum(dp, /steps.*count|countSum|steps/i) || 0);
      const azMin = Math.round(findNum(dp, /activeZone|zoneMinutes/i) || 0);
      const type = (findStr(dp, /activityType|exerciseType|\btype\b|\bname\b/i) || "Activity").replace(/_/g, " ");
      const avgSpeed = distance && duration ? Math.round(distance / (duration / 60) * 10) / 10 : 0;
      // stable id from start time (falls back to a fingerprint so re-syncs don't duplicate)
      const id = "gh_" + (startTime ? startTime.replace(/[^0-9]/g, "").slice(0, 14) : `${date}_${type}_${duration}_${distance}`);
      return { id, date, type, distance, duration, avgSpeed, activeZone: azMin, cal, avgHR, maxHR, minHR, steps, laps: 0, source: "watch" };
    });
    // drop noise: tiny auto-detected blips with no meaningful metrics
    activities = activities.filter((a: any) => a.duration >= 5 || a.distance >= 0.3 || a.cal >= 20);
    // dedupe by id
    const seen: any = {}; activities = activities.filter((a: any) => (seen[a.id] ? false : (seen[a.id] = true)));

    const out: any = { ok: true, connected: true, activities };
    if (debug) out.debug = j.dataPoints;
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ connected: true, error: e.message });
  }
}
