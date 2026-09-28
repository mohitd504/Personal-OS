import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Per-minute limits are best-effort (in-memory, per server instance).
// The daily limit is per user across ALL AI routes and is stored in Supabase
// (table + function in supabase/ai_usage.sql) so it survives cold starts and
// is shared between instances. If Supabase isn't configured or the function
// is missing, it falls back to an in-memory counter.
const minuteBuckets = new Map<string, number[]>();
const memoryDaily = new Map<string, number>();

export type AiRequestContext = { email: string; remainingToday: number };
type GuardOptions = { maxBytes?: number };

async function incrementDailyUsage(email: string, day: string): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/rpc/increment_ai_usage`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_email: email, p_day: day }),
        signal: AbortSignal.timeout(3000),
      });
      if (r.ok) {
        const count = Number(await r.json());
        if (Number.isFinite(count)) return count;
      } else {
        console.error("[ai-usage] supabase rpc failed", r.status, await r.text().catch(() => ""));
      }
    } catch (err) {
      console.error("[ai-usage] supabase rpc error", err);
    }
  }
  const memKey = `${email}:${day}`;
  const count = (memoryDaily.get(memKey) || 0) + 1;
  memoryDaily.set(memKey, count);
  return count;
}

export async function guardAiRequest(req: Request, route: string, opts: GuardOptions = {}): Promise<AiRequestContext | Response> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return Response.json({ error: "Authentication required" }, { status: 401 });

  const declaredSize = Number(req.headers.get("content-length") || 0);
  if (declaredSize > (opts.maxBytes ?? 1_000_000)) return Response.json({ error: "Request is too large" }, { status: 413 });

  const now = Date.now();
  const minuteKey = `${email}:${route}`;
  const recent = (minuteBuckets.get(minuteKey) || []).filter((time) => now - time < 60_000);
  const perMinute = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 12);
  if (recent.length >= perMinute) {
    return Response.json({ error: "Too many AI requests. Please wait a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  }
  recent.push(now);
  minuteBuckets.set(minuteKey, recent);

  const perDay = Number(process.env.AI_RATE_LIMIT_PER_DAY || 200);
  const usedToday = await incrementDailyUsage(email, new Date(now).toISOString().slice(0, 10));
  if (usedToday > perDay) {
    return Response.json({ error: "Daily AI usage limit reached." }, { status: 429 });
  }
  return { email, remainingToday: Math.max(0, perDay - usedToday) };
}

export function isGuardResponse(value: AiRequestContext | Response): value is Response {
  return value instanceof Response;
}

export function aiHeaders(ctx: AiRequestContext) {
  return { "X-AI-Requests-Remaining-Today": String(ctx.remainingToday) };
}
