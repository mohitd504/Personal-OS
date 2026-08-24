import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text } = await req.json();
  if (!text || !String(text).trim()) return Response.json({ error: "Write something first." });
  const out = await askLLM(
    "You are an English writing coach for an intermediate learner. Correct the learner's essay and teach them. Return Markdown with these sections: " +
    "## Corrected version — the full corrected essay. " +
    "## Key fixes — a bullet list; for each change show `wrong` -> `right` and a short reason, focusing on TENSE errors, grammar, articles/prepositions, and BETTER WORD CHOICES (suggest stronger vocabulary). " +
    "## Better words — 4-6 upgrades: a plain word they used -> a more advanced/natural alternative. " +
    "## Score & tip — an approximate CEFR band (e.g. B2) and one specific improvement tip. " +
    "Keep the learner's original meaning. Output ONLY the Markdown.",
    String(text),
    2200
  );
  if (!out) return Response.json({ error: "Couldn't check the essay — try again." });
  return Response.json({ result: out });
}
