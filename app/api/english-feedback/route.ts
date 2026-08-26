import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { messages } = await req.json();
  const learnerLines = (Array.isArray(messages) ? messages : []).filter((m: any) => m.role === "user").map((m: any) => m.content);
  if (!learnerLines.length) return Response.json({ error: "Have a conversation first." });
  const transcript = (Array.isArray(messages) ? messages : []).map((m: any) => `${m.role === "user" ? "Learner" : "Coach"}: ${m.content}`).join("\n");
  const out = await askLLM(
    "You are an English-speaking coach giving a friendly end-of-session report on the LEARNER's spoken English (from a conversation transcript). Judge only the learner's lines. " +
    "Return Markdown with: ## Scores — Fluency /100, Grammar /100, Vocabulary /100, and an overall CEFR level (A2–C1). ## Great job — 2 things they did well. ## Fix these — 3-6 specific corrections as `you said` -> `better` with a short reason. ## Level-up vocabulary — 4-6 stronger word/phrase swaps they could have used. ## Next focus — one clear thing to practise next time. Be encouraging and concise. Output ONLY Markdown.",
    transcript,
    2000
  );
  if (!out) return Response.json({ error: "Couldn't build the report — try again." });
  return Response.json({ report: out });
}
