import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validGhealthToken } from "@/lib/ghealth";

/* Pull the first numeric value out of a dailyRollUp datapoint, whatever the field is called. */
function num(dp: any): number {
  if (!dp || typeof dp !== "object") return 0;
  for (const k of Object.keys(dp)) {
    const v = dp[k];
    if (v && typeof v === "object") {
      for (const kk of Object.keys(v)) {
        const n = parseFloat(v[kk]);
        if (!isNaN(n)) return n;
      }
    }
  }
  return 0;
}

async function rollup(at: string, dataType: string, y: number, m: number, d: number): Promise<{ v: number; err?: string; code?: number }> {
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
    if (j.error) return { v: 0, err: j.error.message || "api error", code: j.error.code };
    const dp = (j.rollupDataPoints || [])[0];
    return { v: dp ? num(dp) : 0 };
  } catch (e: any) {
    return { v: 0, err: e.message };
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
  const [y, m, d] = ds.split("-").map(Number);

  // steps first — if this fails with a scope error, surface it so the card can guide the user
  const steps = await rollup(at, "steps", y, m, d);
  if (steps.err) return Response.json({ connected: true, error: steps.err, code: steps.code });

  const [distance, totalCal, azm, floors, rhr, sleep] = await Promise.all([
    rollup(at, "distance", y, m, d),
    rollup(at, "total-calories", y, m, d),
    rollup(at, "active-zone-minutes", y, m, d),
    rollup(at, "floors", y, m, d),
    rollup(at, "daily-resting-heart-rate", y, m, d),
    rollup(at, "sleep", y, m, d),
  ]);

  const distKm = distance.v > 100 ? Math.round(distance.v / 1000 * 10) / 10 : Math.round(distance.v * 10) / 10; // meters→km if large
  const sleepH = sleep.v > 60 ? Math.round(sleep.v / 60 * 10) / 10 : Math.round(sleep.v * 10) / 10; // minutes→hours if large

  return Response.json({
    ok: true,
    connected: true,
    date: ds,
    steps: Math.round(steps.v),
    distance: distKm,
    calories: Math.round(totalCal.v),
    activeMin: Math.round(azm.v),
    floors: Math.round(floors.v),
    restingHR: Math.round(rhr.v),
    sleepH,
    // note which optional metrics the granted scopes couldn't return
    missing: [distance, totalCal, azm, floors, rhr, sleep].some(x => x.err) ? "some metrics need extra scopes" : "",
  });
}
