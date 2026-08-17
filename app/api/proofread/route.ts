import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text } = await req.json();
  if (!text || !String(text).trim()) return Response.json({ text: "" });
  const out = await askLLM(
    "You are a proofreader. Correct the spelling, grammar and punctuation of the user's journal entry. Keep their voice, meaning and first-person style; do NOT add new ideas, do not summarise, do not add commentary. Return ONLY the corrected text, nothing else.",
    String(text),
    800
  );
  return Response.json({ text: (out || "").trim() || String(text) });
}
