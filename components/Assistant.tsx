"use client";
import { useState } from "react";

const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

function buildContext() {
  const t = today();
  const n = LS("pos_nutri_" + t, { meals: [], water: 0 });
  const eaten = { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  (n.meals || []).forEach((m: any) => { eaten.cal += +m.cal||0; eaten.protein += +m.protein||0; eaten.carbs += +m.carbs||0; eaten.fat += +m.fat||0; eaten.fiber += +m.fiber||0; });
  const S = Object.assign({ calorieGoal:2350, proteinGoal:180, carbGoal:250, fatGoal:70, fiberGoal:35, waterGoal:3.5, stepGoal:9000, weightGoal:87 }, LS("pos_settings", {}));
  const wl = LS("pos_weightlog", []); const pw = LS("pos_weight", []);
  const weight = wl.length && wl[0].weight ? +wl[0].weight : (pw.length ? +pw[pw.length-1].kg : null);
  const stepsToday = LS("pos_walks", []).filter((x: any)=>x.date===t).reduce((a: number,x: any)=>a+(+x.steps||0),0);
  return { date: t, goals: { calorie:S.calorieGoal, protein:S.proteinGoal, carbs:S.carbGoal, fat:S.fatGoal, fiber:S.fiberGoal, water:S.waterGoal, steps:S.stepGoal, weightGoal:S.weightGoal }, eaten, water: n.water||0, weight, stepsToday };
}

function apply(a: any): boolean {
  const t = today();
  if (a.kind === "meal") {
    const k = "pos_nutri_" + t; const n = LS(k, { meals: [], water: 0 });
    n.meals.push({ name: a.name || "AI meal", cal: +a.cal||0, protein: +a.protein||0, carbs: +a.carbs||0, fat: +a.fat||0, fiber: +a.fiber||0 }); SS(k, n); return true;
  } else if (a.kind === "walk") {
    const w = LS("pos_walks", []); w.unshift({ id: uid(), date: t, steps: +a.steps||0, distance: +a.distance||0, cal: +a.cal||0, activeMin: +a.activeMin||0, duration: +a.duration||0, pace: a.pace||"", notes: a.notes||"" }); SS("pos_walks", w); return true;
  } else if (a.kind === "cardio") {
    const c = LS("pos_cardio", []); c.unshift({ id: uid(), date: t, activity: a.activity||"Cardio", duration: +a.duration||0, distance: +a.distance||0, cal: +a.cal||0, avgHR: a.avgHR||"", maxHR: a.maxHR||"", notes: a.notes||"" }); SS("pos_cardio", c); return true;
  } else if (a.kind === "weight") {
    const wl = LS("pos_weightlog", []); wl.unshift({ id: uid(), date: t, weight: +a.weight||0, bodyfat: a.bodyfat||"", notes: a.notes||"" }); SS("pos_weightlog", wl);
    const pw = LS("pos_weight", []); pw.push({ date: t, kg: +a.weight||0 }); SS("pos_weight", pw); return true;
  } else if (a.kind === "workout") {
    const type = a.type || "Push";
    const exercises = (a.exercises || []).map((e: any) => { const n = +e.sets||1; const sets = Array.from({length:n}).map(()=>({ w: e.weight??"", r: e.reps??"" })); return { name: e.name, sets, setCount: n, reps: (+e.reps||0)*n, topWeight: +e.weight||0, done: true, volume: (+e.weight||0)*(+e.reps||0)*n }; });
    const vol = exercises.reduce((x: number, e: any) => x + e.volume, 0);
    const all = LS("pos_workouts", []); const idx = all.findIndex((w: any) => w.date===t && w.type===type);
    const rec = { id: idx>=0?all[idx].id:uid(), date: t, type, duration: 0, notes: "", exercises, volume: vol, calories: 0, completion: 100 };
    if (idx>=0) all[idx] = rec; else all.unshift(rec); SS("pos_workouts", all); return true;
  }
  return false;
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
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t, context: buildContext() }) });
      const a = await r.json();
      if (a && a.kind === "reply") { setLog(l => [...l, { who: "ai", msg: a.summary || "…" }]); }
      else if (a && a.kind && apply(a)) { onApplied(); setLog(l => [...l, { who: "ai", msg: (a.summary || ("Logged " + a.kind)) + " ✓" }]); }
      else if (a && a.error === "no-key") { setLog(l => [...l, { who: "ai", msg: "No AI key set. Add OPENAI_API_KEY in Vercel → Settings → Environment Variables, then redeploy." }]); }
      else if (a && a.error === "unauthorized") { setLog(l => [...l, { who: "ai", msg: "Please sign in first." }]); }
      else if (a && a.raw) { setLog(l => [...l, { who: "ai", msg: String(a.raw).slice(0, 500) }]); }
      else { setLog(l => [...l, { who: "ai", msg: "I couldn't read that — try e.g. \"ate 2 eggs and toast\" or \"how many calories left?\"" }]); }
    } catch (e) { setLog(l => [...l, { who: "ai", msg: "Couldn't reach the assistant." }]); }
    setBusy(false);
  };
  return <>
    <button onClick={() => setOpen(o=>!o)} title="AI assistant"
      style={{ position:"fixed", right:18, bottom:"calc(90px + env(safe-area-inset-bottom))", zIndex:70, width:56, height:56, borderRadius:"50%", border:"none", cursor:"pointer", color:"#fff", fontSize:22, background:"linear-gradient(135deg,#7c3aed,#2b8bf2)", boxShadow:"0 10px 30px rgba(99,102,241,.5)" }}>{open ? "✕" : "✨"}</button>
    {open && <div style={{ position:"fixed", right:18, bottom:"calc(154px + env(safe-area-inset-bottom))", zIndex:70, width:"min(370px,92vw)", height:"60vh", maxHeight:520, display:"flex", flexDirection:"column", background:"rgba(15,23,42,.98)", border:"1px solid rgba(255,255,255,.12)", borderRadius:16, boxShadow:"0 20px 50px rgba(0,0,0,.5)", backdropFilter:"blur(14px)" }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontWeight:700 }}>✨ AI Assistant</div>
        <button onClick={()=>setLog([])} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", color:"#8A94A6", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer" }}>Clear</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
        {!log.length && <div style={{ fontSize:12, color:"#8A94A6", lineHeight:1.6 }}>Log or ask — I use your today&apos;s numbers:<br/>• &quot;ate 2 rotis and dal&quot;<br/>• &quot;walked 6000 steps, 4 km, 40 min&quot;<br/>• &quot;did push day: bench 60kg 3x8&quot;<br/>• &quot;how many calories / protein left today?&quot;</div>}
        {log.map((m,i)=><div key={i} style={{ alignSelf: m.who==="you"?"flex-end":"flex-start", maxWidth:"85%", padding:"8px 11px", borderRadius:12, fontSize:13, whiteSpace:"pre-wrap", background: m.who==="you"?"linear-gradient(100deg,#3B82F6,#6366F1)":"rgba(255,255,255,.06)", color:"#E7ECF3" }}>{m.msg}</div>)}
        {busy && <div style={{ fontSize:12, color:"#8A94A6" }}>🤖 thinking…</div>}
      </div>
      <div style={{ padding:10, borderTop:"1px solid rgba(255,255,255,.1)", display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") send(); }} placeholder="Log something or ask a question…" style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"9px 11px", color:"#E7ECF3", outline:"none", fontSize:13 }}/>
        <button onClick={send} disabled={busy} style={{ border:"none", borderRadius:10, padding:"9px 14px", fontWeight:700, cursor:"pointer", color:"#fff", background:"linear-gradient(100deg,#7c3aed,#2b8bf2)" }}>Send</button>
      </div>
    </div>}
  </>;
}
