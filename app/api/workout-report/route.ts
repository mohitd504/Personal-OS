import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { workout } = await req.json();
  if (!workout) return Response.json({ error: "no workout" }, { status: 400 });
  const out = await askLLM(
    "You are a strength & hypertrophy coach. You get a JSON of a COMPLETED workout (split type like Push/Pull/Legs, focus, and exercises with the weight×reps of each set). Do two things: " +
    "(1) Write a concise one-page session report: total volume, top sets, effort/PR highlights, and one or two coaching cues. Keep it plain text with short lines. " +
    "(2) Design the NEXT workout of the SAME split but ROTATING the focus (Push chest-focus -> next Push shoulder-focus; Pull back -> biceps; Legs quad -> glute/ham; then rotate back). Pick 6-9 exercises for that focus and suggest a target weight for each using sensible progressive overload from today's numbers (small increase if reps were strong, hold if not). " +
    "Return ONLY JSON: {\"report\": string, \"nextFocus\": string, \"next\": [{\"name\": string, \"sets\": number, \"reps\": number, \"weight\": number}], \"note\": string}. Reply with ONLY the JSON.",
    JSON.stringify(workout),
    1100
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ error: "Couldn't generate the report. Try again." });
}
