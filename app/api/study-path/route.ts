import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text, hours, course } = await req.json();
  if (!text && !course) return Response.json({ plan: [] });
  const out = await askLLM(
    "You are a study coach. The user says what they want to study today and how many hours they have. Break it into a realistic timed study schedule that fits the available time, with focused blocks and short breaks. Return ONLY a JSON object: {\"plan\":[{\"time\":\"e.g. 45 min\",\"task\":\"what to do\"}],\"next\":[\"topic to study next\"]}. Keep tasks concrete. Reply with ONLY the JSON.",
    `Studying: ${course ? course + " — " : ""}${text || ""}. Hours available: ${hours || "flexible"}.`,
    600
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ plan: [], next: [], error: "Couldn't build a plan." });
}
