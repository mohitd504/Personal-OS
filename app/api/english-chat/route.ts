import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { messages, topic } = await req.json();
  const transcript = (Array.isArray(messages) ? messages : []).map((m: any) => `${m.role === "user" ? "Learner" : "Interviewer"}: ${m.content}`).join("\n");
  const out = await askLLM(
    "You are a warm, encouraging English speaking partner having a natural spoken conversation to help an intermediate learner become fluent on the given theme. For the learner's latest message return TWO things: " +
    "'fix' = a short, friendly correction of any grammar/tense/word/pronunciation-in-writing mistakes, phrased as 'Say: <the corrected sentence>' (empty string \"\" if it was already correct); " +
    "'reply' = react naturally and warmly to what they said (show genuine interest, add a small comment or your own bit), THEN ask ONE engaging follow-up question to keep the chat going. Keep 'reply' conversational and short (2-4 sentences). " +
    "If there is no conversation yet, set fix to \"\" and make 'reply' a warm opening question on the theme. Return ONLY JSON: {\"fix\":string,\"reply\":string}.",
    `Theme: ${topic || "general fluency & daily life"}\n\nConversation so far:\n${transcript || "(none yet — open the conversation)"}`,
    500
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (j.reply) return Response.json({ fix: j.fix || "", reply: j.reply }); } catch (e) {} }
  return Response.json({ fix: "", reply: (out || "Let's keep going — tell me more.").replace(/^Interviewer:\s*/i, "") });
}
