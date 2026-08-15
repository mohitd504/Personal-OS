import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fitbitToken } from "@/lib/fitbit";
export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const email = (s as any)?.user?.email;
  if (!email) return Response.json({ connected: false, error: "unauthorized" });
  const at = await fitbitToken(email);
  if (!at) return Response.json({ connected: false });
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const hdr = { Authorization: `Bearer ${at}` };
  try {
    const ar = await fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, { headers: hdr });
    const act = await ar.json();
    const sum = act.summary || {};
    const totalDist = (sum.distances || []).find((d: any) => d.activity === "total");
    let restingHR = "";
    try { const hr = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, { headers: hdr });
      const h = await hr.json(); restingHR = h?.["activities-heart"]?.[0]?.value?.restingHeartRate || ""; } catch (e) {}
    return Response.json({ connected: true, date,
      steps: sum.steps || 0,
      distance: totalDist ? Math.round(totalDist.distance * 10) / 10 : 0,
      activeMin: (sum.veryActiveMinutes || 0) + (sum.fairlyActiveMinutes || 0),
      cal: sum.caloriesOut || 0,
      restingHR });
  } catch (e: any) { return Response.json({ connected: true, error: e.message }); }
}
