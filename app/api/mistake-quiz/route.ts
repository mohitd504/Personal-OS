import { guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { askLLM } from "@/lib/llm";

// Turns the learner's own recent mistakes into a short "fix the sentence" quiz.
export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "mistake-quiz");
  if (isGuardResponse(guard)) return guard;
  const { mistakes } = await req.json();
  const list = (Array.isArray(mistakes) ? mistakes : []).map((x: any) => String(x || "").slice(0, 200)).filter(Boolean).slice(0, 12);
  if (!list.length) return Response.json({ error: "No mistakes to practise yet." }, { status: 400 });
  const out = await askLLM(
    "You are an English coach. From the learner's recent mistakes, write a 6-question 'fix the sentence' quiz that targets the SAME error patterns in NEW everyday sentences (not copies). " +
    "Each wrong sentence must contain exactly one error of that pattern. Return ONLY JSON: {\"items\":[{\"wrong\":string,\"right\":string,\"rule\":string (max 12 words)}]}.",
    `Recent mistakes:\n- ${list.join("\n- ")}`,
    900, { json: true }
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); const items = (Array.isArray(j.items) ? j.items : []).filter((x: any) => x?.wrong && x?.right).slice(0, 8); if (items.length) return Response.json({ items }); } catch (e) {} }
  return Response.json({ error: "Couldn't build the quiz — try again." });
}
