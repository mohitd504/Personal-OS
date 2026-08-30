import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const minuteBuckets = new Map<string, number[]>();

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const size = Number(req.headers.get("content-length") || 0);
  if (size > 5_000_000) return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  const now = Date.now(); const key = `${token.email}:${req.nextUrl.pathname}`;
  const recent = (minuteBuckets.get(key) || []).filter(time => now - time < 60_000);
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 12);
  if (recent.length >= limit) return NextResponse.json({ error: "Too many AI requests. Please wait a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  recent.push(now); minuteBuckets.set(key,recent);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/assistant", "/api/nutrition", "/api/exercise", "/api/parse-activity", "/api/plan-nutrition",
    "/api/next-workout", "/api/workout-report", "/api/workout-options", "/api/edit-workout", "/api/plan-edit",
    "/api/food-photo", "/api/study-path", "/api/course-plan", "/api/notes", "/api/code", "/api/proofread",
    "/api/english-lesson", "/api/english-chat", "/api/english-feedback", "/api/english-drill", "/api/drill-review",
    "/api/essay-check", "/api/word-set", "/api/study-quiz", "/api/study-assistant", "/api/gmail-assistant"
  ]
};
