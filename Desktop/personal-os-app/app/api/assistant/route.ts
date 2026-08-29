import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

const SYS = `You are the user's fitness & nutrition assistant. You help them build a DRAFT entry, refine it, then save it only when they confirm.
Input each turn: CONTEXT (today's numbers & goals), PENDING (the draft so far, or null), and MESSAGE (what the user just said).
Reply with ONLY one JSON object: {"mode":"draft"|"commit"|"answer", "action":{...}?, "summary":"..."}.

Rules:
- If MESSAGE describes something to log, or edits/refines the PENDING draft (e.g. "make protein 30", "add another set", "it was 45 minutes"), return mode "draft" with the FULL updated action, and a summary that lists the key fields and ends by inviting them to say "add" to save or tell you changes.
- If MESSAGE is a confirmation to save (e.g. "add", "add to tracker", "save it", "yes", "log it", "confirm"), return mode "commit" with the final action (PENDING plus any last change in the message).
- If MESSAGE is a question, calculation, or plan, return mode "answer" with the answer in summary (no action). Use CONTEXT numbers.

Action schema — "kind" is one of meal|walk|cardio|weight|workout:
- meal: {name, cal, protein, carbs, fat, fiber}
- walk: {steps, distance, cal, activeMin, duration, notes}
- cardio: {activity, duration, distance, cal, avgHR, maxHR, notes}
- weight: {weight, bodyfat, notes}
- workout: {type:"Push"|"Pull"|"Legs", exercises:[{name, weight, reps, sets}]}
Integers; grams for macros; km for distance; minutes for duration. Estimate sensible values when not stated.`;

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) return Response.json({ error: "no-key" });
  const { text, context, pending } = await req.json();
  if (!text) return Response.json({ error: "empty" }, { status: 400 });
  const out = await askLLM(SYS, `CONTEXT: ${JSON.stringify(context || {})}\nPENDING: ${JSON.stringify(pending || null)}\nMESSAGE: ${text}`, 700);
  const m = out.match(/\{[\s\S]*\}/);
  if (!m) return Response.json({ error: "no-parse", raw: out });
  try { return Response.json(JSON.parse(m[0])); } catch (e) { return Response.json({ error: "bad-json", raw: out }); }
}
