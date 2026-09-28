import { guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "english-lesson");
  if (isGuardResponse(guard)) return guard;
  const { day, topic } = await req.json();
  const out = await askLLM(
    "You are an expert English tutor for an INTERMEDIATE learner who wants to become FLUENT (do NOT teach absolute basics). Create a focused ~15-minute lesson. Use Markdown with ## headings. Include: a short clear explanation of the topic; 8-10 high-value example sentences / natural phrases; common mistakes to avoid; useful vocabulary or collocations; and 3 quick practice prompts at the end. Keep it practical and fluency-oriented (~450-650 words). Output ONLY the Markdown lesson.",
    `Day ${day || 1} topic: ${topic || "English fluency practice"}`,
    2000
  );
  if (!out || out.length < 40) return Response.json({ error: "Couldn't build the lesson — try again." });
  return Response.json({ lesson: out });
}
