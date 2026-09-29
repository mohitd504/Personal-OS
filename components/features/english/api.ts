// Tiny fetch wrapper for the English AI routes: always resolves, never throws,
// and turns HTTP / rate-limit failures into a readable message.
export async function post<T = any>(url: string, body: unknown): Promise<{ data: T | null; error: string | null }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => null);
    if (r.status === 429) return { data: null, error: data?.error || "AI limit reached — try again later." };
    if (!r.ok) return { data: null, error: data?.error || `Request failed (${r.status}).` };
    if (data?.error) return { data: null, error: data.error === "no-key" ? "AI isn't configured (no API key)." : String(data.error) };
    return { data, error: null };
  } catch {
    return { data: null, error: "Network error — check your connection." };
  }
}
