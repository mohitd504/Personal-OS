import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { kind, days, prompt } = await req.json();
  if (!prompt || !Array.isArray(days)) return Response.json({ days: days || [] });
  const shape = kind === "study"
    ? "each day = {\"date\":string,\"subjects\":[{\"label\":string,\"brief\":string}]}"
    : "each day = {\"date\":string,\"sessions\":[{\"type\":string,\"time\":string,\"exercises\":[{\"name\":string,\"sets\":number,\"reps\":number,\"weight\":number}]}]}";
  const out = await askLLM(
    `You edit a ${kind === "study" ? "study" : "exercise"} plan spanning up to 10 days. Apply the user's change request (swap days, move, add, remove, modify sets/reps/weights, add rest days, etc.). ` +
    `Return ONLY JSON: {"days":[ ${shape} ]}. Return ALL the dates you were given, in the same order; use an empty array for a rest/empty day. IMPORTANT: keep existing exercise names / subject labels EXACTLY the same when you are not changing them (so saved links & details are preserved). Reply with ONLY the JSON.`,
    `Change request: "${prompt}"\nCurrent plan: ${JSON.stringify(days)}`,
    3000
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.days)) return Response.json(j); } catch (e) {} }
  return Response.json({ days, error: "Couldn't apply that — try rephrasing." });
}
