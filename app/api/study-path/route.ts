import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { course, goal } = await req.json();
  const out = await askLLM(
    "You are a study coach. Given a subject/course and an optional goal, propose a focused learning path for ONE day plus what comes next. Return ONLY a JSON object: {\"today\":[string,string,string], \"next\":[string,string]}. 'today' = 2-4 concrete tasks to do today; 'next' = 1-3 topics to tackle after. Keep each item short and actionable. Reply with ONLY the JSON.",
    `Course: ${course || "general"}${goal ? `. Goal: ${goal}` : ""}`,
    500
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ today: [], next: [], error: "Couldn't build a path." });
}
