import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { type, prompt } = await req.json();
  if (!prompt) return Response.json({ groups: [] });
  const out = await askLLM(
    "You are a workout builder. The user gives a split type and a requested muscle breakdown (e.g. '4 shoulder, 2 chest, 2 triceps'). For EACH muscle they mentioned, return how many exercises they want to pick and 5-6 good exercise OPTIONS to choose from (real gym exercise names). Return ONLY JSON: {\"groups\":[{\"muscle\":string,\"pick\":number,\"options\":[string]}]}. Reply with ONLY the JSON.",
    `Split type: ${type || "Push"}. Requested breakdown: "${prompt}"`,
    800
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.groups)) return Response.json(j); } catch (e) {} }
  return Response.json({ groups: [], error: "Couldn't read that — try e.g. '4 shoulder, 2 chest, 2 triceps'." });
}
