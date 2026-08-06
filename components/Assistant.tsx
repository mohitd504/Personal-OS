"use client";
import { useState } from "react";

const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

// Apply an assistant action to the right on-device tracker
function apply(a: any) {
  const t = today();
  if (a.kind === "meal") {
    const k = "pos_nutri_" + t; const n = LS(k, { meals: [], water: 0 });
    n.meals.push({ name: a.name || "AI meal", cal: +a.cal||0, protein: +a.protein||0, carbs: +a.carbs||0, fat: +a.fat||0, fiber: +a.fiber||0 });
    SS(k, n);
  } else if (a.kind === "walk") {
    const w = LS("pos_walks", []); w.unshift({ id: uid(), date: t, steps: +a.steps||0, distance: +a.distance||0, cal: +a.cal||0, activeMin: +a.activeMin||0, duration: +a.duration||0, pace: a.pace||"", notes: a.notes||"" }); SS("pos_walks", w);
  } else if (a.kind === "cardio") {
    const c = LS("pos_cardio", []); c.unshift({ id: uid(), date: t, activity: a.activity||"Cardio", duration: +a.duration||0, distance: +a.distance||0, cal: +a.cal||0, avgHR: a.avgHR||"", maxHR: a.maxHR||"", notes: a.notes||"" }); SS("pos_cardio", c);
  } else if (a.kind === "weight") {
    const wl = LS("pos_weightlog", []); wl.unshift({ id: uid(), date: t, weight: +a.weight||0, bodyfat: a.bodyfat||"", notes: a.notes||"" }); SS("pos_weightlog", wl);
    const pw = LS("pos_weight", []); pw.push({ date: t, kg: +a.weight||0 }); SS("pos_weight", pw);
  } else if (a.kind === "workout") {
    const type = a.type || "Push";
    const exercises = (a.exercises || []).map((e: any) => { const n = +e.sets||1; const sets = Array.from({length:n}).map(()=>({ w: e.weight??"", r: e.reps??"" })); return { name: e.name, sets, setCount: n, reps: (+e.reps||0)*n, topWeight: +e.weight||0, done: true, volume: (+e.weight||0)*(+e.reps||0)*n }; });
    const vol = exercises.reduce((x: number, e: any) => x + e.volume, 0);
    const all = LS("pos_workouts", []); const idx = all.findIndex((w: any) => w.date===t && w.type===type);
    const rec = { id: idx>=0?all[idx].id:uid(), date: t, type, duration: 0, notes: "", exercises, volume: vol, calories: 0, completion: 100 };
    if (idx>=0) all[idx] = rec; else all.unshift(rec); SS("pos_workouts", all);
  } else { return false; }
  return true;
}

export default function Assistant({ onApplied }: { onApplied: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ who: string; msg: string }[]>([]);
  const send = async () => {
    const t = text.trim(); if (!t) return;
    setLog(l => [...l, { who: "you", msg: t }]); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) });
      const a = await r.json();
      if (a && a.kind && apply(a)) { onApplied(); setLog(l => [...l, { who: "ai", msg: (a.summary || ("Logged " + a.kind)) + " ✓" }]); }
      else setLog(l => [...l, { who: "ai", msg: a?.error==="unauthorized" ? "Please sign in first." : "I couldn't read that — try e.g. \"ate 2 eggs and toast\" or \"walked 5km in 40 min\"." }]);
    } catch (e) { setLog(l => [...l, { who: "ai", msg: "Couldn't reach the assistant. Is your API key set in Vercel?" }]); }
    setBusy(false);
  };
  const bubble = (who: string, msg: string, i: number) => (
    <div key={i} style={{ alignSelf: who==="you"?"flex-end":"flex-start", maxWidth:"85%", padding:"8px 11px", borderRadius:12, fontSize:13, background: who==="you"?"linear-gradient(100deg,#3B82F6,#6366F1)":"rgba(255,255,255,.06)", color:"#E7ECF3" }}>{msg}</div>
  );
  return <>
    <button onClick={() => setOpen(o=>!o)} title="AI assistant"
      style={{ position:"fixed", right:18, bottom:"calc(90px + env(safe-area-inset-bottom))", zIndex:70, width:56, height:56, borderRadius:"50%", border:"none", cursor:"pointer", color:"#fff", fontSize:22, background:"linear-gradient(135deg,#7c3aed,#2b8bf2)", boxShadow:"0 10px 30px rgba(99,102,241,.5)" }}>✨</button>
    {open && <div style={{ position:"fixed", right:18, bottom:"calc(154px + env(safe-area-inset-bottom))", zIndex:70, width:"min(370px,92vw)", height:"60vh", maxHeight:520, display:"flex", flexDirection:"column", background:"rgba(15,23,42,.98)", border:"1px solid rgba(255,255,255,.12)", borderRadius:16, boxShadow:"0 20px 50px rgba(0,0,0,.5)", backdropFilter:"blur(14px)" }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,.1)", fontWeight:700 }}>✨ AI Assistant <span style={{ fontSize:11, color:"#8A94A6", fontWeight:400 }}>· log by chatting</span></div>
      <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
        {!log.length && <div style={{ fontSize:12, color:"#8A94A6", lineHeight:1.6 }}>Tell me what you ate or did and I&apos;ll log it to the right tracker:<br/>• &quot;ate 2 rotis and dal&quot;<br/>• &quot;walked 6000 steps, 4 km, 40 min&quot;<br/>• &quot;did push day: bench 60kg 3x8, incline 24kg 3x10&quot;<br/>• &quot;weighed 95.2 today&quot;</div>}
        {log.map((m,i)=>bubble(m.who,m.msg,i))}
        {busy && <div style={{ fontSize:12, color:"#8A94A6" }}>🤖 thinking…</div>}
      </div>
      <div style={{ padding:10, borderTop:"1px solid rgba(255,255,255,.1)", display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") send(); }} placeholder="Tell me what you ate or did…" style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"9px 11px", color:"#E7ECF3", outline:"none", fontSize:13 }}/>
        <button onClick={send} disabled={busy} style={{ border:"none", borderRadius:10, padding:"9px 14px", fontWeight:700, cursor:"pointer", color:"#fff", background:"linear-gradient(100deg,#7c3aed,#2b8bf2)" }}>Send</button>
      </div>
    </div>}
  </>;
}
