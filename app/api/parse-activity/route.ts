import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Parses a free-text activity description into structured fields using Claude.
// Body: { text, kind, fields: string[] }  ->  { <field>: value }
export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { text, kind, fields } = await req.json();
  if (!text) return Response.json({});
  const key = process.env.ANTHROPIC_API_KEY;

  // lightweight regex fallback for the common numeric fields
  const num = (re: RegExp) => { const m = String(text).match(re); return m ? parseFloat(m[1]) : undefined; };
  const fallback: any = {};
  const dist = num(/([\d.]+)\s*(km|kilometer)/i); if (dist !== undefined) fallback.distance = dist;
  const dur = num(/([\d.]+)\s*(min|minute)/i); if (dur !== undefined) fallback.duration = dur;
  const steps = num(/([\d,]+)\s*steps/i); if (steps !== undefined) fallback.steps = steps;
  const cal = num(/([\d.]+)\s*(kcal|cal|calorie)/i); if (cal !== undefined) fallback.cal = cal;

  if (key) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role: "user", content:
            `Extract a JSON object with ONLY these keys from the user's ${kind || "activity"} description: ${JSON.stringify(fields || [])}. ` +
            `Rules: numbers for numeric fields (distance in km, duration in minutes, steps, cal in kcal, activeMin, avgHR, maxHR, avgSpeed), a string for 'activity'/'notes'/'pace', date as YYYY-MM-DD if a date is mentioned else omit. Omit keys you can't determine. Reply with ONLY the JSON.` +
            `\n\nText: "${text}"` }],
        }),
      });
      const d = await r.json();
      const t = d?.content?.[0]?.text || "";
      const m = t.match(/\{[\s\S]*\}/);
      if (m) { const o = JSON.parse(m[0]); return Response.json({ ...fallback, ...o }); }
    } catch (e) { /* fall through */ }
  }
  return Response.json(fallback);
}
