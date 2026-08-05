"use client";
import { useEffect } from "react";

// Cross-device sync: pulls the user's data on load and pushes (debounced) on every change.
// Works only when SUPABASE_* env vars are set on the server; otherwise it's a harmless no-op.
export default function SyncManager({ onSync }: { onSync: () => void }) {
  useEffect(() => {
    let timer: any = null; let disposed = false;
    const orig = localStorage.setItem.bind(localStorage);
    const snapshot = () => { const blob: any = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf("pos_") === 0) blob[k] = localStorage.getItem(k); } return blob; };
    const push = () => { fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: snapshot() }) }).catch(() => {}); };
    const schedule = () => { if (timer) clearTimeout(timer); timer = setTimeout(push, 1500); };
    (localStorage as any).setItem = (k: string, v: string) => { orig(k, v); if (typeof k === "string" && k.indexOf("pos_") === 0) schedule(); };

    fetch("/api/sync").then(r => r.json()).then(d => {
      if (disposed) return;
      if (d && d.data && typeof d.data === "object") { Object.keys(d.data).forEach(k => { try { orig(k, d.data[k]); } catch (e) {} }); }
      onSync();
    }).catch(() => {});

    const onUnload = () => push();
    window.addEventListener("beforeunload", onUnload);
    return () => { disposed = true; (localStorage as any).setItem = orig; window.removeEventListener("beforeunload", onUnload); if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
