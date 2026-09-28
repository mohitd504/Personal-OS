import { guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "plan-nutrition");
  if (isGuardResponse(guard)) return guard;
  const { menu } = await req.json();
  if (!menu || !String(menu).trim()) return Response.json({ items: [], total: {} });
  const out = await askLLM(
    "You are a nutrition calculator. Given a day's food menu (one or more items, possibly with quantities), estimate nutrition for each item and the day's total. Return ONLY a JSON object: {\"items\":[{\"name\":string,\"qty\":string,\"cal\":number,\"protein\":number,\"carbs\":number,\"fat\":number,\"fiber\":number}],\"total\":{\"cal\":number,\"protein\":number,\"carbs\":number,\"fat\":number,\"fiber\":number}}. Numbers only, no units. Reply with ONLY the JSON.",
    String(menu),
    800, { json: true }
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ items: [], total: {}, error: "Couldn't parse the menu." });
}
