import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { topic, count } = await req.json();
  const n = Math.min(30, Math.max(6, +count || 15));
  const out = await askLLM(
    `Generate ${n} natural English sentences for an INTERMEDIATE learner to shadow (listen and repeat aloud) to build fluency. Vary length from short to medium, use useful everyday and topic vocabulary, natural phrasing and rhythm. Related to the theme when possible. Return ONLY JSON: {"sentences":[string, ...]} with exactly ${n} sentences.`,
    `Theme: ${topic || "everyday fluency"}`,
    1500
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.sentences) && j.sentences.length) return Response.json({ sentences: j.sentences }); } catch (e) {} }
  return Response.json({ error: "Couldn't generate sentences — try again." });
}
