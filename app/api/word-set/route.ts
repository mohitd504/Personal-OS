import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { kind, topic, count } = await req.json();
  const n = Math.min(20, Math.max(6, +count || 10));
  const sys = kind === "spelling"
    ? `Return ${n} moderately tricky English words a learner should be able to spell (mix common but often-misspelled words with a few from the theme). Return ONLY JSON: {"items":[{"word":string,"hint":string}]} where hint is a SHORT meaning/usage clue (do NOT reveal the spelling).`
    : `Return ${n} useful English words or short phrases for pronunciation practice (include some commonly mispronounced ones and some from the theme). Return ONLY JSON: {"items":[{"word":string,"tip":string}]} where tip is a very short pronunciation hint (stress or tricky sound, e.g. "stress 2nd syllable", "silent b").`;
  const out = await askLLM(sys, `Theme: ${topic || "everyday English"}`, 1200);
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.items) && j.items.length) return Response.json({ items: j.items }); } catch (e) {} }
  return Response.json({ error: "Couldn't build the word set — try again." });
}
