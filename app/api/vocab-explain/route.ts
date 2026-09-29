import { guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { askLLM } from "@/lib/llm";

// Explains a word/phrase for the learner's vocabulary deck.
export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "vocab-explain");
  if (isGuardResponse(guard)) return guard;
  const { word } = await req.json();
  const w = String(word || "").trim().slice(0, 80);
  if (!w) return Response.json({ error: "No word given." }, { status: 400 });
  const out = await askLLM(
    "You help an intermediate English learner (Indian English speaker) build vocabulary. For the given word or phrase return ONLY JSON: " +
    "{\"word\":string (the word/phrase in its base form, corrected if misspelled),\"meaning\":string (a clear, simple definition, max 15 words),\"example\":string (one natural example sentence, max 20 words),\"tip\":string (pronunciation stress or a common mistake, max 12 words; empty if none)}.",
    `Word or phrase: ${w}`,
    300, { json: true }
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (j.meaning) return Response.json({ word: j.word || w, meaning: j.meaning, example: j.example || "", tip: j.tip || "" }); } catch (e) {} }
  return Response.json({ error: "Couldn't explain that word — you can fill it in yourself." });
}
