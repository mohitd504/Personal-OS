"use client";
import { useEffect } from "react";

// Cross-device sync:
//  - pulls the user's data on load, every 30s, and whenever the tab regains focus
//  - pushes (debounced 1.5s) on every change and on tab close
//  - guards against clobbering an edit you're in the middle of
// No-op if the SUPABASE_* env vars aren't configured on the server.
export default function SyncManager({ onSync }: { onSync: () => void }) {
  useEffect(() => {
    let disposed = false;
    let interval: any = null;
    let pushTimer: any = null;
    let lastLocalWrite = 0;
    let lastApplied = "";

    const orig = localStorage.setItem.bind(localStorage);
    const snapshot = () => {
      const b: any = {};
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf("pos_") === 0) b[k] = localStorage.getItem(k); }
      return b;
    };
    const push = () => { fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: snapshot() }) }).catch(() => {}); };
    const schedulePush = () => { if (pushTimer) clearTimeout(pushTimer); pushTimer = setTimeout(push, 1500); };

    (localStorage as any).setItem = (k: string, v: string) => {
      orig(k, v);
      if (typeof k === "string" && k.indexOf("pos_") === 0) { lastLocalWrite = Date.now(); schedulePush(); }
    };

    const pull = async (force?: boolean) => {
      try {
        const r = await fetch("/api/sync");
        const d = await r.json();
        if (disposed || !d || !d.data || typeof d.data !== "object") return;
        const str = JSON.stringify(d.data);
        if (str === lastApplied) return;                          // nothing new since last apply
        if (!force && Date.now() - lastLocalWrite < 4000) return; // don't overwrite an active edit
        Object.keys(d.data).forEach((k) => { try { orig(k, d.data[k]); } catch (e) {} });
        lastApplied = str;
        onSync();
      } catch (e) {}
    };

    pull(true);                                   // initial hydrate
    interval = setInterval(() => pull(), 30000);  // every 30 seconds
    const onVis = () => { if (document.visibilityState === "visible") pull(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    const onUnload = () => push();
    window.addEventListener("beforeunload", onUnload);

    return () => {
      disposed = true;
      (localStorage as any).setItem = orig;
      if (interval) clearInterval(interval);
      if (pushTimer) clearTimeout(pushTimer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      window.removeEventListener("beforeunload", onUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
