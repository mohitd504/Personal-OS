import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function b64url(s: string) {
  return Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { to, subject, body, threadId } = await req.json();
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ].join("\r\n");

  try {
    const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: { raw: b64url(mime), threadId } }),
    });
    const data = await r.json();
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 });
    return Response.json({ ok: true, id: data.id });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
