import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLMImage } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { image } = await req.json();
  if (!image) return Response.json({ error: "no image" }, { status: 400 });
  const out = await askLLMImage(
    "You are a nutrition estimator. Look at the food photo and estimate the meal's nutrition for the whole plate shown. Return ONLY a JSON object with keys: name (short description string), cal (kcal number), protein (g number), carbs (g number), fat (g number), fiber (g number). Estimate realistic values; if portion is unclear assume a normal single serving. Reply with ONLY the JSON, no prose.",
    "Estimate the calories and macros for this meal.",
    image,
    400
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json(JSON.parse(m[0])); } catch (e) {} }
  return Response.json({ error: "Couldn't read the photo. Try a clearer, well-lit shot." });
}
