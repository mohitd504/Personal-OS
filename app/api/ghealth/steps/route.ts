import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Reads today's step total from the Google Health API (next-gen Fitbit) using the
// user's Google access token (googlehealth.activity_and_fitness.readonly scope).
export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const at = (s as any)?.accessToken;
  if (!at) return Response.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const ds = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const [y, m, d] = ds.split("-").map(Number);
  const body = {
    range: {
      start: { date: { year: y, month: m, day: d }, time: { hours: 0, minutes: 0, seconds: 0 } },
      end: { date: { year: y, month: m, day: d }, time: { hours: 23, minutes: 59, seconds: 59 } },
    },
    windowSizeDays: 1,
  };
  try {
    const r = await fetch("https://health.googleapis.com/v4/users/me/dataTypes/steps/dataPoints:dailyRollUp", {
      method: "POST",
      headers: { Authorization: `Bearer ${at}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (j.error) return Response.json({ error: j.error.message || "api error", code: j.error.code });
    const dp = (j.rollupDataPoints || [])[0];
    const steps = dp ? parseInt(dp.steps?.countSum || "0", 10) : 0;
    return Response.json({ ok: true, steps, date: ds });
  } catch (e: any) { return Response.json({ error: e.message }); }
}
