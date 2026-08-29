import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text, weightKg } = await req.json();
  if (!text) return Response.json({});
  const out = await askLLM(
    `You are a fitness metrics estimator. Given a workout/walk/run description, return ONLY a JSON object with these numeric keys (estimate realistic values for a ~${weightKg || 90}kg adult when not stated): type (short string like Run/Walk/Cycle/Gym/Hike), distance (km), duration (minutes), avgSpeed (km/h), activeZone (active zone minutes), cal (kcal burned), avgHR (bpm), maxHR (bpm), minHR (bpm), laps (count). Omit a key only if truly not inferable. Reply with ONLY the JSON, no prose.`,
    `Activity: "${text}"`,
    400
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({});
}
