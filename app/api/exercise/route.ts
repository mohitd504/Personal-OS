// Estimates calories burned for an activity using the Anthropic (Claude) API,
// based on body weight, duration, distance/steps. Falls back to a MET formula.
// Requires ANTHROPIC_API_KEY (shared with the nutrition route).

const MET: Record<string, number> = {
  walking:3.5, walk:3.5, running:9.8, run:9.8, cycling:7.5, cycle:7.5, swimming:8, hiit:8,
  rowing:7, elliptical:5, stairmaster:9, strength:5, push:5, pull:5, legs:5, other:6,
};
function metFor(a:string){ const k=(a||"other").toLowerCase(); const hit=Object.keys(MET).find(m=>k.includes(m)); return MET[hit||"other"]; }

export async function POST(req: Request) {
  const b = await req.json();
  const weightKg = +b.weightKg || 75;
  let duration = +b.duration || 0;
  // if no duration but steps given, estimate ~100 steps/min
  if (!duration && b.steps) duration = Math.round((+b.steps) / 100);
  const activity = b.activity || b.kind || "other";

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
          max_tokens: 120,
          messages: [{ role: "user", content: `Estimate calories burned. Reply with ONLY compact JSON {"cal":0} (integer kcal). Person weight: ${weightKg} kg. Activity: ${activity}. Duration: ${duration} min. Distance: ${b.distance||0} km. Steps: ${b.steps||0}. Strength volume: ${b.volume||0} kg.` }],
        }),
      });
      const d = await r.json();
      const text = d?.content?.[0]?.text || "";
      const m = text.match(/\{[\s\S]*?\}/);
      if (m) { const o = JSON.parse(m[0]); if (o.cal!=null) return Response.json({ source:"ai", cal:+o.cal||0, duration }); }
    } catch (e) { /* fall through */ }
  }
  const cal = Math.round(metFor(activity) * weightKg * (duration/60));
  return Response.json({ source:"met", cal, duration });
}
