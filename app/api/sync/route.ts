import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: SB_KEY as string, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" });

async function email() {
  const s = await getServerSession(authOptions);
  return (s as any)?.user?.email as string | undefined;
}

export async function GET() {
  const e = await email();
  if (!e) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!SB_URL || !SB_KEY) return Response.json({ data: null, note: "sync not configured" });
  try {
    const r = await fetch(`${SB_URL}/rest/v1/user_data?email=eq.${encodeURIComponent(e)}&select=data`, { headers: H() });
    const rows = await r.json();
    return Response.json({ data: Array.isArray(rows) && rows[0] ? rows[0].data : null });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  const e = await email();
  if (!e) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!SB_URL || !SB_KEY) return Response.json({ ok: false, note: "sync not configured" });
  const { data } = await req.json();
  try {
    const r = await fetch(`${SB_URL}/rest/v1/user_data`, {
      method: "POST",
      headers: { ...H(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([{ email: e, data, updated_at: new Date().toISOString() }]),
    });
    if (!r.ok) return Response.json({ ok: false, error: await r.text() }, { status: 500 });
    return Response.json({ ok: true });
  } catch (err: any) { return Response.json({ ok: false, error: err.message }, { status: 500 }); }
}
