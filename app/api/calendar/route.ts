import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if ((session as any)?.error === "RefreshAccessTokenError")
    return Response.json({ error: "reauth", message: "Your Google sign-in expired — please sign in again." }, { status: 401 });
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "1", 10);
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + days * 86400000);

  try {
    const r = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    const events = (data.items || []).map((e: any) => ({
      summary: e.summary || "(untitled)",
      location: e.location || "",
      start: e.start?.dateTime || e.start?.date || "",
      allDay: !e.start?.dateTime,
    }));
    return Response.json({ events });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
