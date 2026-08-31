import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const H = (t: string) => ({ Authorization: `Bearer ${t}` });

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if ((session as any)?.error === "RefreshAccessTokenError")
    return Response.json({ error: "reauth", message: "Your Google sign-in expired — please sign in again." }, { status: 401 });
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "is:unread in:inbox";
  const max = url.searchParams.get("max") || "12";

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max}&q=${encodeURIComponent(q)}`,
      { headers: H(token) }
    );
    const list = await listRes.json();
    const ids = (list.messages || []).map((m: any) => m.id);
    const messages = await Promise.all(
      ids.map(async (id: string) => {
        const r = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: H(token) }
        );
        const m = await r.json();
        const headers: Record<string, string> = {};
        (m.payload?.headers || []).forEach((h: any) => (headers[h.name] = h.value));
        const attachments: { filename: string; mimeType: string }[] = [];
        const walk = (part: any) => { if (part?.filename) attachments.push({ filename: part.filename, mimeType: part.mimeType || "application/octet-stream" }); (part?.parts || []).forEach(walk); };
        walk(m.payload);
        return {
          id: m.id,
          threadId: m.threadId,
          from: headers["From"] || "",
          subject: headers["Subject"] || "(no subject)",
          date: headers["Date"] || "",
          snippet: m.snippet || "",
          labelIds: m.labelIds || [],
          attachments,
        };
      })
    );
    return Response.json({ estimate: list.resultSizeEstimate || messages.length, messages });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
