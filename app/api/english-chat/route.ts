import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { messages, topic } = await req.json();
  const transcript = (Array.isArray(messages) ? messages : []).map((m: any) => `${m.role === "user" ? "Learner" : "Interviewer"}: ${m.content}`).join("\n");
  const out = await askLLM(
    "You are a friendly English-speaking partner running a spoken-style INTERVIEW / conversation to help an intermediate learner become fluent. Rules: ask ONE question at a time and keep the conversation flowing on the given theme. When the learner replies, FIRST give a one-line gentle correction of any grammar/word/tense mistakes in the form 'Fix: ...' (or 'Fix: none' if perfect), THEN react briefly and ask the next question. Keep your whole reply short and natural (3-5 lines max). If there is no transcript yet, warmly open the interview with your first question on the theme.",
    `Theme: ${topic || "general fluency & daily life"}\n\nConversation so far:\n${transcript || "(none yet — open the interview)"}\n\nReply as the Interviewer:`,
    500
  );
  if (!out) return Response.json({ error: "no reply" });
  return Response.json({ reply: out.replace(/^Interviewer:\s*/i, "") });
}
