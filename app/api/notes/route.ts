import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askLLM } from "@/lib/llm";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!(s as any)?.user?.email) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { course, topic, brief, videos, nextTopic } = await req.json();
  if (!topic) return Response.json({ error: "no topic" }, { status: 400 });
  const out = await askLLM(
    "You are an expert instructor writing detailed, exam-and-interview-ready study notes (aim for roughly 5-6 pages, ~1600-2200 words). Use clear Markdown with ## section headings, bullet points and **bold** key terms. Structure the notes EXACTLY with these sections: " +
    "\n## 1. Introduction & Full Theory — explain the concept from scratch, why it exists, definitions, how it works step by step, key properties, complexities/trade-offs. " +
    "\n## 2. Scenario-Based Examples — 2-3 concrete real-world scenarios worked through, showing how the concept applies. " +
    "\n## 3. Most Commonly Asked Questions (with answers) — 5-8 frequently-asked interview/exam questions on this topic, each with a clear, correct answer. " +
    "\n## 4. How It Connects to What's Next — how this topic sets up the following lecture(s)/topics in the course. " +
    "Be accurate, practical and thorough. Output ONLY the Markdown notes.",
    `Course: ${course || ""}\nTopic: ${topic}\nSummary: ${brief || ""}\nLecture(s)/videos: ${videos || ""}\nNext topic: ${nextTopic || "the next lecture in the course"}`,
    3200
  );
  if (!out || out.length < 40) return Response.json({ error: "Couldn't generate notes — try again." });
  return Response.json({ notes: out });
}
