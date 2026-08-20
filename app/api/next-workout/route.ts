import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { type, planned, actual, history } = await req.json();
  const out = await askLLM(
    "You are a strength & hypertrophy coach. You get today's " + (type || "") + " workout as PLANNED vs ACTUAL (each exercise with target sets/reps/weight and what was actually performed set-by-set), plus recent HISTORY of the same split. " +
    "Analyse: planned vs actual, total volume, difficulty, MISSED sets/reps, and weight changes/progression vs history. Then design the NEXT " + (type || "") + " workout (same split) applying progressive overload: increase weight or reps where targets were met/beaten, hold or slightly deload where sets/reps were missed. Use 6-9 exercises, keep good ones, and give a concrete target weight for each. " +
    "Return ONLY JSON: {\"analysis\": string (short, plain text, a few lines), \"next\": [{\"name\": string, \"sets\": number, \"reps\": number, \"weight\": number}], \"note\": string}. Reply with ONLY the JSON.",
    JSON.stringify({ type, planned, actual, history }),
    1400
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.next)) return Response.json(j); } catch (e) {} }
  return Response.json({ error: "Couldn't analyse — try again." });
}
