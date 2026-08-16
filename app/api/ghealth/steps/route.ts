import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validGhealthToken } from "@/lib/ghealth";

/* first numeric field inside an object (for single-sum rollup values) */
function num(o: any): number {
  if (!o || typeof o !== "object") return 0;
  for (const k of Object.keys(o)) { const n = parseFloat(o[k]); if (!isNaN(n)) return n; }
  return 0;
}

async function roll(at: string, dataType: string, key: string, y: number, m: number, d: number): Promise<{ obj: any; raw: any; err?: string; code?: number }> {
  const body = {
    range: {
      start: { date: { year: y, month: m, day: d }, time: { hours: 0, minutes: 0, seconds: 0 } },
      end: { date: { year: y, month: m, day: d }, time: { hours: 23, minutes: 59, seconds: 59 } },
    },
    windowSizeDays: 1,
  };
  try {
    const r = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`, {
      method: "POST",
      headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (j.error) return { obj: null, raw: j.error, err: j.error.message || "api error", code: j.error.code };
    const dp = (j.rollupDataPoints || [])[0] || null;
    return { obj: dp ? dp[key] : null, raw: dp };
  } catch (e: any) {
    return { obj: null, raw: null, err: e.message };
  }
}

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  if (!email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const at = await validGhealthToken(email);
  if (!at) return Response.json({ connected: false });

  const url = new URL(req.url);
  const ds = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const debug = url.searchParams.get("debug") === "1";
  const [y, m, d] = ds.split("-").map(Number);

  const [steps, distance, totalCal, azm, floors, hr, rhr, sleep] = await Promise.all([
    roll(at, "steps", "steps", y, m, d),
    roll(at, "distance", "distance", y, m, d),
    roll(at, "total-calories", "totalCalories", y, m, d),
    roll(at, "active-zone-minutes", "activeZoneMinutes", y, m, d),
    roll(at, "floors", "floors", y, m, d),
    roll(at, "heart-rate", "heartRate", y, m, d),
    roll(at, "daily-resting-heart-rate", "restingHeartRatePersonalRange", y, m, d),
    roll(at, "sleep", "sleep", y, m, d),
  ]);

  // steps is the anchor: surface a scope/auth error clearly
  if (steps.err) return Response.json({ connected: true, error: steps.err, code: steps.code });

  const stepsN = Math.round(parseFloat(steps.obj?.countSum || "0") || 0);
  const distKm = Math.round(((parseFloat(distance.obj?.millimetersSum || "0") || 0) / 1_000_000) * 100) / 100;
  const kcal = Math.round(totalCal.obj?.kcalSum || 0);
  const activeMin = Math.round(num(azm.obj));
  const floorsN = Math.round(num(floors.obj));
  const hrAvg = Math.round(hr.obj?.beatsPerMinuteAvg || 0);
  const hrMax = Math.round(hr.obj?.beatsPerMinuteMax || 0);
  const hrMin = Math.round(hr.obj?.beatsPerMinuteMin || 0);
  const rMin = rhr.obj?.beatsPerMinuteMin || 0, rMax = rhr.obj?.beatsPerMinuteMax || 0;
  const restingHR = Math.round(rMin && rMax ? (rMin + rMax) / 2 : (rMin || rMax || hrMin || 0));
  // sleep rollup value is a duration; num() grabs the first numeric (seconds or minutes) — normalise to hours
  const sleepRaw = num(sleep.obj);
  const sleepH = sleepRaw > 1440 ? Math.round(sleepRaw / 3600 * 10) / 10 : sleepRaw > 24 ? Math.round(sleepRaw / 60 * 10) / 10 : Math.round(sleepRaw * 10) / 10;

  const out: any = {
    ok: true, connected: true, date: ds,
    steps: stepsN, distance: distKm, calories: kcal, activeMin, floors: floorsN,
    avgHR: hrAvg, maxHR: hrMax, minHR: hrMin, restingHR, sleepH,
  };
  if (debug) out.debug = { steps: steps.raw, distance: distance.raw, totalCal: totalCal.raw, azm: azm.raw, floors: floors.raw, hr: hr.raw, rhr: rhr.raw, sleep: sleep.raw };
  return Response.json(out);
}
