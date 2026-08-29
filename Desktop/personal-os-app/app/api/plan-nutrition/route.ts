import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { menu } = await req.json();
  if (!menu || !String(menu).trim()) return Response.json({ items: [], total: {} });
  const out = await askLLM(
    "You are a nutrition calculator. Given a day's food menu (one or more items, possibly with quantities), estimate nutrition for each item and the day's total. Return ONLY a JSON object: {\"items\":[{\"name\":string,\"qty\":string,\"cal\":number,\"protein\":number,\"carbs\":number,\"fat\":number,\"fiber\":number}],\"total\":{\"cal\":number,\"protein\":number,\"carbs\":number,\"fat\":number,\"fiber\":number}}. Numbers only, no units. Reply with ONLY the JSON.",
    String(menu),
    800
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ items: [], total: {}, error: "Couldn't parse the menu." });
}
