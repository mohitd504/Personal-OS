import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { course, days, hoursPerDay, videoUrl, resources } = await req.json();
  if (!course) return Response.json({ days: [] });
  const out = await askLLM(
    `You are a course study planner. Split a course into a day-by-day plan of exactly ${days || 15} days at ${hoursPerDay || 1.5} hours per day. ` +
    "For EACH day return: title (that day's topic), video (which part of the course video to watch that day, e.g. 'LangChain basics — approx first 1.5h' — approximate segments are fine), resource (the single most relevant link from the provided resources for that day), and tasks (2-4 concrete tasks with time splits that add up to the daily hours). Early days = watch + follow along; later days = build/practice/mini-projects; last day = review + a capstone. " +
    "Return ONLY JSON: {\"days\":[{\"title\":string,\"video\":string,\"resource\":string,\"tasks\":[{\"time\":string,\"task\":string}]}]} with exactly the requested number of days. Reply with ONLY the JSON.",
    `Course: "${course}". Course video: ${videoUrl || "n/a"}. Available resource links (map each day to the most relevant one):\n${resources || "none"}`,
    2500
  );
  const m = out.match(/\{[\s\S]*\}/);
  if (m) { try { const j = JSON.parse(m[0]); if (Array.isArray(j.days)) return Response.json(j); } catch (e) {} }
  return Response.json({ days: [], error: "Couldn't build the course plan — try again." });
}
