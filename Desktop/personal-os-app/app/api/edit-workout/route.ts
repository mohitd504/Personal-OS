import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { type, exercises, prompt } = await req.json();
  if (!prompt) return Response.json({ exercises: exercises || [] });
  const out = await askLLM(
    "You are a workout editor. You get the current workout (split type + a list of exercises each with sets, reps and target weight) and a change request. Apply the request faithfully — swap, add, remove, reorder, or adjust sets/reps/weights as asked, keeping everything else the same. Keep it a sensible " + (type || "") + " session. Return ONLY JSON: {\"exercises\":[{\"name\":string,\"sets\":number,\"reps\":number,\"weight\":number}]}. Reply with ONLY the JSON.",
    `Current exercises: ${JSON.stringify(exercises || [])}\nChange request: "${prompt}"`,
    900
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.exercises)) return Response.json(j); } catch (e) {} }
  return Response.json({ exercises: exercises || [], error: "Couldn't apply that change — try rephrasing." });
}
