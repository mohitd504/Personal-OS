import { guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "code");
  if (isGuardResponse(guard)) return guard;
  const { course, topic, brief, videos } = await req.json();
  if (!topic) return Response.json({ error: "no topic" }, { status: 400 });
  const out = await askLLM(
    "You are a coding instructor. Produce the COMPLETE, runnable example code a student would write to learn/practice this topic. It must be a single self-contained file with clear comments explaining each part. Choose the most appropriate language for the topic (Python for AI/ML/DSA, etc.). Return ONLY a JSON object: {\"filename\": string (e.g. \"dijkstra.py\"), \"lang\": string, \"code\": string}. No prose outside the JSON.",
    `Course: ${course || ""}\nTopic: ${topic}\nSummary: ${brief || ""}\nLecture(s): ${videos || ""}`,
    2600, { json: true }
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (j.code) return Response.json(j); } catch (e) {} }
  return Response.json({ error: "Couldn't generate code — try again." });
}
