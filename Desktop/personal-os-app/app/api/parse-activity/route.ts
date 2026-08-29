import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";
export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text, kind, fields } = await req.json();
  if (!text) return Response.json({});
  const num = (re: RegExp) => { const m = String(text).match(re); return m ? parseFloat(m[1]) : undefined; };
  const fb: any = {};
  const dist = num(/([\d.]+)\s*(km|kilometer)/i); if (dist!==undefined) fb.distance = dist;
  const dur = num(/([\d.]+)\s*(min|minute)/i); if (dur!==undefined) fb.duration = dur;
  const steps = num(/([\d,]+)\s*steps/i); if (steps!==undefined) fb.steps = steps;
  const cal = num(/([\d.]+)\s*(kcal|cal|calorie)/i); if (cal!==undefined) fb.cal = cal;
  const out = await askLLM(`Extract a JSON object with ONLY these keys: ${JSON.stringify(fields||[])}. Numbers for numeric fields (distance km, duration minutes, steps, cal kcal, activeMin, avgHR, maxHR, avgSpeed), strings for activity/notes/pace, date as YYYY-MM-DD only if mentioned. Omit unknown keys. Reply with ONLY the JSON.`, `${kind||"activity"} note: "${text}"`, 300);
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { return Response.json({ ...fb, ...JSON.parse(m[0]) }); } catch(e){} }
  return Response.json(fb);
}
