import { askLLM } from "@/lib/llm";
const MET: Record<string, number> = { walking:3.5, walk:3.5, running:9.8, run:9.8, cycling:7.5, cycle:7.5, swimming:8, hiit:8, rowing:7, elliptical:5, stairmaster:9, strength:5, push:5, pull:5, legs:5, other:6 };
function metFor(a:string){ const k=(a||"other").toLowerCase(); const hit=Object.keys(MET).find(m=>k.includes(m)); return MET[hit||"other"]; }
export async function POST(req: Request) {
  const b = await req.json();
  const weightKg = +b.weightKg || 75;
  let duration = +b.duration || 0;
  if (!duration && b.steps) duration = Math.round((+b.steps) / 100);
  const activity = b.activity || b.kind || "other";
  const out = await askLLM('Estimate calories burned. Reply with ONLY compact JSON {"cal":0} (integer kcal).', `Person weight: ${weightKg} kg. Activity: ${activity}. Duration: ${duration} min. Distance: ${b.distance||0} km. Steps: ${b.steps||0}. Strength volume: ${b.volume||0} kg.`, 120);
  const m = out.match(/\{[\s\S]*?\}/);
  if (m) { try { const o = JSON.parse(m[0]); if (o.cal!=null) return Response.json({ source:"ai", cal:+o.cal||0, duration }); } catch(e){} }
  return Response.json({ source:"met", cal: Math.round(metFor(activity)*weightKg*(duration/60)), duration });
}
