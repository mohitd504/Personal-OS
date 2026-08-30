import { askLLM } from "@/lib/llm";
import { aiHeaders, guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { nutritionEstimateSchema, nutritionRequestSchema } from "@/lib/domain";
const TABLE: Record<string,{cal:number;protein:number;carbs:number;fat:number;fiber:number}> = {
  chai:{cal:60,protein:2,carbs:8,fat:2,fiber:0}, tea:{cal:60,protein:2,carbs:8,fat:2,fiber:0},
  roti:{cal:80,protein:3,carbs:15,fat:1,fiber:2}, chapati:{cal:80,protein:3,carbs:15,fat:1,fiber:2},
  rice:{cal:200,protein:4,carbs:44,fat:0,fiber:1}, dal:{cal:150,protein:9,carbs:20,fat:4,fiber:5},
  egg:{cal:78,protein:6,carbs:1,fat:5,fiber:0}, paneer:{cal:265,protein:18,carbs:6,fat:20,fiber:0},
  chicken:{cal:300,protein:35,carbs:0,fat:15,fiber:0}, milk:{cal:120,protein:8,carbs:12,fat:5,fiber:0},
  banana:{cal:105,protein:1,carbs:27,fat:0,fiber:3}, whey:{cal:130,protein:25,carbs:4,fat:2,fiber:0},
  oats:{cal:150,protein:5,carbs:27,fat:3,fiber:4}, bread:{cal:70,protein:3,carbs:13,fat:1,fiber:1},
};
function parse(t:string){ const m=t.trim().match(/^(\d+(?:\.\d+)?)\s*(?:x|\*)?\s*(.*)$/i); return { q:m&&m[1]?parseFloat(m[1]):1, name:(m&&m[2]?m[2]:t).trim().toLowerCase() }; }
function tableLookup(t:string){ const {q,name}=parse(t); const k=Object.keys(TABLE).find(x=>name.includes(x)); if(!k)return null; const b=TABLE[k]; return { cal:Math.round(b.cal*q), protein:Math.round(b.protein*q), carbs:Math.round(b.carbs*q), fat:Math.round(b.fat*q), fiber:Math.round(b.fiber*q) }; }
export async function POST(req: Request) {
  const guard = await guardAiRequest(req, "nutrition");
  if (isGuardResponse(guard)) return guard;
  const parsed = nutritionRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid food description (maximum 300 characters)." }, { status: 400 });
  const { food } = parsed.data;
  const out = await askLLM('You are a nutrition estimator. Reply with ONLY compact JSON {"cal":0,"protein":0,"carbs":0,"fat":0,"fiber":0} (grams, integers).', `Entry: "${food}"`, 200);
  const m = out.match(/\{[\s\S]*?\}/);
  if (m) { try { const o = nutritionEstimateSchema.safeParse(JSON.parse(m[0])); if (o.success) return Response.json({ source:"ai", estimated:true, assumption:"Typical serving sizes were assumed; edit before saving if your portion differs.", ...o.data }, { headers: aiHeaders(guard) }); } catch(e){} }
  const t = tableLookup(food); if (t) return Response.json({ source:"table", estimated:true, assumption:"Calculated from the built-in standard-serving reference.", ...t }, { headers: aiHeaders(guard) });
  return Response.json({ source:"none", estimated:true, assumption:"No reliable estimate was available; enter values manually.", cal:0, protein:0, carbs:0, fat:0, fiber:0 }, { headers: aiHeaders(guard) });
}
