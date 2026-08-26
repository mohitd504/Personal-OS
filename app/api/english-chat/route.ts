import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { messages, topic } = await req.json();
  const transcript = (Array.isArray(messages) ? messages : []).map((m: any) => `${m.role === "user" ? "Learner" : "Interviewer"}: ${m.content}`).join("\n");
  const out = await askLLM(
    "You are a real, friendly human chatting with a friend about the given theme — NOT a stiff interviewer. Talk naturally and warmly, like a genuine discussion: share your OWN opinions and quick reactions, add a short relatable comment or tiny anecdote, agree or gently disagree, use casual natural English, and keep the conversation flowing. Vary how you respond so it never feels repetitive or robotic. Usually end with a natural follow-up question or a point that invites them to say more — but sometimes just react and let it flow. Keep replies fairly short and human (2-4 sentences). " +
    "The learner's message is a speech-to-text transcript, so also flag words that look mis-said/unclear. Return: " +
    "'corrected' = their sentence rewritten in correct, natural English (empty \"\" if already fine); " +
    "'issues' = array of short notes, each ONE problem + fix — grammar/tense, wrong word, or likely MISPRONOUNCED words (prefix with 'Pronounce: '). Empty array if none. Max 5. Keep ALL corrections here, do NOT correct inside 'reply' (so the chat stays natural). " +
    "'reply' = your natural, human conversational response (stay in character for the scenario). " +
    "If there is no conversation yet, set corrected=\"\", issues=[] and open with a warm, natural question on the theme. Return ONLY JSON: {\"corrected\":string,\"issues\":[string],\"reply\":string}.",
    `Theme: ${topic || "a relaxed friendly chat about everyday life"}\n\nConversation so far:\n${transcript || "(none yet — start the chat naturally)"}`,
    600
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (j.reply) return Response.json({ corrected: j.corrected || "", issues: Array.isArray(j.issues) ? j.issues : [], reply: j.reply }); } catch (e) {} }
  return Response.json({ corrected: "", issues: [], reply: (out || "Let's keep going — tell me more.").replace(/^(Interviewer|Coach):\s*/i, "") });
}
