import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

const SYS = `You are the user's fitness & nutrition assistant inside their tracker app.
You receive the user's MESSAGE and a CONTEXT object with today's numbers and goals.
Reply with ONLY a single JSON object (no prose, no markdown). Choose ONE of two response types:

1) LOG — the user is recording something they ate or did. Output an action:
   {"kind":"meal|walk|cardio|weight|workout", ...fields, "summary":"short confirmation incl. the key numbers"}
   Fields: meal{name,cal,protein,carbs,fat,fiber}; walk{steps,distance,cal,activeMin,duration,notes};
   cardio{activity,duration,distance,cal,avgHR,maxHR,notes}; weight{weight,bodyfat,notes};
   workout{type:"Push"|"Pull"|"Legs", exercises:[{name,weight,reps,sets}]}.
   Integers; grams for macros; km for distance; minutes for duration. Estimate sensible values when not given.

2) ANSWER — the user is asking a question, calculation, or plan. Use CONTEXT to compute and output:
   {"kind":"reply","summary":"<concise, helpful answer that includes the actual numbers>"}

Examples: "how many calories left?" -> reply using goals.calorie minus eaten.cal.
"how much protein to hit goal?" -> reply using goals.protein minus eaten.protein.
Reply with ONLY the JSON.`;

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) return Response.json({ error: "no-key" });
  const { text, context } = await req.json();
  if (!text) return Response.json({ error: "empty" }, { status: 400 });
  const out = await askLLM(SYS, `CONTEXT: ${JSON.stringify(context || {})}\n\nMESSAGE: ${text}`, 600);
  const m = out.match(/\{[\s\S]*\}/);
  if (!m) return Response.json({ error: "no-parse", raw: out });
  try { return Response.json(JSON.parse(m[0])); } catch (e) { return Response.json({ error: "bad-json", raw: out }); }
}
