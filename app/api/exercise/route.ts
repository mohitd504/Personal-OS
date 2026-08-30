import { askLLM } from "@/lib/llm";
import { aiHeaders, guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { exerciseEstimateSchema, exerciseRequestSchema } from "@/lib/domain";
const MET: Record<string, number> = { walking:3.5, walk:3.5, running:9.8, run:9.8, cycling:7.5, cycle:7.5, swimming:8, hiit:8, rowing:7, elliptical:5, stairmaster:9, strength:5, push:5, pull:5, legs:5, other:6 };
function metFor(a:string){ const k=(a||"other").toLowerCase(); const hit=Object.keys(MET).find(m=>k.includes(m)); return MET[hit||"other"]; }
export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "exercise");
  if (isGuardResponse(guard)) return guard;
  const parsed = exerciseRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid exercise details." }, { status: 400 });
  const b = parsed.data;
  const weightKg = b.weightKg;
  let duration = b.duration;
  if (!duration && b.steps) duration = Math.round((+b.steps) / 100);
  const activity = b.activity || b.kind || "other";
  const out = await askLLM('Estimate calories burned. Reply with ONLY compact JSON {"cal":0} (integer kcal).', `Person weight: ${weightKg} kg. Activity: ${activity}. Duration: ${duration} min. Distance: ${b.distance||0} km. Steps: ${b.steps||0}. Strength volume: ${b.volume||0} kg.`, 120);
  const m = out.match(/\{[\s\S]*?\}/);
  if (m) { try { const o = exerciseEstimateSchema.safeParse(JSON.parse(m[0])); if (o.success) return Response.json({ source:"ai", estimated:true, assumption:"Estimated from activity, duration, and body weight; actual burn varies.", cal:o.data.cal, duration }, { headers: aiHeaders(guard) }); } catch(e){} }
  return Response.json({ source:"met", estimated:true, assumption:"Calculated with a standard MET value; actual burn varies by intensity.", cal: Math.round(metFor(activity)*weightKg*(duration/60)), duration }, { headers: aiHeaders(guard) });
}
