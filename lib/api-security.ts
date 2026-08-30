import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Bucket = { minute: number[]; day: string; daily: number };
const buckets = new Map<string, Bucket>();

export type AiRequestContext = { email: string; remainingToday: number };

export async function guardAiRequest(req: Request, route: string): Promise<AiRequestContext | Response> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return Response.json({ error: "Authentication required" }, { status: 401 });

  const declaredSize = Number(req.headers.get("content-length") || 0);
  if (declaredSize > 1_000_000) return Response.json({ error: "Request is too large" }, { status: 413 });

  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const key = `${email}:${route}`;
  const bucket = buckets.get(key) || { minute: [], day, daily: 0 };
  bucket.minute = bucket.minute.filter((time) => now - time < 60_000);
  if (bucket.day !== day) { bucket.day = day; bucket.daily = 0; }

  const perMinute = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 12);
  const perDay = Number(process.env.AI_RATE_LIMIT_PER_DAY || 200);
  if (bucket.minute.length >= perMinute) {
    return Response.json({ error: "Too many AI requests. Please wait a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  }
  if (bucket.daily >= perDay) {
    return Response.json({ error: "Daily AI usage limit reached." }, { status: 429 });
  }
  bucket.minute.push(now);
  bucket.daily += 1;
  buckets.set(key, bucket);
  return { email, remainingToday: Math.max(0, perDay - bucket.daily) };
}

export function isGuardResponse(value: AiRequestContext | Response): value is Response {
  return value instanceof Response;
}

export function aiHeaders(ctx: AiRequestContext) {
  return { "X-AI-Requests-Remaining-Today": String(ctx.remainingToday) };
}
