import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

const SYS = `You convert a person's short fitness/nutrition note into ONE JSON action. Reply with ONLY the JSON, no prose.
Schema: {"kind":"meal|walk|cardio|weight|workout", ...fields, "summary":"one short human confirmation sentence"}.
Fields by kind (numbers as integers, grams for macros, km for distance, minutes for duration):
- meal: name, cal, protein, carbs, fat, fiber
- walk: steps, distance, cal, activeMin, duration, notes
- cardio: activity, duration, distance, cal, avgHR, maxHR, notes
- weight: weight, bodyfat, notes
- workout: type ("Push"|"Pull"|"Legs"), exercises: [{name, weight, reps, sets}]
Estimate reasonable values when the person doesn't give exact numbers. Omit optional fields you can't infer. Pick the single best kind.`;

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text } = await req.json();
  if (!text) return Response.json({ error: "empty" }, { status: 400 });
  const out = await askLLM(SYS, text, 500);
  const m = out.match(/\{[\s\S]*\}/);
  if (!m) return Response.json({ error: "no-parse", raw: out });
  try { return Response.json(JSON.parse(m[0])); } catch (e) { return Response.json({ error: "bad-json", raw: out }); }
}
