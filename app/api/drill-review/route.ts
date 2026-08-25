import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { attempts } = await req.json();
  if (!Array.isArray(attempts) || !attempts.length) return Response.json({ error: "No attempts to review." });
  const out = await askLLM(
    "A learner did a listen-and-repeat (shadowing) drill. You get pairs of {target} (the correct sentence) and {said} (what the learner actually said, from speech-to-text). Compare each pair. For sentences where 'said' differs meaningfully from 'target' (missed words, wrong words, wrong tense, dropped articles, word order, likely pronunciation slips), explain briefly what went wrong and the correct way. Ignore trivial punctuation/casing. " +
    "Return Markdown: ## What to fix — a bullet per problem sentence: show `you said: …` -> `correct: …` and a 3-6 word reason. ## Overall measures — 3-5 concrete tips (e.g. articles, past-tense endings, specific sounds). ## Accuracy — an approximate % of sentences repeated well, and one encouraging line. Be concise. Output ONLY Markdown.",
    JSON.stringify(attempts),
    2200
  );
  if (!out) return Response.json({ error: "Couldn't review — try again." });
  return Response.json({ review: out });
}
