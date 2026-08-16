import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validGhealthToken } from "@/lib/ghealth";

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const civilDate = (o: any) => o && o.year ? `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day).padStart(2, "0")}` : "";

async function rangeRoll(at: string, dataType: string, key: string, start: Date, end: Date) {
  const body = {
    range: {
      start: { date: { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() }, time: { hours: 0, minutes: 0, seconds: 0 } },
      end: { date: { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() }, time: { hours: 23, minutes: 59, seconds: 59 } },
    },
    windowSizeDays: 1,
    dataSourceFamily: "users/me/dataSourceFamilies/google-wearables",
  };
  try {
    const r = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`, {
      method: "POST", headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body),
    });
    const j = await r.json();
    if (j.error) return { err: j.error.message, code: j.error.code, points: [] as any[] };
    const points = (j.rollupDataPoints || []).map((dp: any) => ({ date: civilDate(dp.civilStartTime), obj: dp[key] }));
    return { points };
  } catch (e: any) { return { err: e.message, points: [] as any[] }; }
}

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  if (!email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const at = await validGhealthToken(email);
  if (!at) return Response.json({ connected: false });

  const url = new URL(req.url);
  const days = Math.min(90, +(url.searchParams.get("days") || 15));
  const end = new Date();
  const start = new Date(); start.setDate(start.getDate() - (days - 1));
  const calStart = new Date(); calStart.setDate(calStart.getDate() - 13); // total-calories/AZM capped at 14 days

  const [steps, dist, cal, azm] = await Promise.all([
    rangeRoll(at, "steps", "steps", start, end),
    rangeRoll(at, "distance", "distance", start, end),
    rangeRoll(at, "total-calories", "totalCalories", calStart, end),
    rangeRoll(at, "active-zone-minutes", "activeZoneMinutes", calStart, end),
  ]);
  if (steps.err) return Response.json({ connected: true, error: steps.err, code: steps.code });

  const map: Record<string, any> = {};
  const put = (arr: any[], field: string, conv: (o: any) => number) => arr.forEach(p => { if (!p.date) return; map[p.date] = map[p.date] || { date: p.date }; map[p.date][field] = conv(p.obj); });
  put(steps.points, "steps", o => Math.round(parseFloat(o?.countSum || "0") || 0));
  put(dist.points, "distance", o => { let km = (parseFloat(o?.millimetersSum || "0") || 0) / 1_000_000; while (km > 100) km /= 1000; return Math.round(km * 100) / 100; });
  put(cal.points, "cal", o => Math.round(o?.kcalSum || 0));
  put(azm.points, "activeMin", o => { for (const k of Object.keys(o || {})) { const n = parseFloat(o[k]); if (!isNaN(n)) return Math.round(n); } return 0; });

  const rows = Object.values(map).sort((a: any, b: any) => a.date < b.date ? 1 : -1);
  const debug = url.searchParams.get("debug") === "1";
  const out: any = { ok: true, connected: true, days, rows };
  if (debug) out.debug = {
    requestedRange: `${dstr(start)} → ${dstr(end)}`,
    stepsDaysReturned: steps.points.length,
    stepsDates: steps.points.map((p: any) => p.date),
    stepsErr: steps.err || null, distErr: dist.err || null, calErr: cal.err || null,
  };
  return Response.json(out);
}
