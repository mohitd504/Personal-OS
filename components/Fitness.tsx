"use client";
import { useState, useEffect, Fragment } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ---------- storage ---------- */
const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 9);
const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const today = () => dstr(new Date());
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

/* ---------- exercise libraries ---------- */
const PUSH = ["Bench Press","Incline Dumbbell Press","Machine Chest Press","Cable Fly","Shoulder Press","Lateral Raise","Rear Delt Fly","Tricep Pushdown","Overhead Tricep Extension","Dips","Push-ups","Plank"];
const PULL = ["Deadlift","Lat Pulldown","Pull-ups","Barbell Row","Seated Cable Row","Single Arm Row","Face Pull","Barbell Curl","Hammer Curl","Preacher Curl","Shrugs","Farmer Walk"];
const LEGS = ["Squat","Romanian Deadlift","Leg Press","Walking Lunges","Leg Extension","Hamstring Curl","Bulgarian Split Squat","Standing Calf Raise","Seated Calf Raise","Hip Thrust","Glute Bridge","Ab Wheel"];
const LIBMAP: Record<string,string[]> = { Push:PUSH, Pull:PULL, Legs:LEGS };
const SCHED: Record<number,string> = { 0:"Recovery", 1:"Push", 2:"Pull", 3:"Legs", 4:"Push", 5:"Pull", 6:"Legs" };
const FOCUS: Record<string, {key:string;label:string;list:string[]}[]> = {
  Push: [
    { key:"chest", label:"Chest focus (4 chest · 2 shoulder · 3 triceps)", list:["Bench Press","Incline Dumbbell Press","Machine Chest Press","Cable Fly","Shoulder Press","Lateral Raise","Tricep Pushdown","Overhead Tricep Extension","Dips"] },
    { key:"shoulder", label:"Shoulder focus (4 shoulder · 2 chest · 3 triceps)", list:["Shoulder Press","Arnold Press","Lateral Raise","Rear Delt Fly","Bench Press","Incline Dumbbell Press","Tricep Pushdown","Overhead Tricep Extension","Dips"] },
  ],
  Pull: [
    { key:"back", label:"Back focus", list:["Deadlift","Lat Pulldown","Pull-ups","Barbell Row","Seated Cable Row","Single Arm Row","Face Pull","Barbell Curl","Hammer Curl"] },
    { key:"biceps", label:"Biceps focus", list:["Barbell Curl","Preacher Curl","Hammer Curl","Lat Pulldown","Seated Cable Row","Barbell Row","Face Pull","Shrugs","Pull-ups"] },
  ],
  Legs: [
    { key:"quad", label:"Quad focus", list:["Squat","Leg Press","Walking Lunges","Leg Extension","Bulgarian Split Squat","Romanian Deadlift","Hamstring Curl","Standing Calf Raise","Seated Calf Raise"] },
    { key:"glute", label:"Glute / Ham focus", list:["Romanian Deadlift","Hip Thrust","Glute Bridge","Hamstring Curl","Bulgarian Split Squat","Squat","Leg Press","Standing Calf Raise","Ab Wheel"] },
  ],
};
export function exEmoji(name:string){ const n=name.toLowerCase();
  if(/(squat|lunge|leg press|leg extension|hip thrust|glute|calf|split squat)/.test(n)) return "🦵";
  if(/curl/.test(n)) return "💪";
  if(/(plank|ab wheel|crunch)/.test(n)) return "🧘";
  if(/(pull-?up|chin|pulldown|lat)/.test(n)) return "🧗";
  if(/(deadlift|row|shrug|farmer)/.test(n)) return "🏋️";
  return "🏋️"; }
export function demoLink(name:string){ return "https://www.youtube.com/results?search_query="+encodeURIComponent(name+" proper form"); }
export const HOWTO: Record<string,string> = {
  "Bench Press":"Lie flat, grip the bar slightly wider than shoulders. Unrack, lower the bar to mid-chest with elbows about 45°, then press up until arms lock. Keep shoulder blades pinched and feet planted.",
  "Incline Dumbbell Press":"Set the bench to 30–45°. Start with dumbbells at shoulder level, press up and slightly together until arms extend, then lower slowly to feel the upper-chest stretch.",
  "Machine Chest Press":"Sit with back flat and handles at chest height. Push forward until arms are straight, squeeze the chest, and return under control without letting the stack slam.",
  "Cable Fly":"Set pulleys high, step forward with a slight lean and soft elbows. Bring the handles together in front of your chest in a hugging arc, squeeze, then control the stretch back.",
  "Shoulder Press":"Seated or standing, start at shoulder height and press overhead without flaring the ribs. Lower back to ear level under control.",
  "Lateral Raise":"Slight bend in the elbows, raise the dumbbells out to the sides to shoulder height leading with the elbows, then lower slowly. No swinging.",
  "Rear Delt Fly":"Hinge at the hips, arms hanging. Raise the dumbbells out to the sides squeezing the rear delts, keep the neck neutral and elbows soft.",
  "Arnold Press":"Start with dumbbells at shoulder height, palms facing you. Press overhead while rotating your palms to face forward, then reverse the rotation on the way down. Hits all three delt heads.",
  "Tricep Pushdown":"Elbows pinned to your sides, push the bar/rope down until arms lock and squeeze the triceps, then return to 90° without letting elbows drift.",
  "Overhead Tricep Extension":"Hold a weight overhead, keep elbows narrow, lower behind your head by bending the elbows, then extend back up.",
  "Dips":"Support on parallel bars, lean slightly forward, lower until elbows reach ~90°, then press back up to lockout.",
  "Push-ups":"Hands under shoulders, body in a straight line. Lower the chest toward the floor with elbows ~45°, then push back up bracing the core.",
  "Plank":"Forearms under shoulders, body dead straight. Brace the core and glutes and hold — don't let the hips sag or pike.",
  "Deadlift":"Bar over mid-foot, hinge and grip just outside the knees. Flat back, chest up — drive through the floor and stand tall locking the hips, then lower with control.",
  "Lat Pulldown":"Grip wide, lean back slightly. Pull the bar to your upper chest driving the elbows down and squeezing the lats; control the bar back up.",
  "Pull-ups":"Hang with a full stretch, pull your chest toward the bar by driving the elbows down and back, then lower all the way under control.",
  "Barbell Row":"Hinge to ~45° with a flat back. Row the bar to your lower ribs squeezing the back, then lower controlled. Avoid jerking with the lower back.",
  "Seated Cable Row":"Sit tall, pull the handle to your torso squeezing the shoulder blades together, then extend the arms without rounding the back.",
  "Single Arm Row":"One knee and hand on the bench, back flat. Row the dumbbell to your hip squeezing the lat, then lower slowly for a full stretch.",
  "Face Pull":"Set the rope at face height. Pull toward your face flaring the elbows out and squeezing the rear delts/upper back; control the return.",
  "Barbell Curl":"Elbows at your sides, curl the bar up squeezing the biceps, then lower slowly. Keep the torso still — no swinging.",
  "Hammer Curl":"Neutral grip (palms facing each other), curl the dumbbells up and lower under control. Great for biceps and forearms.",
  "Preacher Curl":"Arms resting on the pad, curl the weight up fully, then lower slowly and control the stretch at the bottom.",
  "Shrugs":"Hold the weights at your sides, elevate the shoulders straight up toward your ears, squeeze the traps, then lower fully.",
  "Farmer Walk":"Hold heavy dumbbells at your sides, brace the core, stand tall and walk with controlled steps.",
  "Squat":"Bar on upper back, feet shoulder-width. Sit down and back until thighs reach about parallel, then drive up through mid-foot keeping the chest up.",
  "Romanian Deadlift":"Soft knees, push the hips back lowering the bar along your legs until you feel a hamstring stretch, then drive the hips forward to stand.",
  "Leg Press":"Feet shoulder-width on the platform. Lower until knees reach ~90°, then press back without harshly locking the knees.",
  "Walking Lunges":"Step forward and lower the back knee toward the floor, then push through the front heel to rise and step through. Keep the torso upright.",
  "Leg Extension":"Extend your knees to straighten the legs and squeeze the quads at the top, then lower under control.",
  "Hamstring Curl":"Curl the pad toward your glutes squeezing the hamstrings, then control the return without letting it drop.",
  "Bulgarian Split Squat":"Rear foot on a bench, lower into the front leg until the thigh is about parallel, then drive up through the front heel.",
  "Standing Calf Raise":"Rise onto your toes as high as possible squeezing the calves, then lower for a deep stretch. Full range each rep.",
  "Seated Calf Raise":"Knees bent under the pad, raise the heels and squeeze the calves, then lower slowly for the stretch.",
  "Hip Thrust":"Upper back on a bench, bar over the hips. Drive the hips up until the body is level, squeeze the glutes hard, then lower.",
  "Glute Bridge":"Lie on the floor, feet flat. Drive the hips up squeezing the glutes, hold briefly, then lower under control.",
  "Ab Wheel":"Kneel holding the wheel, brace the core and roll forward as far as you can control, then pull back — never let the lower back arch.",
};

/* ---------- chart helpers ---------- */
const COLORS = ["#3B82F6","#10B981","#F59E0B","#A855F7","#EC4899","#06B6D4","#8B5CF6"];
const TT = { background:"#0f172a", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, color:"#E7ECF3" } as any;
function LineC({ title, data, color }: any) {
  return <div className="card"><strong>{title}</strong><div style={{height:210,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis domain={["auto","auto"]} tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false} width={34}/>
      <Tooltip contentStyle={TT}/><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{r:3,fill:color}}/>
    </LineChart></ResponsiveContainer></div></div>;
}
function BarC({ title, data, color }: any) {
  return <div className="card"><strong>{title}</strong><div style={{height:210,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false} width={30}/>
      <Tooltip cursor={{fill:"rgba(255,255,255,.05)"}} contentStyle={TT}/><Bar dataKey="value" fill={color} radius={[6,6,0,0]}/>
    </BarChart></ResponsiveContainer></div></div>;
}
function PieC({ title, data }: any) {
  const empty = data.every((d:any)=>!d.value);
  return <div className="card"><strong>{title}</strong><div style={{height:210,marginTop:6}}>{empty? <div className="muted" style={{textAlign:"center",paddingTop:84}}>No data yet</div> :
    <ResponsiveContainer width="100%" height="100%"><PieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3} stroke="none">{data.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie>
      <Tooltip contentStyle={TT}/></PieChart></ResponsiveContainer>}</div>
    <div className="row" style={{flexWrap:"wrap",gap:10,marginTop:6}}>{data.map((d:any,i:number)=><span key={i} className="muted" style={{fontSize:12}}><span style={{display:"inline-block",width:10,height:10,borderRadius:3,background:COLORS[i%COLORS.length],marginRight:6}}/>{d.name}: {d.value}</span>)}</div>
  </div>;
}
/* aggregate a store's numeric field by day for N days */
function byDay(store: string, field: string, n: number) {
  const rows = LS(store, []); const out = [];
  for (let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d);
    const v = rows.filter((x:any)=>x.date===ds).reduce((a:number,x:any)=>a+(+x[field]||0),0);
    out.push({ name: n<=7?DOW[d.getDay()]:String(d.getDate()), value: Math.round(v*10)/10 }); }
  return out;
}
function sumRange(store: string, field: string, n: number) { return byDay(store, field, n).reduce((a,x)=>a+x.value,0); }
function curWeight(){ const wl=LS("pos_weightlog",[]); if(wl.length&&+wl[0].weight) return +wl[0].weight; const w2=LS("pos_weight",[]); if(w2.length&&w2[w2.length-1].kg) return +w2[w2.length-1].kg; return 97; }
async function aiCalories(payload:any){ try{ const r=await fetch("/api/exercise",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const d=await r.json(); return +d.cal||0; }catch(e){ return 0; } }

/* ---------- CSV export ---------- */
function exportCSV(name: string, rows: any[]) {
  if (!rows.length) { alert("Nothing to export yet."); return; }
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => `"${String(r[c]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = name+".csv"; a.click();
}

/* ---------- generic tracker (walk / weight / cardio) ---------- */
type Field = { k:string; label:string; type?:string; options?:string[]; optional?:boolean };
function Tracker({ storeKey, title, icon, fields, charts, refresh, aiCal, aiParse }:
  { storeKey:string; title:string; icon:string; fields:Field[]; charts:{title:string;field:string;kind:string;color:string}[]; refresh:()=>void; aiCal?:string; aiParse?:string }) {
  const rows: any[] = LS(storeKey, []);
  const [form, setForm] = useState<any>({ date: today() });
  const [editId, setEditId] = useState<string|null>(null);
  const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [ptext, setPtext] = useState(""); const [pbusy, setPbusy] = useState(false);
  const parseAI = async () => {
    if (!ptext.trim()) return; setPbusy(true);
    try {
      const r = await fetch("/api/parse-activity", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text: ptext, kind: aiParse, fields: fields.map(f=>f.k) }) });
      const d = await r.json();
      if (d && typeof d === "object") setForm((s:any)=>({ date: today(), ...s, ...d }));
    } catch (e) {}
    setPbusy(false);
  };
  const save = async () => {
    if (!form.date) { alert("Pick a date"); return; }
    const f = { ...form };
    if (aiCal && !(+f.cal>0) && (f.duration||f.distance||f.steps)) {
      setBusy(true);
      const cal = await aiCalories({ kind:aiCal, activity:f.activity, duration:f.duration, distance:f.distance, steps:f.steps, weightKg:curWeight() });
      if (cal) f.cal = cal;
      setBusy(false);
    }
    const all = LS(storeKey, []);
    if (editId) { const i = all.findIndex((x:any)=>x.id===editId); if(i>=0) all[i] = { ...all[i], ...f }; }
    else all.push({ id: uid(), ...f });
    all.sort((a:any,b:any)=> a.date<b.date?1:-1);
    SS(storeKey, all); setForm({ date: today() }); setEditId(null); refresh();
  };
  const edit = (r:any) => { setForm({ ...r }); setEditId(r.id); window.scrollTo({top:0,behavior:"smooth"}); };
  const del = (id:string) => { SS(storeKey, LS(storeKey,[]).filter((x:any)=>x.id!==id)); refresh(); };
  let shown = rows;
  if (q) shown = shown.filter((r:any)=> JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  if (from) shown = shown.filter((r:any)=> r.date>=from);
  if (to) shown = shown.filter((r:any)=> r.date<=to);
  const firstNum = fields.find(f=>f.type!=="text"&&f.type!=="date"&&f.type!=="select")?.k || "";
  return <>
    <div className="head"><h1>{icon} {title}</h1><p>Manual entries — smartwatch not connected. All values entered by you.</p></div>
    <div className="grid g3">
      <div className="card kpi"><div className="lbl">This week</div><div className="val">{Math.round(sumRange(storeKey,firstNum,7))}<small> {firstNum}</small></div></div>
      <div className="card kpi"><div className="lbl">This month</div><div className="val">{Math.round(sumRange(storeKey,firstNum,30))}<small> {firstNum}</small></div></div>
      <div className="card kpi"><div className="lbl">Entries</div><div className="val">{rows.length}</div></div>
    </div>
    <div className="card" style={{marginTop:16}}>
      <div className="between"><strong>{editId?"Edit entry":"Add entry"}</strong>{editId && <button className="btn ghost sm" onClick={()=>{setForm({date:today()});setEditId(null);}}>Cancel edit</button>}</div>
      {aiParse && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Describe it — Claude fills the fields</strong></div>
        <textarea className="in" value={ptext} onChange={e=>setPtext(e.target.value)} placeholder={aiParse==="cardio" ? "e.g. 30 min cycling, 12 km, felt easy, avg HR 135" : "e.g. walked 5.2 km in 48 min, about 320 kcal, 6800 steps"} style={{width:"100%",minHeight:56,marginTop:8}}/>
        <div style={{marginTop:6}}><button className="btn ghost sm" onClick={parseAI} disabled={pbusy}>{pbusy?"🤖 Reading…":"✨ Read with AI"}</button> <span className="muted" style={{fontSize:11}}>then review below and hit Add</span></div>
      </div>}
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        {fields.map(f=> f.type==="select"
          ? <select key={f.k} className="in" value={form[f.k]||""} onChange={e=>setForm((s:any)=>({...s,[f.k]:e.target.value}))} style={{minWidth:130}}><option value="">{f.label}</option>{(f.options||[]).map(o=><option key={o}>{o}</option>)}</select>
          : <input key={f.k} className="in" type={f.type||"number"} placeholder={f.label+(f.optional?" (opt)":"")} value={form[f.k]??""} onChange={e=>setForm((s:any)=>({...s,[f.k]:f.type==="text"||f.type==="date"?e.target.value:e.target.value}))} style={{width:f.type==="text"?200:f.type==="date"?150:120}}/>
        )}
        <button className="btn" onClick={save} disabled={busy}>{busy?"🤖 Estimating…":(editId?"Update":"Add entry")}</button>
      </div>
      {aiCal && <div className="muted" style={{fontSize:11,marginTop:8}}>Leave Calories blank and Claude estimates burn from your weight ({curWeight()}kg), duration &amp; distance.</div>}
    </div>
    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><strong>History</strong>
        <div className="row" style={{flexWrap:"wrap",gap:8}}>
          <input className="in" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} style={{width:130}}/>
          <input className="in" type="date" value={from} onChange={e=>setFrom(e.target.value)} title="From" style={{width:140}}/>
          <input className="in" type="date" value={to} onChange={e=>setTo(e.target.value)} title="To" style={{width:140}}/>
          <button className="btn ghost sm" onClick={()=>exportCSV(storeKey, shown)}>⬇ CSV</button>
        </div>
      </div>
      <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
        <thead><tr>{fields.map(f=><th key={f.k} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"8px 6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{f.label}</th>)}<th style={{padding:"8px 6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}></th></tr></thead>
        <tbody>{shown.length? shown.map((r:any)=><tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          {fields.map(f=><td key={f.k} style={{padding:"7px 6px",fontSize:13}}>{r[f.k]||"—"}</td>)}
          <td style={{padding:"7px 6px",whiteSpace:"nowrap"}}><span className="btn ghost sm" style={{cursor:"pointer",marginRight:6}} onClick={()=>edit(r)}>✎</span><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(r.id)}>✕</span></td>
        </tr>): <tr><td colSpan={fields.length+1} className="muted" style={{padding:"10px 6px"}}>No entries yet.</td></tr>}</tbody>
      </table></div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      {charts.map((c,i)=> c.kind==="bar"
        ? <BarC key={i} title={c.title} color={c.color} data={byDay(storeKey,c.field,c.title.includes("Monthly")?30:7)}/>
        : <LineC key={i} title={c.title} color={c.color} data={byDay(storeKey,c.field,c.title.includes("Monthly")?30:7)}/>)}
    </div>
  </>;
}

/* ---------- workout page (Push / Pull / Leg) ---------- */
function lastWeight(type:string, ex:string){ const hist=LS("pos_workouts",[]).filter((w:any)=>w.type===type); for(const w of hist){ const e=(w.exercises||[]).find((x:any)=>x.name===ex); if(e){ if(e.topWeight) return e.topWeight; if(Array.isArray(e.sets)&&e.sets.length){ const m=Math.max(0,...e.sets.map((s:any)=>+s.w||0)); if(m) return m; } if(e.weight) return e.weight; } } return null; }
function WorkoutPage({ type, list, refresh }: { type:string; list:string[]; refresh:()=>void }) {
  const draftKey = "pos_wdraft_"+type;
  const [rows, setRows] = useState<any>(LS(draftKey, {}));
  const [openEx, setOpenEx] = useState<string|null>(null);
  const [dur, setDur] = useState<any>(LS(draftKey+"_dur", ""));
  const [notes, setNotes] = useState<any>(LS(draftKey+"_notes", ""));
  const [saving, setSaving] = useState(false);
  const [rep, setRep] = useState<any>(null); const [repBusy, setRepBusy] = useState(false);
  const [schedDate, setSchedDate] = useState(""); const [schedMsg, setSchedMsg] = useState("");
  const [repPrompt, setRepPrompt] = useState(""); const [repEditBusy, setRepEditBusy] = useState(false); const [infoEx, setInfoEx] = useState<string|null>(null);
  const [nextPrompt, setNextPrompt] = useState(""); const [optBusy, setOptBusy] = useState(false); const [optGroups, setOptGroups] = useState<any[]|null>(null); const [optSel, setOptSel] = useState<string[]>([]);
  const getOptions = async () => { if (!nextPrompt.trim()) return; setOptBusy(true); setOptGroups(null); setOptSel([]);
    try { const r = await fetch("/api/workout-options", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type, prompt: nextPrompt }) }); const d = await r.json();
      if (Array.isArray(d.groups)) setOptGroups(d.groups); else if (d.error) alert(d.error); } catch (e) { alert("Couldn't get options — check your AI key."); } setOptBusy(false); };
  const toggleOpt = (name:string) => setOptSel(s => s.includes(name) ? s.filter(x=>x!==name) : [...s, name]);
  const buildFromOptions = () => { if (!optSel.length) { alert("Pick at least one exercise."); return; }
    setRep((x:any)=>({ ...(x||{}), nextFocus: x&&x.nextFocus ? x.nextFocus : nextPrompt, next: optSel.map(n=>{ const prev=(x&&x.next||[]).find((e:any)=>e.name===n); return prev||{ name:n, sets:3, reps:10, weight:"" }; }) }));
    setOptGroups(null); };
  const editNextAI = async () => { if (!rep || !repPrompt.trim()) return; setRepEditBusy(true);
    try { const r = await fetch("/api/edit-workout", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type, exercises: rep.next, prompt: repPrompt }) }); const d = await r.json();
      if (Array.isArray(d.exercises)) setRep((x:any)=>({ ...x, next: d.exercises })); setRepPrompt(""); } catch (e) {} setRepEditBusy(false); };
  const getEx = (ex:string) => { const e = rows[ex] || {}; return { ...e, sets: Array.isArray(e.sets) ? e.sets : [{w:"",r:""}], rpe: e.rpe??"", rest: e.rest??"", notes: e.notes??"", done: !!e.done }; };
  const saveRows = (n:any) => { setRows(n); SS(draftKey, n); };
  const setEx = (ex:string, patch:any) => saveRows({ ...rows, [ex]: { ...getEx(ex), ...patch } });
  const addSet = (ex:string) => { const e=getEx(ex); setEx(ex, { sets:[...(e.sets||[]), {w:"",r:""}] }); };
  const updSet = (ex:string,i:number,f:string,v:any) => { const e=getEx(ex); const sets=(e.sets||[]).slice(); sets[i]={...sets[i],[f]:v}; setEx(ex,{sets}); };
  const delSet = (ex:string,i:number) => { const e=getEx(ex); const sets=(e.sets||[]).slice(); sets.splice(i,1); if(!sets.length) sets.push({w:"",r:""}); setEx(ex,{sets}); };
  const exSets = (ex:string) => (getEx(ex).sets||[]).filter((s:any)=>s.w||s.r);
  const exVolume = (ex:string) => (getEx(ex).sets||[]).reduce((a:number,s:any)=>a+(+s.w||0)*(+s.r||0),0);
  const totalVolume = list.reduce((a,ex)=>a+exVolume(ex),0);
  const totalSets = list.reduce((a,ex)=>a+exSets(ex).length,0);
  const pct = Math.round(list.filter(ex=>getEx(ex).done).length/list.length*100);
  const estDur = (+dur||0)>0 ? (+dur) : totalSets*3;
  const estCal = Math.round(5 * curWeight() * estDur/60);

  const commit = async (finish:boolean) => {
    const draft = LS(draftKey, {});
    const exercises = list.filter(ex=>{ const e=draft[ex]||{}; const arr=Array.isArray(e.sets)?e.sets:[]; return e.done || arr.some((s:any)=>s.w||s.r); }).map(ex=>{ const e=draft[ex]||{}; const arr=Array.isArray(e.sets)?e.sets:[]; const sets=arr.filter((s:any)=>s.w||s.r); return { name:ex, sets, setCount:sets.length, reps:sets.reduce((a:number,s:any)=>a+(+s.r||0),0), topWeight:sets.length?Math.max(0,...sets.map((s:any)=>+s.w||0)):0, rpe:e.rpe||"", rest:e.rest||"", notes:e.notes||"", done:!!e.done, volume:sets.reduce((a:number,s:any)=>a+(+s.w||0)*(+s.r||0),0) }; });
    if (!exercises.length) { if(finish) alert("Log at least one set first."); return; }
    const vol = exercises.reduce((a:number,e:any)=>a+(e.volume||0),0);
    const setsN = exercises.reduce((a:number,e:any)=>a+e.setCount,0);
    const completion = Math.round(exercises.filter((e:any)=>e.done).length/list.length*100);
    const eDur = (+dur||0)>0?(+dur):setsN*3;
    let calories = Math.round(5*curWeight()*eDur/60);
    if (finish) { setSaving(true); const ai=await aiCalories({kind:"strength",duration:eDur,volume:vol,weightKg:curWeight()}); if(ai) calories=ai; setSaving(false); }
    const all = LS("pos_workouts", []);
    const idx = all.findIndex((w:any)=>w.date===today()&&w.type===type);
    const rec = { id: idx>=0?all[idx].id:uid(), date:today(), type, duration:eDur, notes, exercises, volume:vol, calories, completion };
    if (idx>=0) all[idx]=rec; else all.unshift(rec);
    SS("pos_workouts", all); refresh();
    if (finish) alert(type+" workout saved ✔  (~"+calories+" kcal)");
  };
  const submitEx = (ex:string) => { const e=getEx(ex); const n={ ...rows, [ex]: { ...e, done: !e.done } }; setRows(n); SS(draftKey, n); commit(false); };
  const genReport = async () => {
    await commit(true);
    const w = LS("pos_workouts", []).find((x:any)=>x.date===today()&&x.type===type);
    if (!w || !(w.exercises||[]).length) { alert("Log at least one exercise first."); return; }
    setRepBusy(true); setSchedMsg(""); setRep(null);
    try {
      const r = await fetch("/api/workout-report", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ workout:{ type:w.type, exercises:(w.exercises||[]).map((e:any)=>({ name:e.name, topWeight:e.topWeight, reps:e.reps, sets:(e.sets||[]).map((s:any)=>({weight:s.w,reps:s.r})) })), volume:w.volume, duration:w.duration } }) });
      const d = await r.json();
      if (d.error) alert(d.error); else setRep(d);
    } catch (e) { alert("Report failed — check your AI key."); }
    setRepBusy(false);
  };
  const setNextField = (i:number, field:string, val:string) => setRep((r:any)=> r? { ...r, next: (r.next||[]).map((x:any,idx:number)=> idx===i? {...x,[field]:val}:x) } : r);
  const delNext = (i:number) => setRep((r:any)=> r? { ...r, next:(r.next||[]).filter((_:any,idx:number)=>idx!==i) } : r);
  const addToPlan = () => {
    if (!schedDate) { alert("Pick a date for the next workout."); return; }
    const key = "pos_plan_"+schedDate; const cur:any = LS(key, {}); const ex = Array.isArray(cur.exSessions)? cur.exSessions : [];
    ex.push({ id: uid(), time:"", type, done:false, detail: rep.nextFocus? ("Focus: "+rep.nextFocus):"", steps:"", distance:"", duration:"", selected: (rep.next||[]).map((x:any)=>({ name:x.name, sets:String(x.sets||3), reps:String(x.reps||10), weight:String(x.weight||""), note:"" })) });
    SS(key, { ...cur, exSessions: ex });
    setSchedMsg("✓ Added to your plan on "+schedDate+" — open Goals to see it with all exercises & weights.");
  };

  const color = type==="Push"?"🟦":type==="Pull"?"🟪":"🟩";
  return <>
    <div className="head"><h1>{color} {type} Day</h1><p>Log the weight &amp; reps for every set, then submit each exercise as you finish it.</p></div>
    {list.map(ex=>{ const e=getEx(ex); const sets=(e.sets&&e.sets.length)?e.sets:[{w:"",r:""}]; const lw=lastWeight(type,ex); return (
      <div className="card" key={ex} style={{marginBottom:14, borderColor: e.done?"rgba(16,185,129,.45)":undefined}}>
        <div className="between" style={{flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:12,flex:"0 0 46px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,background:"linear-gradient(135deg,rgba(59,130,246,.22),rgba(168,85,247,.18))",border:"1px solid rgba(255,255,255,.1)"}}>{exEmoji(ex)}</div>
            <div><div style={{fontSize:16,fontWeight:650}}>{ex}</div>
              <div className="row" style={{gap:10,marginTop:3}}>{lw?<span className="muted" style={{fontSize:11}}>last {lw}kg</span>:null}<a href={demoLink(ex)} target="_blank" rel="noopener" style={{fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a><span onClick={()=>setOpenEx(openEx===ex?null:ex)} style={{fontSize:11,color:"#a5b4fc",cursor:"pointer"}}>ⓘ How to</span></div>
            </div>
          </div>
          {e.done && <span className="in" style={{padding:"4px 10px",color:"#6ee7b7",borderColor:"rgba(16,185,129,.4)"}}>✓ Done</span>}
        </div>
        {openEx===ex && <div className="muted" style={{fontSize:13,lineHeight:1.6,margin:"10px 0 0"}}><b style={{color:"#E7ECF3"}}>How to: </b>{HOWTO[ex]||"Perform with controlled form and a full range of motion."}</div>}
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}>
          <thead><tr>{["Set","Weight (kg)","Reps",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px"}}>{h}</th>)}</tr></thead>
          <tbody>{sets.map((s:any,i:number)=><tr key={i}>
            <td style={{padding:"6px",fontWeight:700,width:40,color:"#8A94A6"}}>{i+1}</td>
            <td style={{padding:"6px"}}><input className="in" type="number" inputMode="decimal" value={s.w??""} onChange={ev=>updSet(ex,i,"w",ev.target.value)} style={{width:110,fontSize:15}}/></td>
            <td style={{padding:"6px"}}><input className="in" type="number" inputMode="numeric" value={s.r??""} onChange={ev=>updSet(ex,i,"r",ev.target.value)} style={{width:110,fontSize:15}}/></td>
            <td style={{padding:"6px"}}>{sets.length>1 && <span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delSet(ex,i)}>✕</span>}</td>
          </tr>)}</tbody>
        </table>
        <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <button className="btn ghost sm" onClick={()=>addSet(ex)}>+ Add set</button>
          <input className="in" type="number" placeholder="RPE" value={e.rpe??""} onChange={ev=>setEx(ex,{rpe:ev.target.value})} style={{width:78}}/>
          <input className="in" type="number" placeholder="Rest s" value={e.rest??""} onChange={ev=>setEx(ex,{rest:ev.target.value})} style={{width:90}}/>
          <input className="in" placeholder="Notes" value={e.notes??""} onChange={ev=>setEx(ex,{notes:ev.target.value})} style={{flex:1,minWidth:120}}/>
        </div>
        <div className="between" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
          <span className="muted" style={{fontSize:12}}>{exSets(ex).length} sets · {exVolume(ex)} kg volume</span>
          <button className={"btn "+(e.done?"ghost ":"")+"sm"} onClick={()=>submitEx(ex)}>{e.done?"↺ Unmark":"✓ Submit exercise"}</button>
        </div>
      </div>
    ); })}
    <div className="grid g4" style={{marginTop:4}}>
      <div className="card kpi"><div className="lbl">Total Volume</div><div className="val">{totalVolume}<small> kg</small></div></div>
      <div className="card kpi"><div className="lbl">Completion</div><div className="val">{pct}<small>%</small></div></div>
      <div className="card kpi"><div className="lbl">Est. Calories</div><div className="val">{estCal}<small> kcal</small></div></div>
      <div className="card kpi"><div className="lbl">Duration</div><input className="in" type="number" placeholder="min" value={dur} onChange={e=>{setDur(e.target.value);SS(draftKey+"_dur",e.target.value);}} style={{width:90,marginTop:6}}/></div>
    </div>
    <div className="card" style={{marginTop:16}}><strong>Workout notes</strong>
      <textarea className="in" value={notes} onChange={e=>{setNotes(e.target.value);SS(draftKey+"_notes",e.target.value);}} placeholder="How did it feel? PRs?" style={{width:"100%",minHeight:70,marginTop:8}}/>
      <div className="row" style={{marginTop:10,gap:8,flexWrap:"wrap"}}>
        <button className="btn" onClick={()=>commit(true)} disabled={saving}>{saving?"🤖 Estimating calories…":"Finish & save "+type+" workout"}</button>
        <button className="btn" onClick={genReport} disabled={repBusy} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>{repBusy?"🤖 Building report…":"🏁 Workout fully done — AI report & next plan"}</button>
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Each exercise you submit is saved to today&apos;s session automatically. Tap the green button for a full report and your next {type} workout.</div>
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="row" style={{gap:8}}><span>💬</span><strong>Plan your next {type} workout</strong></div>
      <div className="muted" style={{fontSize:12,marginTop:4}}>Describe the split you want — e.g. “4 shoulder, 2 chest, 2 triceps”. Then pick from the exercise options.</div>
      <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
        <input className="in" value={nextPrompt} onChange={e=>setNextPrompt(e.target.value)} placeholder="e.g. 4 shoulder, 2 chest, 2 triceps" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") getOptions(); }}/>
        <button className="btn" onClick={getOptions} disabled={optBusy}>{optBusy?"🤖 Finding…":"✨ Get exercise options"}</button>
      </div>
      {optGroups && <div style={{marginTop:14}}>
        {optGroups.map((g:any,gi:number)=><div key={gi} style={{marginBottom:14}}>
          <div className="muted" style={{fontSize:12,marginBottom:6}}><b style={{color:"#E7ECF3"}}>{g.muscle}</b> — pick {g.pick||1} ({(g.options||[]).filter((o:string)=>optSel.includes(o)).length} selected)</div>
          <div className="row" style={{flexWrap:"wrap",gap:10}}>{(g.options||[]).map((o:string)=>{ const on=optSel.includes(o); return <span key={o} className="row" style={{gap:3}}><button className={"btn "+(on?"":"ghost")+" sm"} onClick={()=>toggleOpt(o)} style={{fontWeight:500}}>{on?"✓ ":""}{o}</button><a href={demoLink(o)} target="_blank" rel="noopener" title="Watch demo" style={{fontSize:12,textDecoration:"none"}}>📺</a></span>; })}</div>
        </div>)}
        <button className="btn" onClick={buildFromOptions} disabled={!optSel.length} style={{marginTop:4}}>Use these {optSel.length} exercise{optSel.length===1?"":"s"} →</button>
      </div>}
    </div>

    {rep && <div className="card" style={{marginTop:16,borderColor:"rgba(16,185,129,.4)"}}>
      {rep.report && <><div className="row" style={{gap:8,marginBottom:8}}><span>📋</span><strong style={{fontSize:16}}>Today&apos;s {type} Report</strong></div>
      <div style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.7,color:"#c9d3e0",background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",borderRadius:12,padding:14}}>{rep.report}</div></>}
      <div className="row" style={{gap:8,margin:"16px 0 8px"}}><span>🎯</span><strong style={{fontSize:15}}>Next {type} workout{rep.nextFocus?` — ${rep.nextFocus} focus`:""}</strong></div>
      {rep.note && <div className="muted" style={{fontSize:12,marginBottom:8}}>{rep.note}</div>}
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
        <thead><tr>{["Exercise","Sets","Reps","Weight (kg)",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
        <tbody>{(rep.next||[]).map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <td style={{padding:"6px"}}><input className="in" value={x.name||""} onChange={e=>setNextField(i,"name",e.target.value)} style={{minWidth:150,width:"100%"}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.sets??""} onChange={e=>setNextField(i,"sets",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.reps??""} onChange={e=>setNextField(i,"reps",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.weight??""} onChange={e=>setNextField(i,"weight",e.target.value)} style={{width:70}}/></td>
          <td style={{padding:"6px",whiteSpace:"nowrap"}}><a href={demoLink(x.name)} target="_blank" rel="noopener" title="Watch demo" style={{marginRight:6,textDecoration:"none"}}>📺</a><span className="btn ghost sm" style={{cursor:"pointer",marginRight:4}} title="How to do this" onClick={()=>setInfoEx(infoEx===x.name?null:x.name)}>ⓘ</span><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delNext(i)}>✕</span></td>
        </tr>)}</tbody>
      </table></div>
      {infoEx && <div className="muted" style={{fontSize:13,lineHeight:1.6,margin:"10px 0 0",padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)"}}>
        <div className="between"><b style={{color:"#E7ECF3"}}>{exEmoji(infoEx)} {infoEx}</b><a href={demoLink(infoEx)} target="_blank" rel="noopener" style={{fontSize:12,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a></div>
        <div style={{marginTop:6}}>{HOWTO[infoEx]||"Perform with controlled form and a full range of motion."}</div>
      </div>}
      <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Change this workout with AI</strong></div>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <input className="in" value={repPrompt} onChange={e=>setRepPrompt(e.target.value)} placeholder="e.g. swap bench for dumbbell press, add rear delts, lighter legs" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") editNextAI(); }}/>
          <button className="btn sm" onClick={editNextAI} disabled={repEditBusy}>{repEditBusy?"🤖 Updating…":"✨ Apply change"}</button>
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>Ask in plain language — it rewrites the exercises &amp; weights above.</div>
      </div>
      <div className="muted" style={{fontSize:11,marginTop:10}}>Tap ⓘ to see how to do each exercise. Happy with it? Pick the day you&apos;ll do it 👇</div>
      <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
        <span className="muted" style={{fontSize:13}}>Do this workout on:</span>
        <input className="in" type="date" value={schedDate} min={today()} onChange={e=>setSchedDate(e.target.value)} style={{width:160}}/>
        <button className="btn" onClick={addToPlan}>✅ OK — add to my plan</button>
        <button className="btn ghost sm" onClick={()=>setRep(null)}>Dismiss</button>
      </div>
      {schedMsg && <div style={{fontSize:12,marginTop:8,color:"#6ee7b7"}}>{schedMsg}</div>}
    </div>}
    <div className="card" style={{marginTop:16}}><strong>Recent {type} sessions</strong>
      <ul className="list">{LS("pos_workouts",[]).filter((w:any)=>w.type===type).slice(0,6).map((w:any)=><li className="li" key={w.id}><span className="dot" style={{background:"var(--blue)"}}/><div style={{flex:1}} className="between"><span>{w.date}</span><span className="muted">{w.volume}kg · {w.completion}% · {w.calories}kcal</span></div></li>)}
      {!LS("pos_workouts",[]).filter((w:any)=>w.type===type).length && <li className="muted" style={{padding:"8px 0"}}>No saved sessions yet.</li>}</ul>
    </div>
  </>;
}

/* ---------- today's workout (day chooser) ---------- */
function TodayWorkout({ refresh }: { refresh:()=>void }) {
  const suggestion = SCHED[new Date().getDay()];
  const [type, setType] = useState(suggestion==="Recovery" ? "Push" : suggestion);
  const [focusKey, setFocusKey] = useState((FOCUS[type]||[])[0]?.key || "all");
  const focuses = FOCUS[type] || [{ key:"all", label:"Standard", list:LIBMAP[type] }];
  const focus = focuses.find(f=>f.key===focusKey) || focuses[0];
  const chooseType = (t:string) => { setType(t); setFocusKey((FOCUS[t]||[])[0]?.key || "all"); };
  return <>
    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:12}}>
        <div>
          <strong>{new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})}</strong>
          <div className="muted" style={{fontSize:12,marginTop:2}}>Scheduled today: <b style={{color:"#E7ECF3"}}>{suggestion}</b>{suggestion==="Recovery"?" (rest / mobility / walk)":""} — pick any session, your order:</div>
        </div>
        <div className="row" style={{gap:8}}>
          {["Push","Pull","Legs"].map(t=><button key={t} className={"btn "+(type===t?"":"ghost")+" sm"} onClick={()=>chooseType(t)}>{t==="Push"?"🟦":t==="Pull"?"🟪":"🟩"} {t}</button>)}
        </div>
      </div>
      <div className="row" style={{marginTop:12,gap:10,flexWrap:"wrap"}}>
        <span className="muted" style={{fontSize:12}}>Focus:</span>
        <select className="in" value={focusKey} onChange={e=>setFocusKey(e.target.value)} style={{minWidth:240}}>
          {focuses.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
      </div>
    </div>
    <WorkoutPage key={type+"_"+focusKey} type={type} list={focus.list} refresh={refresh}/>
  </>;
}

/* ---------- Strava sync (kept SEPARATE from manual/watch data) ---------- */
const STRENGTH_RE = /(weight|workout|crossfit|strength)/i;
function importStrava(acts: any[]) {
  const store = LS("pos_strava", []); const seen = new Set(store.map((x: any) => x.id)); let added = 0;
  const woIds = LS("pos_strava_wo", []); const wo = LS("pos_workouts", []);
  acts.forEach((a: any) => {
    if (!seen.has(a.id)) { store.push(a); seen.add(a.id); added++; }
    // Count Strava strength sessions toward the workout streak / calendar (no set detail available from Strava)
    if (STRENGTH_RE.test(a.type || "") && !woIds.includes(a.id)) {
      woIds.push(a.id);
      const type = /pull/i.test(a.name) ? "Pull" : /leg/i.test(a.name) ? "Legs" : /push/i.test(a.name) ? "Push" : "Strength";
      wo.unshift({ id: uid(), date: a.date, type, duration: a.duration || 0, notes: "From Strava: " + (a.name || a.type), exercises: [], volume: 0, calories: a.cal || 0, completion: 100, source: "strava" });
    }
  });
  store.sort((x: any, y: any) => (x.date < y.date ? 1 : -1));
  SS("pos_strava", store); SS("pos_strava_wo", woIds); SS("pos_workouts", wo);
  return added;
}
function StravaCard({ refresh }: { refresh: () => void }) {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const acts = LS("pos_strava", []);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("strava");
    if (p === "connected") setMsg("✓ Strava connected — now click 'Sync now'.");
    else if (p === "noconfig") setMsg("Strava keys not set. Add STRAVA_CLIENT_ID & STRAVA_CLIENT_SECRET in Vercel → Environment Variables, then redeploy.");
    else if (p === "signin") setMsg("Please sign in first, then try Connect Strava again.");
    else if (p === "error") setMsg("Authorization failed — check the Authorization Callback Domain in your Strava API app matches your site domain.");
  }, []);
  const sync = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/strava/sync"); const d = await r.json();
      if (!d.connected) setMsg("Not connected yet — click Connect Strava, authorize, then Sync.");
      else { const n = importStrava(d.activities || []); refresh(); setMsg(n ? `Imported ${n} new Strava activit${n===1?"y":"ies"} ✓` : "Up to date — no new Strava activities."); }
    } catch (e) { setMsg("Sync failed — check your Strava setup."); }
    setBusy(false);
  };
  const del = (id: any) => { SS("pos_strava", LS("pos_strava", []).filter((x: any) => x.id !== id)); refresh(); };
  const watch = acts.filter((a: any) => a.source === "watch");
  const app = acts.filter((a: any) => a.source !== "watch");
  const grp = (title: string, list: any[]) => !list.length ? null : <div style={{ marginTop: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>{title} <span className="muted" style={{ fontWeight: 400 }}>({list.length})</span></div>
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
      <thead><tr>{["Date","Activity","Distance","Duration","Cal","Avg HR","Device",""].map(h=><th key={h} style={{ textAlign:"left", fontSize:10, textTransform:"uppercase", color:"#5b6577", padding:"6px", borderBottom:"1px solid rgba(255,255,255,.09)" }}>{h}</th>)}</tr></thead>
      <tbody>{list.slice(0,25).map((a: any)=><tr key={a.id} style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <td style={{ padding:"6px", fontSize:12 }}>{a.date}</td>
        <td style={{ padding:"6px", fontSize:12 }}>{a.type}{a.name?` · ${a.name}`:""}</td>
        <td style={{ padding:"6px", fontSize:12 }}>{a.distance||0} km</td>
        <td style={{ padding:"6px", fontSize:12 }}>{a.duration||0} min</td>
        <td style={{ padding:"6px", fontSize:12 }}>{a.cal||0}</td>
        <td style={{ padding:"6px", fontSize:12 }}>{a.avgHR||"—"}</td>
        <td style={{ padding:"6px", fontSize:11, color:"#8A94A6" }}>{a.device||"—"}</td>
        <td style={{ padding:"6px" }}><span className="btn ghost sm" style={{ cursor:"pointer" }} onClick={()=>del(a.id)}>✕</span></td>
      </tr>)}</tbody>
    </table></div>
  </div>;
  return <div className="card" style={{ marginBottom: 16 }}>
    <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><span>🔗</span><strong>Strava (auto)</strong><span className="muted" style={{ fontSize: 11 }}>split by source — kept separate from your manual logs</span></div>
      <div className="row" style={{ gap: 8 }}>
        <a className="btn ghost sm" href="/api/strava/connect">Connect Strava</a>
        <button className="btn ghost sm" onClick={()=>{ SS("pos_strava", []); refresh(); setMsg("Cleared. Click 'Sync now' to re-import with the watch/app split."); }}>Clear</button>
        <button className="btn sm" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync now"}</button>
      </div>
    </div>
    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg || "Connect once, then Sync. Activities are split into ⌚ Fitbit watch vs 📱 Strava-app recordings so your watch data and manual recordings stay separate."}</div>
    {grp("⌚ Fitbit / watch", watch)}
    {grp("📱 Strava app (manual recordings)", app)}
  </div>;
}

/* ---------- Strava tab (Watch vs App sub-tabs + charts) ---------- */
function StravaView({ refresh, appOnly }: { refresh: () => void; appOnly?: boolean }) {
  const [src, setSrc] = useState<"watch"|"app">(appOnly ? "app" : "watch");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("strava");
    if (p === "connected") setMsg("✓ Connected — click Sync now.");
    else if (p === "noconfig") setMsg("Strava keys not set in Vercel (STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET).");
    else if (p === "error") setMsg("Authorization failed — check the callback domain in your Strava app.");
    else if (p === "signin") setMsg("Please sign in first.");
  }, []);
  const sync = async () => { setBusy(true); setMsg("");
    try { const r = await fetch("/api/strava/sync"); const d = await r.json();
      if (!d.connected) setMsg("Not connected — click Connect.");
      else { const n = importStrava(d.activities || []); refresh(); setMsg(n ? `Imported ${n} new ✓` : "Up to date."); }
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  const all = LS("pos_strava", []);
  const acts = all.filter((a: any) => src === "watch" ? a.source === "watch" : a.source !== "watch");
  const totKm = Math.round(acts.reduce((s: number, a: any) => s + (+a.distance||0), 0) * 10) / 10;
  const totMin = acts.reduce((s: number, a: any) => s + (+a.duration||0), 0);
  const hrList = acts.filter((a: any) => a.avgHR);
  const avgHR = hrList.length ? Math.round(hrList.reduce((s: number, a: any) => s + (+a.avgHR||0), 0) / hrList.length) : 0;
  const daily = (() => { const o: any[] = []; for (let i=13;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const v=acts.filter((a: any)=>a.date===ds).reduce((s: number,a: any)=>s+(+a.distance||0),0); o.push({name:String(d.getDate()),value:Math.round(v*10)/10}); } return o; })();
  const weekly = (() => { const o: any[] = []; for (let w=7;w>=0;w--){ let s=0; for(let dd=0;dd<7;dd++){ const dt=new Date(); dt.setDate(dt.getDate()-(w*7+dd)); const ds=dstr(dt); s+=acts.filter((a: any)=>a.date===ds).reduce((x: number,a: any)=>x+(+a.distance||0),0);} o.push({name:w===0?"This":w+"w",value:Math.round(s*10)/10}); } return o; })();
  const hrTrend = acts.filter((a: any)=>a.avgHR).slice(0,12).reverse().map((a: any)=>({name:(a.date||"").slice(5),value:+a.avgHR}));
  const speed = acts.filter((a: any)=>a.distance&&a.duration).slice(0,12).reverse().map((a: any)=>({name:(a.date||"").slice(5),value:Math.round((a.distance/(a.duration/60))*10)/10}));
  const del = (id: any) => { SS("pos_strava", LS("pos_strava", []).filter((x: any)=>x.id!==id)); refresh(); };
  return <>
    <div className="head"><h1>🔗 Strava</h1><p>{appOnly?"Strava-app recordings only — your Fitbit watch data lives in the Google Health tab.":"Synced activities."}</p></div>
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          {!appOnly && <button className={"btn " + (src==="watch"?"":"ghost") + " sm"} onClick={()=>setSrc("watch")}>⌚ Fitbit / Watch</button>}
          {!appOnly && <button className={"btn " + (src==="app"?"":"ghost") + " sm"} onClick={()=>setSrc("app")}>📱 Strava App</button>}
          {appOnly && <span className="row" style={{gap:8}}><span>📱</span><strong>Strava App</strong></span>}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn ghost sm" href="/api/strava/connect">Connect</a>
          <button className="btn ghost sm" onClick={()=>{ SS("pos_strava", []); refresh(); setMsg("Cleared. Click Sync now."); }}>Clear</button>
          <button className="btn sm" onClick={sync} disabled={busy}>{busy?"Syncing…":"Sync now"}</button>
        </div>
      </div>
      {msg && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg}</div>}
    </div>
    <div className="grid g4">
      <div className="card kpi"><div className="lbl">Distance</div><div className="val">{totKm}<small> km</small></div></div>
      <div className="card kpi"><div className="lbl">Time</div><div className="val">{Math.floor(totMin/60)}<small>h </small>{totMin%60}<small>m</small></div></div>
      <div className="card kpi"><div className="lbl">Avg Heart Rate</div><div className="val">{avgHR||"—"}<small> bpm</small></div></div>
      <div className="card kpi"><div className="lbl">Activities</div><div className="val">{acts.length}</div></div>
    </div>
    <div className="grid g2" style={{ marginTop: 16 }}>
      <BarC title="Daily distance (km, 14d)" color="#F59E0B" data={daily}/>
      <BarC title="Weekly distance (km, 8w)" color="#10B981" data={weekly}/>
      <LineC title="Avg heart rate (recent)" color="#EC4899" data={hrTrend}/>
      <BarC title="Avg speed (km/h, recent)" color="#3B82F6" data={speed}/>
    </div>
    <div className="card" style={{ marginTop: 16 }}><strong>{src==="watch"?"⌚ Watch":"📱 App"} activities</strong>
      <div style={{ overflowX:"auto", marginTop:8 }}><table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
        <thead><tr>{["Date","Activity","Distance","Duration","Pace","Speed","Avg HR","Device",""].map(h=><th key={h} style={{ textAlign:"left", fontSize:10, textTransform:"uppercase", color:"#5b6577", padding:"6px", borderBottom:"1px solid rgba(255,255,255,.09)" }}>{h}</th>)}</tr></thead>
        <tbody>{acts.length ? acts.slice(0,40).map((a: any)=>{ const pace=(a.distance&&a.duration)?(a.duration/a.distance).toFixed(1)+" min/km":"—"; const spd=(a.distance&&a.duration)?Math.round((a.distance/(a.duration/60))*10)/10+" km/h":"—"; return <tr key={a.id} style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <td style={{padding:"6px",fontSize:12}}>{a.date}</td><td style={{padding:"6px",fontSize:12}}>{a.type}{a.name?" · "+a.name:""}</td><td style={{padding:"6px",fontSize:12}}>{a.distance||0} km</td><td style={{padding:"6px",fontSize:12}}>{a.duration||0} min</td><td style={{padding:"6px",fontSize:12}}>{pace}</td><td style={{padding:"6px",fontSize:12}}>{spd}</td><td style={{padding:"6px",fontSize:12}}>{a.avgHR||"—"}</td><td style={{padding:"6px",fontSize:11,color:"#8A94A6"}}>{a.device||"—"}</td><td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(a.id)}>✕</span></td>
        </tr>; }) : <tr><td colSpan={9} className="muted" style={{padding:"10px 6px"}}>No {src==="watch"?"watch":"app"} activities yet — click Sync now.</td></tr>}</tbody>
      </table></div>
    </div>
  </>;
}

/* ---------- Fitbit via Google Health API (steps) ---------- */
function GoogleHealthCard({ refresh }: { refresh: () => void }) {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ghealth");
    if (p === "connected") setMsg("✓ Google Health connected — click 'Sync steps'.");
    else if (p === "noconfig") setMsg("Google Health keys not set in Vercel (GHEALTH_CLIENT_ID / GHEALTH_CLIENT_SECRET).");
    else if (p === "error") setMsg("Google Health authorization failed — check the callback URL in that project's OAuth client.");
    else if (p === "signin") setMsg("Please sign in first.");
  }, []);
  const doSync = async (debug:boolean) => { setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/ghealth/steps" + (debug?"?debug=1":"")); const d = await r.json();
      if (d.ok) {
        const h = LS("pos_health", {});
        h.steps = d.steps; h.distance = d.distance; h.caloriesBurned = d.calories; h.azm = d.activeMin; h.floors = d.floors;
        if (d.restingHR) h.restingHR = d.restingHR; if (d.avgHR) h.hrAvg = d.avgHR; if (d.maxHR) h.hrMax = d.maxHR; if (d.minHR) h.hrMin = d.minHR; if (d.sleepH) h.sleepH = d.sleepH;
        SS("pos_health", h);
        const hist = LS("pos_ghealth", []); const i = hist.findIndex((x:any)=>x.date===d.date);
        const rec = { date: d.date, steps:d.steps, distance:d.distance, cal:d.calories, activeMin:d.activeMin, floors:d.floors, restingHR:d.restingHR, avgHR:d.avgHR, maxHR:d.maxHR, minHR:d.minHR, sleepH:d.sleepH };
        if (i>=0) hist[i]=rec; else hist.push(rec); hist.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_ghealth", hist);
        if (d.sleepH) { const sl=LS("pos_sleep",[]); const si=sl.findIndex((x:any)=>x.date===d.date); const sr={date:d.date,total:d.sleepH,source:"watch"}; if(si>=0) sl[si]={...sl[si],...sr}; else sl.push(sr); sl.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_sleep",sl); }
        // pull recorded activities (walks/runs/workouts) and merge, keeping AI/manual entries
        let actMsg = ""; let actDbg: any = null;
        try {
          const ar = await fetch("/api/ghealth/activities?days=180" + (debug?"&debug=1":"")); const ad = await ar.json();
          if (ad.ok && Array.isArray(ad.activities)) {
            const existing = LS("pos_gh_acts", []);
            const byId: any = {}; existing.forEach((x:any)=>byId[x.id]=x);
            ad.activities.forEach((a:any)=>{ byId[a.id] = { ...byId[a.id], ...a }; });
            let merged: any[] = Object.values(byId);
            // purge stale rows from older buggy syncs (type stored as a resource path)
            merged = merged.filter((x:any)=> !(typeof x.type==="string" && x.type.includes("/")));
            // dedupe watch activities that describe the same session
            const fp: any = {}; merged = merged.filter((x:any)=>{ if(x.source!=="watch") return true; const k=`${x.date}_${x.distance}_${x.duration}`; if(fp[k]) return false; fp[k]=1; return true; });
            merged.sort((a:any,b:any)=>a.date<b.date?1:-1);
            SS("pos_gh_acts", merged);
            actMsg = ` · ${ad.activities.length} watch activit${ad.activities.length===1?"y":"ies"}`;
            actDbg = ad.debug;
          } else if (ad.error) actMsg = ` · activities: ${ad.error}`;
        } catch (e) {}
        // pull last-15-days steps history into the daily store
        let rangeDbg: any = null;
        try {
          const rr = await fetch("/api/ghealth/range?days=90" + (debug?"&debug=1":"")); const rd = await rr.json();
          if (rd.ok && Array.isArray(rd.rows)) {
            const hist = LS("pos_ghealth", []); const idx: any = {}; hist.forEach((x:any,i:number)=>idx[x.date]=i);
            rd.rows.forEach((row:any)=>{ if(idx[row.date]!=null) hist[idx[row.date]] = { ...hist[idx[row.date]], ...row }; else hist.push(row); });
            hist.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_ghealth", hist);
            rangeDbg = rd.debug || { rows: rd.rows.length };
          } else if (rd.error) rangeDbg = { error: rd.error };
        } catch (e) {}
        // retention: keep a rolling 180-day health database
        try {
          const cut = new Date(); cut.setDate(cut.getDate()-180); const cutoff = dstr(cut);
          ["pos_ghealth","pos_gh_acts","pos_sleep"].forEach((k)=>{ const arr=LS(k,[]); if(Array.isArray(arr)) SS(k, arr.filter((x:any)=>(x.date||"")>=cutoff)); });
        } catch (e) {}
        refresh();
        if (debug) setMsg((m)=>m+"\n\nRANGE(15d): "+JSON.stringify(rangeDbg));
        setMsg(`Synced ✓ ${d.steps} steps · ${d.distance||0}km · ${d.calories||0}kcal · ${d.activeMin||0} AZ min${d.avgHR?` · HR ${d.minHR}/${d.avgHR}/${d.maxHR}`:""}${d.restingHR?` · RHR ${d.restingHR}`:""}${d.sleepH?` · ${d.sleepH}h sleep`:""}${actMsg}` + (debug?"\n\nDAILY: "+JSON.stringify(d.debug)+"\n\nACTIVITIES: "+JSON.stringify(actDbg):""));
      }
      else if (d.connected === false) setMsg("Not connected — click 'Connect Google Health' first.");
      else setMsg("Google Health error" + (d.code ? ` [${d.code}]` : "") + ": " + (d.error || JSON.stringify(d)));
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  const sync = () => doSync(false);
  return <div className="card" style={{ marginBottom: 16 }}>
    <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><span>⌚</span><strong>Fitbit · Google Health</strong><span className="muted" style={{ fontSize: 11 }}>steps · distance · calories · active min · heart rate · sleep — from your watch</span></div>
      <div className="row" style={{ gap: 8 }}>
        <a className="btn ghost sm" href="/api/ghealth/connect">Connect Google Health</a>
        <button className="btn sm" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync from watch"}</button>
      </div>
    </div>
    <div className="muted" style={{ fontSize: 12, marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg || "Connect once (separate from your Gmail login), then Sync to pull today's watch data. Fitbit must be linked to that Google account."}</div>
    <div style={{ marginTop: 6 }}><span className="muted" style={{ fontSize: 10, cursor: "pointer", textDecoration: "underline" }} onClick={()=>doSync(true)}>Debug (show raw watch data)</span></div>
  </div>;
}

/* ---------- Fitbit Web API (legacy, unused) ---------- */
function FitbitCard({ refresh }: { refresh: () => void }) {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("fitbit");
    if (p === "connected") setMsg("✓ Fitbit connected — click 'Sync steps'.");
    else if (p === "noconfig") setMsg("Fitbit keys not set in Vercel (FITBIT_CLIENT_ID / FITBIT_CLIENT_SECRET).");
    else if (p === "error") setMsg("Fitbit authorization failed — check the Redirect URL in your Fitbit app.");
    else if (p === "signin") setMsg("Please sign in first.");
  }, []);
  const sync = async () => { setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/fitbit/sync"); const d = await r.json();
      if (!d.connected) setMsg("Not connected — click Connect Fitbit.");
      else { const h = LS("pos_health", {}); h.steps = d.steps; h.distance = d.distance; h.azm = d.activeMin; h.caloriesBurned = d.cal; if (d.restingHR) h.restingHR = d.restingHR; SS("pos_health", h); refresh();
        setMsg(`Synced ✓ ${d.steps} steps · ${d.distance} km · ${d.activeMin} active min${d.restingHR ? ` · RHR ${d.restingHR}` : ""}`); }
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  return <div className="card" style={{ marginBottom: 16 }}>
    <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><span>⌚</span><strong>Fitbit</strong><span className="muted" style={{ fontSize: 11 }}>steps &amp; daily activity, straight from your watch</span></div>
      <div className="row" style={{ gap: 8 }}>
        <a className="btn ghost sm" href="/api/fitbit/connect">Connect Fitbit</a>
        <button className="btn sm" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync steps"}</button>
      </div>
    </div>
    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg || "Connect once, then Sync to auto-fill today's steps, distance, active minutes, calories & resting HR."}</div>
  </div>;
}

/* ================= EXECUTIVE HEALTH DASHBOARD ================= */
const clamp = (v:number,a=0,b=100)=>Math.max(a,Math.min(b,isFinite(v)?v:0));
const r0 = (v:number)=>Math.round(v||0);
const r1 = (v:number)=>Math.round((v||0)*10)/10;
const pctOf = (a:number,b:number)=> b>0 ? clamp(Math.round(a/b*100)) : 0;
const withinDays = (ds:string,n:number)=>{ if(!ds) return false; const diff=(Date.now()-new Date(ds).getTime())/86400000; return diff>=-1 && diff<n; };
function settOf(){ return { name:"Mohit", age:36, heightFt:6, heightIn:1, weightGoal:87, calorieGoal:2350, proteinGoal:180, carbGoal:250, fatGoal:70, fiberGoal:35, waterGoal:3.5, stepGoal:9000, ...LS("pos_settings",{}) }; }
function heightCm(s:any){ return Math.round(((+s.heightFt||0)*12+(+s.heightIn||0))*2.54); }
function bmrOf(s:any,kg:number){ const cm=heightCm(s); return Math.round(10*kg+6.25*cm-5*(+s.age||30)+5); }
function nutOf(d:string){ const n=LS("pos_nutri_"+d,{meals:[],water:0}); const t={cal:0,protein:0,carbs:0,fat:0,fiber:0,water:+n.water||0}; (n.meals||[]).forEach((m:any)=>{t.cal+=+m.cal||0;t.protein+=+m.protein||0;t.carbs+=+m.carbs||0;t.fat+=+m.fat||0;t.fiber+=+m.fiber||0;}); return t; }
function weightSeries(){ return LS("pos_weightlog",[]).filter((x:any)=>+x.weight).map((x:any)=>({date:x.date,w:+x.weight,bf:+x.bodyfat||0,mu:+x.muscle||0,waist:+x.waist||0})).sort((a:any,b:any)=>a.date<b.date?-1:1); }
function dayExCal(d:string){ const w=LS("pos_walks",[]).filter((x:any)=>x.date===d).reduce((a:number,x:any)=>a+(+x.cal||0),0); const c=LS("pos_cardio",[]).filter((x:any)=>x.date===d).reduce((a:number,x:any)=>a+(+x.cal||0),0); const g=LS("pos_workouts",[]).filter((x:any)=>x.date===d).reduce((a:number,x:any)=>a+(+x.calories||0),0); return w+c+g; }
/* watch (Google Health) daily history helpers */
function ghByDay(field:string,n:number){ const rows=LS("pos_ghealth",[]); const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=rows.find((x:any)=>x.date===ds); out.push({name:n<=7?DOW[d.getDay()]:String(d.getDate()),value:g?Math.round((+g[field]||0)*10)/10:0}); } return out; }
function ghSum(field:string,n:number){ return ghByDay(field,n).reduce((a,x)=>a+x.value,0); }
function ghToday(field:string){ const g=LS("pos_ghealth",[]).find((x:any)=>x.date===today()); return g?+g[field]||0:0; }

function Gauge({ value, label, color, size=150, suffix="" }: any){
  const v=clamp(value); const r=(size-18)/2; const c=2*Math.PI*r; const off=c*(1-v/100); const cx=size/2;
  return <div style={{textAlign:"center"}}><svg width={size} height={size}>
    <circle cx={cx} cy={cx} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={13} fill="none"/>
    <circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={13} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cx})`}/>
    <text x="50%" y="47%" textAnchor="middle" fontSize={size*0.27} fontWeight="800" fill="#E7ECF3">{Math.round(v)}{suffix}</text>
    <text x="50%" y="65%" textAnchor="middle" fontSize="11" fill="#8A94A6">{label}</text>
  </svg></div>;
}
function Stat({ label, value, unit, sub, tint="blue" }: any){
  return <div className="card kpi"><div className="between"><div className="lbl">{label}</div>{tint&&<div className={"ic-chip tint-"+tint} style={{width:26,height:26,fontSize:11}} />}</div>
    <div className="val" style={{fontSize:23}}>{value}{unit&&<small> {unit}</small>}</div>{sub&&<div className="muted" style={{fontSize:11,marginTop:4}}>{sub}</div>}</div>;
}
function Sec({ t, s }: any){ return <div style={{margin:"26px 0 12px"}}><h2 style={{fontSize:17,fontWeight:720,margin:0}}>{t}</h2>{s&&<div className="muted" style={{fontSize:12,marginTop:3}}>{s}</div>}</div>; }
function ProgRow({ label, pct, color }: any){ return <div style={{marginBottom:12}}><div className="between" style={{fontSize:12,marginBottom:5}}><span className="muted">{label}</span><b>{pct}%</b></div>
  <div style={{height:8,borderRadius:6,background:"rgba(255,255,255,.08)",overflow:"hidden"}}><div style={{height:"100%",width:clamp(pct)+"%",background:color,borderRadius:6}}/></div></div>; }

function SleepQuickAdd({ refresh }: { refresh:()=>void }){
  const [f,setF]=useState<any>({date:today()});
  const save=()=>{ if(!(+f.total)){ alert("Enter total sleep hours"); return; } const all=LS("pos_sleep",[]); const i=all.findIndex((x:any)=>x.date===f.date);
    const rec={date:f.date,total:+f.total||0,deep:+f.deep||0,rem:+f.rem||0,light:+f.light||0,awake:+f.awake||0,efficiency:+f.efficiency||0,bedtime:f.bedtime||"",wake:f.wake||""};
    if(i>=0) all[i]=rec; else all.push(rec); all.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_sleep",all); setF({date:today()}); refresh(); };
  return <div className="card" style={{marginTop:12}}><div className="row" style={{gap:8,flexWrap:"wrap"}}>
    <input className="in" type="date" value={f.date} onChange={e=>setF((s:any)=>({...s,date:e.target.value}))} style={{width:150}}/>
    <input className="in" type="number" placeholder="Total h" value={f.total??""} onChange={e=>setF((s:any)=>({...s,total:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Deep h" value={f.deep??""} onChange={e=>setF((s:any)=>({...s,deep:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="REM h" value={f.rem??""} onChange={e=>setF((s:any)=>({...s,rem:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Light h" value={f.light??""} onChange={e=>setF((s:any)=>({...s,light:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Efficiency %" value={f.efficiency??""} onChange={e=>setF((s:any)=>({...s,efficiency:e.target.value}))} style={{width:120}}/>
    <button className="btn sm" onClick={save}>Log sleep</button>
  </div></div>;
}

function ExecDash({ refresh }: { refresh: () => void }){
  const s=settOf();
  const H=LS("pos_health",{});
  const wl=weightSeries();
  const curW = wl.length? wl[wl.length-1].w : curWeight();
  const startW = wl.length? wl[0].w : curW;
  const goalW = +s.weightGoal||87;
  const lost = r1(startW-curW);
  const remain = r1(curW-goalW);
  const totalToLose = Math.max(0.1, startW-goalW);
  let weeklyRate=0;
  if(wl.length>=2){ const days=Math.max(1,(new Date(wl[wl.length-1].date).getTime()-new Date(wl[0].date).getTime())/86400000); weeklyRate=r1((startW-curW)/days*7); }
  const monthlyRate=r1(weeklyRate*4.345);
  const weeksToGoal = weeklyRate>0.05 && remain>0 ? remain/weeklyRate : null;
  const goalDate = weeksToGoal? new Date(Date.now()+weeksToGoal*7*86400000) : null;
  const projW=(wk:number)=> weeklyRate>0 ? r1(Math.max(goalW,curW-weeklyRate*wk)) : curW;

  // activity
  const walksToday=LS("pos_walks",[]).filter((x:any)=>x.date===today());
  const cardioToday=LS("pos_cardio",[]).filter((x:any)=>x.date===today());
  const woToday=LS("pos_workouts",[]).filter((x:any)=>x.date===today());
  // activity — Google Health (watch) only
  const stepsToday=r0(ghToday("steps")|| +H.steps||0);
  const wkAvgSteps=r0(ghSum("steps",7)/7);
  const moAvgSteps=r0(ghSum("steps",30)/30);
  const distToday=r1(ghToday("distance")|| +H.distance||0);
  const activeMin=r0(ghToday("activeMin")|| +H.azm||0);
  const floors=r0(ghToday("floors")|| +H.floors||0);
  const calBurn=r0(ghToday("cal")|| +H.caloriesBurned||0);

  // exercise
  const allWo=LS("pos_workouts",[]); const allCardio=LS("pos_cardio",[]); const allStrava=LS("pos_strava",[]);
  const totalWorkouts=allWo.length;
  const woWk=allWo.filter((w:any)=>withinDays(w.date,7));
  const woThisWeek=woWk.length;
  const woDurWk=r0(woWk.reduce((a:number,w:any)=>a+(+w.duration||0),0));
  const woCalWk=r0(woWk.reduce((a:number,w:any)=>a+(+w.calories||0),0));
  const gymSessions30=allWo.filter((w:any)=>withinDays(w.date,30)).length;
  const typeMap:Record<string,number>={};
  allWo.forEach((w:any)=>{ const k=w.type||"Gym"; typeMap[k]=(typeMap[k]||0)+1; });
  allCardio.forEach((c:any)=>{ const k=c.activity||"Cardio"; typeMap[k]=(typeMap[k]||0)+1; });
  allStrava.forEach((a:any)=>{ const k=a.type||"Activity"; typeMap[k]=(typeMap[k]||0)+1; });
  const typeBreak=Object.keys(typeMap).map(k=>({name:k,value:typeMap[k]}));
  const consistency=pctOf(woThisWeek,5);

  // heart
  const hrPool=[...allCardio,...allStrava].filter((a:any)=>+a.avgHR);
  const avgHR=hrPool.length? r0(hrPool.reduce((a:number,x:any)=>a+(+x.avgHR||0),0)/hrPool.length):0;
  const maxHR=Math.max(0,...[...allCardio,...allStrava].map((a:any)=>+a.maxHR||0));
  const rhr=+H.restingHR||0;
  const vo2=(rhr&&maxHR)? r1(15.3*(maxHR/rhr)) : (+H.vo2||0);
  const cardioScore=vo2? clamp(r0((vo2-20)/40*100)) : 0;

  // sleep
  const sleep=LS("pos_sleep",[]).slice().sort((a:any,b:any)=>a.date<b.date?-1:1);
  const slLast=sleep[sleep.length-1]||{};
  const slAvg=sleep.length? r1(sleep.slice(-7).reduce((a:number,x:any)=>a+(+x.total||0),0)/Math.min(7,sleep.length)):0;
  const slEff=+slLast.efficiency||0;

  // body comp
  const last=wl[wl.length-1]||{}; const bmi=curW? r1(curW/Math.pow(heightCm(s)/100,2)):0;
  const bodyFat=+last.bf||0; const muscle=+last.mu||0; const waist=+last.waist||0;
  const leanMass=bodyFat? r1(curW*(1-bodyFat/100)):0;

  // nutrition today
  const nt=nutOf(today());
  const tdee=r0(bmrOf(s,curW)*1.2+calBurn);
  const deficit=r0(tdee-nt.cal);

  // performance %
  const stepPct=pctOf(stepsToday,s.stepGoal);
  const proteinPct=pctOf(nt.protein,s.proteinGoal);
  const waterPct=pctOf(nt.water,s.waterGoal);
  const sleepPct=pctOf(+slLast.total||slAvg,8);
  const workoutWkPct=pctOf(woThisWeek,5);
  const weightProgPct=pctOf(lost,totalToLose);
  let daysActive=0; for(let i=0;i<30;i++){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); if(allWo.some((w:any)=>w.date===ds)||LS("pos_walks",[]).some((x:any)=>x.date===ds)||allCardio.some((x:any)=>x.date===ds)) daysActive++; }
  const monthlyConsistency=pctOf(daysActive,30);
  const gymPct=pctOf(gymSessions30,20);

  // scores
  const scoreParts=[{v:stepPct,w:1},{v:workoutWkPct,w:1.2},{v:proteinPct,w:1},{v:waterPct,w:.8},{v:weightProgPct,w:1},...(sleep.length?[{v:sleepPct,w:1}]:[])];
  const healthScore=r0(scoreParts.reduce((a,x)=>a+x.v*x.w,0)/scoreParts.reduce((a,x)=>a+x.w,0));
  const dailyGoal=r0((stepPct+proteinPct+waterPct+(woToday.length?100:0))/4);
  const wellness = healthScore>=85?"Excellent":healthScore>=70?"Good":healthScore>=50?"Fair":"Poor";
  const wellTint = healthScore>=85?"emerald":healthScore>=70?"blue":healthScore>=50?"orange":"pink";

  // charts
  const stepChart=ghByDay("steps",7);
  const weightChart=wl.slice(-30).map((x:any)=>({name:(x.date||"").slice(5),value:x.w}));
  const sleepChart=sleep.slice(-14).map((x:any)=>({name:(x.date||"").slice(5),value:+x.total||0}));
  const hrChart=ghByDay("restingHR",14).filter((x:any)=>x.value>0);
  const woFreq=(()=>{ const o:any[]=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); o.push({name:DOW[d.getDay()],value:allWo.filter((w:any)=>w.date===ds).length+allCardio.filter((c:any)=>c.date===ds).length}); } return o; })();
  const proteinChart=(()=>{ const o:any[]=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); o.push({name:DOW[d.getDay()],value:nutOf(ds).protein}); } return o; })();
  const deficitChart=(()=>{ const o:any[]=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const consumed=nutOf(ds).cal; const td=bmrOf(s,curW)*1.2+dayExCal(ds); o.push({name:DOW[d.getDay()],value: consumed? r0(td-consumed):0}); } return o; })();
  const macro=[{name:"Protein",value:nt.protein},{name:"Carbs",value:nt.carbs},{name:"Fat",value:nt.fat}];

  // insights
  type Ins={t:string;k:"good"|"warn"|"risk"};
  const ins:Ins[]=[];
  if(stepPct>=100) ins.push({t:`Step goal smashed — ${stepsToday.toLocaleString()} steps today.`,k:"good"});
  else ins.push({t:`Walk ${Math.max(0,s.stepGoal-stepsToday).toLocaleString()} more steps to hit your ${(+s.stepGoal).toLocaleString()} goal.`,k:"warn"});
  if(woThisWeek>=4) ins.push({t:`Excellent training consistency — ${woThisWeek} sessions this week.`,k:"good"});
  else if(woThisWeek<=1) ins.push({t:`Only ${woThisWeek} workout this week — aim for 4–5 to stay on plan.`,k:"warn"});
  if(nt.protein && nt.protein < s.proteinGoal*0.8) ins.push({t:`Protein is ${nt.protein}g today — add ~${Math.round(s.proteinGoal-nt.protein)}g to reach ${s.proteinGoal}g.`,k:"warn"});
  if(nt.water && nt.water < s.waterGoal) ins.push({t:`Hydration ${nt.water}L — drink ${Math.round((s.waterGoal-nt.water)*1000)}ml more.`,k:"warn"});
  if(sleep.length && (+slLast.total||slAvg) < 7) ins.push({t:`Sleep ${(+slLast.total||slAvg)}h is below the 7–8h target — protect recovery.`,k:"warn"});
  if(weeklyRate>0.9) ins.push({t:`Weight loss is fast at ${weeklyRate}kg/week — ease toward a sustainable ~0.7kg/wk to keep muscle.`,k:"risk"});
  else if(weeklyRate>0.1) ins.push({t:`Weight trending down ${weeklyRate}kg/week — right on schedule.`,k:"good"});
  if(goalDate) ins.push({t:`At this pace you'll reach ${goalW}kg around ${goalDate.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}.`,k:"good"});
  if(rhr && rhr>75) ins.push({t:`Resting HR ${rhr}bpm is a little high — prioritise sleep, hydration and easy cardio.`,k:"risk"});
  const topIns=ins.slice(0,6);

  const risks:string[]=[];
  if(sleep.length && (+slLast.total||slAvg)<6.5) risks.push("Chronic short sleep (<6.5h)");
  if(rhr>78) risks.push("Elevated resting heart rate");
  if(deficit>1100) risks.push("Very aggressive calorie deficit");
  if(nt.protein && nt.protein<s.proteinGoal*0.6) risks.push("Persistently low protein");
  if(bmi>=30) risks.push("BMI in obese range");

  const iconFor=(k:string)=> k==="good"?"✅":k==="risk"?"⚠️":"🔸";
  const tintFor=(k:string)=> k==="good"?"emerald":k==="risk"?"pink":"orange";

  return <>
    <div className="head"><h1>🩺 Executive Health Dashboard</h1><p>Steps · distance · calories · active minutes · heart rate · sleep pulled from your watch (Google Health). Weight &amp; workouts from your logs. · {new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</p></div>
    <GoogleHealthCard refresh={refresh}/>

    {/* executive summary */}
    <div className="card" style={{marginBottom:16}}>
      <div className="grid g3" style={{alignItems:"center"}}>
        <div className="row" style={{justifyContent:"center",gap:18,flexWrap:"wrap"}}>
          <Gauge value={healthScore} label="Health Score" color="#10B981"/>
          <div><div className="lbl muted" style={{fontSize:12}}>Wellness Status</div>
            <div className="val" style={{fontSize:26}}><span className={"ic-chip tint-"+wellTint} style={{display:"inline-flex",width:14,height:14,marginRight:8,verticalAlign:"middle"}}/>{wellness}</div>
            <div className="muted" style={{fontSize:12,marginTop:8}}>Daily goals {dailyGoal}% complete</div>
          </div>
        </div>
        <div style={{textAlign:"center"}}><Gauge value={weightProgPct} label="Weight Goal" color="#06B6D4" suffix="%"/>
          <div className="muted" style={{fontSize:12,marginTop:4}}>{curW}→{goalW}kg · {remain>0?remain+"kg to go":"goal reached 🎉"}</div></div>
        <div style={{textAlign:"center"}}><Gauge value={dailyGoal} label="Today's Goals" color="#A855F7" suffix="%"/>
          <div className="muted" style={{fontSize:12,marginTop:4}}>{stepsToday.toLocaleString()} steps · {calBurn} kcal · {activeMin} min</div></div>
      </div>
    </div>

    {/* top AI insights + risks */}
    <div className="grid g2">
      <div className="card"><strong>✨ Top AI Insights</strong>
        <ul className="list" style={{marginTop:6}}>{topIns.map((x,i)=><li className="li" key={i} style={{alignItems:"flex-start"}}><span>{iconFor(x.k)}</span><span style={{flex:1,fontSize:13,lineHeight:1.5}}>{x.t}</span></li>)}</ul>
      </div>
      <div className="card"><strong>⚠️ Key Risk Indicators</strong>
        {risks.length? <ul className="list" style={{marginTop:6}}>{risks.map((r,i)=><li className="li" key={i}><span className="dot" style={{background:"#f9a8d4"}}/><span style={{fontSize:13}}>{r}</span></li>)}</ul>
          : <div className="muted" style={{fontSize:13,marginTop:10}}>No red flags detected — recovery, heart rate, protein and deficit all within healthy ranges. Keep it up. 💪</div>}
        <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}><div className="muted" style={{fontSize:11,marginBottom:8}}>Improvement opportunities</div>
          <div className="row" style={{flexWrap:"wrap",gap:8}}>
            {stepPct<100&&<span className="in" style={{fontSize:11,padding:"4px 9px"}}>+{Math.max(0,s.stepGoal-stepsToday).toLocaleString()} steps</span>}
            {proteinPct<100&&<span className="in" style={{fontSize:11,padding:"4px 9px"}}>+{Math.max(0,Math.round(s.proteinGoal-nt.protein))}g protein</span>}
            {waterPct<100&&<span className="in" style={{fontSize:11,padding:"4px 9px"}}>+{Math.max(0,Math.round((s.waterGoal-nt.water)*1000))}ml water</span>}
            {workoutWkPct<100&&<span className="in" style={{fontSize:11,padding:"4px 9px"}}>+{Math.max(0,5-woThisWeek)} workouts</span>}
            {sleep.length>0&&sleepPct<100&&<span className="in" style={{fontSize:11,padding:"4px 9px"}}>+{r1(Math.max(0,8-(+slLast.total||slAvg)))}h sleep</span>}
          </div>
        </div>
      </div>
    </div>

    {/* activity */}
    <Sec t="🏃 Activity Analytics" s="Steps, distance, active minutes and burn — today vs your averages"/>
    <div className="grid g4">
      <Stat label="Daily Steps" value={stepsToday.toLocaleString()} sub={`Goal ${(+s.stepGoal).toLocaleString()} · ${stepPct}%`} tint="emerald"/>
      <Stat label="Weekly Avg Steps" value={wkAvgSteps.toLocaleString()} tint="emerald"/>
      <Stat label="Monthly Avg Steps" value={moAvgSteps.toLocaleString()} tint="emerald"/>
      <Stat label="Distance" value={distToday} unit="km" tint="cyan"/>
      <Stat label="Active Minutes" value={activeMin} unit="min" tint="blue"/>
      <Stat label="Move Minutes" value={activeMin} unit="min" tint="blue"/>
      <Stat label="Floors Climbed" value={floors||"—"} tint="orange"/>
      <Stat label="Calories Burned" value={calBurn.toLocaleString()} unit="kcal" tint="orange"/>
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      <BarC title="Daily Steps (7d)" color="#10B981" data={stepChart}/>
      <BarC title="Calories Burned (7d)" color="#F59E0B" data={ghByDay("cal",7)}/>
      <BarC title="Active Minutes (7d)" color="#3B82F6" data={ghByDay("activeMin",7)}/>
    </div>

    {/* exercise */}
    <Sec t="🏋️ Exercise Analytics" s="Training volume, frequency and type mix"/>
    <div className="grid g4">
      <Stat label="Total Workouts" value={totalWorkouts} tint="purple"/>
      <Stat label="This Week" value={woThisWeek} unit="sessions" tint="purple"/>
      <Stat label="Duration (7d)" value={woDurWk} unit="min" tint="indigo"/>
      <Stat label="Workout Cal (7d)" value={woCalWk.toLocaleString()} unit="kcal" tint="orange"/>
      <Stat label="Gym Attendance" value={gymPct} unit="%" sub={`${gymSessions30}/20 in 30d`} tint="violet"/>
      <Stat label="Consistency Score" value={consistency} unit="%" tint="emerald"/>
      <Stat label="Monthly Consistency" value={monthlyConsistency} unit="%" sub={`${daysActive}/30 active days`} tint="blue"/>
      <Stat label="Weekly Frequency" value={woThisWeek} unit="/wk" tint="pink"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <BarC title="Workout Frequency (7d)" color="#A855F7" data={woFreq}/>
      <PieC title="Exercise Type Breakdown" data={typeBreak.length?typeBreak:[{name:"No sessions",value:0}]}/>
    </div>

    {/* heart */}
    <Sec t="❤️ Heart & Cardio Health" s="Resting/working heart rate and cardio fitness"/>
    <div className="grid g4">
      <Stat label="Resting HR" value={rhr||"—"} unit="bpm" tint="pink"/>
      <Stat label="Average HR" value={avgHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="Max HR" value={maxHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="VO₂ Max (est)" value={vo2||"—"} tint="emerald"/>
      <Stat label="Cardio Fitness" value={cardioScore||"—"} unit="/100" tint="emerald"/>
      <Stat label="Workout HR" value={avgHR||"—"} unit="bpm" tint="orange"/>
      <Stat label="Min HR" value={rhr||"—"} unit="bpm" tint="blue"/>
      <Stat label="HR Recovery" value={"—"} sub="needs watch data" tint="blue"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Resting Heart Rate (14d, watch)" color="#EC4899" data={hrChart.length?hrChart:[{name:"—",value:0}]}/>
      <div className="card"><strong>Cardio fitness note</strong><div className="muted" style={{fontSize:13,marginTop:10,lineHeight:1.6}}>VO₂ max estimated from your max &amp; resting HR{rhr&&maxHR?"":" — log resting HR (Health tab) and a workout with max HR to activate this"}. Higher VO₂ max and lower resting HR both signal improving cardiovascular fitness.</div></div>
    </div>

    {/* sleep */}
    <Sec t="😴 Sleep Analytics" s="Duration, stages and quality"/>
    <div className="grid g4">
      <Stat label="Last Night" value={+slLast.total||"—"} unit="h" tint="indigo"/>
      <Stat label="7-day Avg" value={slAvg||"—"} unit="h" tint="indigo"/>
      <Stat label="Deep Sleep" value={+slLast.deep||"—"} unit="h" tint="violet"/>
      <Stat label="REM Sleep" value={+slLast.rem||"—"} unit="h" tint="violet"/>
      <Stat label="Light Sleep" value={+slLast.light||"—"} unit="h" tint="blue"/>
      <Stat label="Efficiency" value={slEff||"—"} unit="%" tint="emerald"/>
      <Stat label="Sleep Goal" value={sleepPct} unit="%" sub="target 8h" tint="cyan"/>
      <Stat label="Quality Score" value={slEff? clamp(r0(slEff*0.6+sleepPct*0.4)) : (sleepPct||"—")} unit="/100" tint="emerald"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Sleep Duration (14d)" color="#8B5CF6" data={sleepChart.length?sleepChart:[{name:"—",value:0}]}/>
      <div className="card"><strong>Log last night's sleep</strong><div className="muted" style={{fontSize:12,marginTop:6}}>Enter from your watch or estimate — powers the charts &amp; score above.</div><SleepQuickAdd refresh={refresh}/></div>
    </div>

    {/* body comp */}
    <Sec t="🧬 Body Composition" s="Weight, BMI and body metrics"/>
    <div className="grid g4">
      <Stat label="Current Weight" value={curW} unit="kg" tint="cyan"/>
      <Stat label="BMI" value={bmi||"—"} sub={bmi?(bmi<18.5?"underweight":bmi<25?"healthy":bmi<30?"overweight":"obese"):""} tint="blue"/>
      <Stat label="Body Fat" value={bodyFat||"—"} unit="%" tint="orange"/>
      <Stat label="Muscle" value={muscle||"—"} unit="%" tint="emerald"/>
      <Stat label="Lean Body Mass" value={leanMass||"—"} unit="kg" tint="emerald"/>
      <Stat label="Waist" value={waist||"—"} unit="cm" tint="purple"/>
      <Stat label="Weight Lost" value={lost} unit="kg" tint="emerald"/>
      <Stat label="To Goal" value={remain>0?remain:0} unit="kg" tint="pink"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Weight Trend (30 entries)" color="#06B6D4" data={weightChart.length?weightChart:[{name:"—",value:curW}]}/>
      <LineC title="Body Fat % Trend" color="#F59E0B" data={wl.filter((x:any)=>x.bf).slice(-30).map((x:any)=>({name:(x.date||"").slice(5),value:x.bf}))}/>
    </div>

    {/* nutrition */}
    <Sec t="🍎 Nutrition Analytics" s="Today's intake vs goals and energy balance"/>
    <div className="grid g4">
      <Stat label="Calories Consumed" value={nt.cal.toLocaleString()} unit="kcal" sub={`Goal ${(+s.calorieGoal).toLocaleString()}`} tint="orange"/>
      <Stat label="Calories Burned" value={calBurn.toLocaleString()} unit="kcal" tint="orange"/>
      <Stat label={deficit>=0?"Daily Deficit":"Daily Surplus"} value={Math.abs(deficit).toLocaleString()} unit="kcal" sub={deficit>=0?"on track to lose":"over maintenance"} tint={deficit>=0?"emerald":"pink"}/>
      <Stat label="Protein" value={nt.protein} unit="g" sub={`${proteinPct}% of ${s.proteinGoal}g`} tint="emerald"/>
      <Stat label="Carbs" value={nt.carbs} unit="g" tint="blue"/>
      <Stat label="Fat" value={nt.fat} unit="g" tint="pink"/>
      <Stat label="Fiber" value={nt.fiber} unit="g" sub={`goal ${s.fiberGoal}g`} tint="emerald"/>
      <Stat label="Water" value={nt.water} unit="L" sub={`${waterPct}% of ${s.waterGoal}L`} tint="cyan"/>
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      <PieC title="Macro Distribution (g)" data={macro.every(m=>!m.value)?[{name:"No log",value:0}]:macro}/>
      <BarC title="Protein Intake (7d)" color="#10B981" data={proteinChart}/>
      <BarC title="Calorie Deficit (7d)" color="#3B82F6" data={deficitChart}/>
    </div>

    {/* weight loss / projections */}
    <Sec t="🎯 Weight-Loss & Predictive Analytics" s="Rate, projections and goal ETA"/>
    <div className="grid g4">
      <Stat label="Weekly Loss Rate" value={weeklyRate} unit="kg/wk" tint="emerald"/>
      <Stat label="Monthly Loss Rate" value={monthlyRate} unit="kg" tint="emerald"/>
      <Stat label="Goal ETA" value={goalDate? goalDate.toLocaleDateString(undefined,{month:"short",day:"numeric"}) : "—"} sub={goalDate? goalDate.getFullYear().toString():"log 2+ weigh-ins"} tint="cyan"/>
      <Stat label="Progress" value={weightProgPct} unit="%" sub={`${lost} of ${r1(totalToLose)}kg`} tint="blue"/>
      <Stat label="Predicted · 30d" value={projW(4.29)} unit="kg" tint="cyan"/>
      <Stat label="Predicted · 60d" value={projW(8.57)} unit="kg" tint="cyan"/>
      <Stat label="Predicted · 90d" value={projW(12.86)} unit="kg" tint="cyan"/>
      <Stat label="Avg Daily Deficit" value={(()=>{const arr=deficitChart.filter(x=>x.value);return arr.length? r0(arr.reduce((a,x)=>a+x.value,0)/arr.length):0;})()} unit="kcal" tint="emerald"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Weight vs Goal projection" color="#06B6D4" data={[...weightChart,{name:"+30d",value:projW(4.29)},{name:"+60d",value:projW(8.57)},{name:"+90d",value:projW(12.86)}]}/>
      <BarC title="Calorie Deficit Trend (7d)" color="#10B981" data={deficitChart}/>
    </div>

    {/* performance scoreboard */}
    <Sec t="📊 Performance Scoreboard" s="Goal completion across every pillar"/>
    <div className="grid g2">
      <div className="card">
        <ProgRow label="Daily Step Goal" pct={stepPct} color="#10B981"/>
        <ProgRow label="Weekly Workout Completion" pct={workoutWkPct} color="#A855F7"/>
        <ProgRow label="Monthly Consistency" pct={monthlyConsistency} color="#3B82F6"/>
        <ProgRow label="Gym Attendance" pct={gymPct} color="#8B5CF6"/>
      </div>
      <div className="card">
        <ProgRow label="Protein Goal" pct={proteinPct} color="#10B981"/>
        <ProgRow label="Sleep Goal" pct={sleepPct} color="#6366F1"/>
        <ProgRow label="Water Goal" pct={waterPct} color="#06B6D4"/>
        <ProgRow label="Weight-Loss Progress" pct={weightProgPct} color="#EC4899"/>
      </div>
    </div>
    <div className="muted" style={{fontSize:11,marginTop:14}}>Estimates use the Mifflin-St Jeor BMR ({bmrOf(s,curW).toLocaleString()} kcal) at 1.2× baseline plus logged activity. Projections assume your current trend continues; real results vary. Sleep &amp; heart metrics need watch or manual entries to populate.</div>
  </>;
}

/* ---------- overview (legacy, kept) ---------- */
function Overview({ refresh }: { refresh: () => void }) {
  const walkToday = LS("pos_walks",[]).filter((x:any)=>x.date===today());
  const cardioToday = LS("pos_cardio",[]).filter((x:any)=>x.date===today());
  const woToday = LS("pos_workouts",[]).filter((x:any)=>x.date===today());
  const steps = walkToday.reduce((a:number,x:any)=>a+(+x.steps||0),0);
  const calBurn = walkToday.reduce((a:number,x:any)=>a+(+x.cal||0),0)+cardioToday.reduce((a:number,x:any)=>a+(+x.cal||0),0)+woToday.reduce((a:number,x:any)=>a+(+x.calories||0),0);
  const activeMin = walkToday.reduce((a:number,x:any)=>a+(+x.activeMin||0),0)+cardioToday.reduce((a:number,x:any)=>a+(+x.duration||0),0);
  const wlog = LS("pos_weightlog",[]); const curW = wlog.length? wlog[0].weight : "—";
  const streak = (()=>{ let n=0; const d=new Date(); for(;;){ const ds=dstr(d); if(LS("pos_workouts",[]).some((w:any)=>w.date===ds)){n++;d.setDate(d.getDate()-1);}else break; if(n>400)break; } return n; })();
  const kpi=(lbl:string,val:any,unit:string,ic:string,tint:string)=><div className="card kpi"><div className="between"><div className="lbl">{lbl}</div><div className={"ic-chip tint-"+tint}>{ic}</div></div><div className="val">{val}{unit&&<small> {unit}</small>}</div></div>;
  const woFreq=()=>{ const out=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=dstr(d);out.push({name:DOW[d.getDay()],value:LS("pos_workouts",[]).filter((w:any)=>w.date===ds).length});}return out; };
  return <>
    <div className="head"><h1>📊 Fitness Overview</h1><p>Today&apos;s summary · {new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</p></div>
    <GoogleHealthCard refresh={refresh}/>
    <div className="grid g4">
      {kpi("Steps",steps,"","👟","emerald")}
      {kpi("Calories Burned",calBurn,"kcal","🔥","orange")}
      {kpi("Active Minutes",activeMin,"min","⚡","blue")}
      {kpi("Today's Weight",curW,"kg","⚖️","cyan")}
    </div>
    <div className="grid g4" style={{marginTop:16}}>
      {kpi("Morning Walk",walkToday.length?"Done ✅":"Pending","","🚶","emerald")}
      {kpi("Workout",woToday.length?woToday[0].type+" ✅":"Pending","","🏋️","purple")}
      {kpi("Cardio",cardioToday.length?cardioToday.length+" done":"—","","🏃","pink")}
      {kpi("Workout Streak",streak,"days","📈","indigo")}
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      <BarC title="Weekly Steps" color="#10B981" data={byDay("pos_walks","steps",7)}/>
      <BarC title="Weekly Calories Burned" color="#F59E0B" data={byDay("pos_walks","cal",7)}/>
      <BarC title="Weekly Active Minutes" color="#3B82F6" data={byDay("pos_walks","activeMin",7)}/>
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      <LineC title="Weight Trend" color="#06B6D4" data={LS("pos_weightlog",[]).slice(0,14).reverse().map((x:any)=>({name:(x.date||"").slice(5),value:+x.weight||0}))}/>
      <BarC title="Workout Frequency (7d)" color="#A855F7" data={woFreq()}/>
      <BarC title="Monthly Steps" color="#10B981" data={byDay("pos_walks","steps",30)}/>
    </div>
  </>;
}

/* ---------- analytics ---------- */
function Analytics() {
  const wo = LS("pos_workouts",[]);
  const volByType = ["Push","Pull","Legs"].map(t=>({name:t,value:wo.filter((w:any)=>w.type===t).reduce((a:number,w:any)=>a+(+w.volume||0),0)}));
  const cardioDist = (()=>{ const m:Record<string,number>={}; LS("pos_cardio",[]).forEach((c:any)=>{m[c.activity||"Other"]=(m[c.activity||"Other"]||0)+(+c.duration||0);}); return Object.keys(m).map(k=>({name:k,value:m[k]})); })();
  /* heatmap: last 140 days workout/walk/cardio consistency */
  const cells=[]; const set:Record<string,number>={};
  wo.forEach((w:any)=>set[w.date]=(set[w.date]||0)+1);
  LS("pos_walks",[]).forEach((x:any)=>set[x.date]=(set[x.date]||0)+1);
  LS("pos_cardio",[]).forEach((x:any)=>set[x.date]=(set[x.date]||0)+1);
  for(let i=139;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const c=set[ds]||0;
    const bg=c===0?"rgba(255,255,255,.05)":c===1?"rgba(16,185,129,.4)":c===2?"rgba(16,185,129,.7)":"rgba(16,185,129,1)";
    cells.push(<div key={i} title={ds+" · "+c+" logged"} style={{aspectRatio:"1",borderRadius:4,background:bg}}/>); }
  return <>
    <div className="head"><h1>📈 Progress Analytics</h1><p>Trends across walks, workouts, cardio and body weight.</p></div>
    <div className="grid g2">
      <LineC title="Weight Progress" color="#06B6D4" data={LS("pos_weightlog",[]).slice(0,30).reverse().map((x:any)=>({name:(x.date||"").slice(5),value:+x.weight||0}))}/>
      <BarC title="Workout Volume (30d)" color="#3B82F6" data={byDay("pos_workouts","volume",30)}/>
      <BarC title="Weekly Steps" color="#10B981" data={byDay("pos_walks","steps",7)}/>
      <BarC title="Calories Burned (7d)" color="#F59E0B" data={byDay("pos_walks","cal",7)}/>
      <BarC title="Active Minutes (7d)" color="#8B5CF6" data={byDay("pos_walks","activeMin",7)}/>
      <BarC title="Cardio Duration (7d)" color="#EC4899" data={byDay("pos_cardio","duration",7)}/>
      <PieC title="Volume per Muscle Group" data={volByType}/>
      <PieC title="Cardio Activity Distribution" data={cardioDist.length?cardioDist:[{name:"None",value:0}]}/>
    </div>
    <div className="card" style={{marginTop:16}}><strong>Workout Consistency — last 140 days</strong>
      <div style={{display:"grid",gridTemplateColumns:"repeat(28,1fr)",gap:4,marginTop:12}}>{cells}</div>
      <div className="muted" style={{fontSize:12,marginTop:8}}>Greener = more sessions logged that day.</div>
    </div>
  </>;
}

/* ================= GOOGLE HEALTH BOARD (watch) ================= */
function GoogleHealthBoard({ refresh }: { refresh: () => void }){
  const H=LS("pos_health",{});
  const acts=LS("pos_gh_acts",[]);
  const [text,setText]=useState(""); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState<any>({date:today()});
  const [fDate,setFDate]=useState("");
  const calc=async()=>{ if(!text.trim())return; setBusy(true);
    try{ const r=await fetch("/api/gh-activity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,weightKg:curWeight()})}); const d=await r.json(); setForm((s:any)=>({date:today(),notes:text,...s,...d})); }catch(e){} setBusy(false); };
  const save=()=>{ const all=LS("pos_gh_acts",[]); all.unshift({id:uid(),date:form.date||today(),type:form.type||"Activity",distance:+form.distance||0,duration:+form.duration||0,avgSpeed:+form.avgSpeed||0,activeZone:+form.activeZone||0,cal:+form.cal||0,avgHR:+form.avgHR||0,maxHR:+form.maxHR||0,minHR:+form.minHR||0,laps:+form.laps||0,notes:form.notes||""}); SS("pos_gh_acts",all); setForm({date:today()}); setText(""); refresh(); };
  const del=(id:string)=>{ SS("pos_gh_acts",LS("pos_gh_acts",[]).filter((x:any)=>x.id!==id)); refresh(); };
  const set=(k:string,v:any)=>setForm((s:any)=>({...s,[k]:v}));

  // build per-day totals from watch sessions, overlaid with the daily rollup (more complete on recent days)
  const fixKm=(v:any)=>{ let k=+v||0; while(k>100) k/=1000; return Math.round(k*100)/100; };
  const dailyAgg:Record<string,any>={};
  acts.forEach((a:any)=>{ const d=a.date; if(!d) return; dailyAgg[d]=dailyAgg[d]||{steps:0,distance:0,cal:0,activeMin:0}; dailyAgg[d].steps+=+a.steps||0; dailyAgg[d].distance+=fixKm(a.distance); dailyAgg[d].cal+=+a.cal||0; dailyAgg[d].activeMin+=+a.activeZone||0; });
  LS("pos_ghealth",[]).forEach((g:any)=>{ const d=g.date; if(!d) return; dailyAgg[d]=dailyAgg[d]||{steps:0,distance:0,cal:0,activeMin:0}; dailyAgg[d].steps=Math.max(dailyAgg[d].steps,+g.steps||0); dailyAgg[d].distance=Math.max(dailyAgg[d].distance,fixKm(g.distance)); dailyAgg[d].cal=Math.max(dailyAgg[d].cal,+g.cal||0); dailyAgg[d].activeMin=Math.max(dailyAgg[d].activeMin,+g.activeMin||0); });
  const dayVal=(field:string,n:number)=>{ const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=dailyAgg[ds]; out.push({name:n<=7?DOW[d.getDay()]:String(d.getDate()),value:g?Math.round((+g[field]||0)*10)/10:0}); } return out; };
  const tA=dailyAgg[today()]||{};
  const steps=r0(tA.steps);
  const cal=r0(tA.cal);
  const activeMin=r0(tA.activeMin);
  const dist=r1(tA.distance);
  const floors=r0(ghToday("floors")|| +H.floors||0);
  const sleepH=(()=>{ const sl=LS("pos_sleep",[]).find((x:any)=>x.date===today()); return sl?r1(+sl.total||0):0; })();
  const rhr=+H.restingHR||0;
  const hrAvgVals=acts.filter((a:any)=>+a.avgHR).map((a:any)=>+a.avgHR);
  const avgHR=(+H.hrAvg||0)|| (hrAvgVals.length?r0(hrAvgVals.reduce((a:number,b:number)=>a+b,0)/hrAvgVals.length):0);
  const maxHR=(+H.hrMax||0)|| Math.max(0,...acts.map((a:any)=>+a.maxHR||0));
  const minHRs=acts.map((a:any)=>+a.minHR||0).filter(Boolean);
  const minHR=(+H.hrMin||0)|| (minHRs.length?Math.min(...minHRs):rhr);
  const F=(k:string,ph:string,w=110)=><input className="in" placeholder={ph} value={form[k]??""} onChange={e=>set(k,e.target.value)} style={{width:w}}/>;
  const dailyDist=dayVal("distance",15);
  const actHR=acts.filter((a:any)=>+a.avgHR).slice(0,12).reverse().map((a:any)=>({name:(a.date||"").slice(5),value:+a.avgHR}));
  return <>
    <div className="head"><h1>⌚ Google Health</h1><p>Steps, heart rate &amp; activities from your Fitbit watch. Sync live data, or use AI to estimate an activity when the watch hasn&apos;t synced yet.</p></div>
    <GoogleHealthCard refresh={refresh}/>
    {(()=>{ const daysWithData=Object.keys(dailyAgg).filter((d)=>dailyAgg[d]&&(dailyAgg[d].steps||dailyAgg[d].distance||dailyAgg[d].cal)).length; const allDates=[...acts.map((a:any)=>a.date),...Object.keys(dailyAgg)].filter(Boolean).sort(); const oldest=allDates[0]||"—";
      return <div className="card" style={{marginBottom:16,background:"linear-gradient(100deg,rgba(16,185,129,.10),rgba(59,130,246,.06))"}}>
        <div className="between" style={{flexWrap:"wrap",gap:10}}>
          <div className="row" style={{gap:8}}><span>🗄️</span><strong>Health Database</strong><span className="muted" style={{fontSize:11}}>rolling 180-day history · synced across your devices</span></div>
          <div className="row" style={{gap:18,flexWrap:"wrap"}}>
            <span className="muted" style={{fontSize:12}}>Days stored <b style={{color:"#E7ECF3"}}>{daysWithData}</b>/180</span>
            <span className="muted" style={{fontSize:12}}>Activities <b style={{color:"#E7ECF3"}}>{acts.length}</b></span>
            <span className="muted" style={{fontSize:12}}>Since <b style={{color:"#E7ECF3"}}>{oldest}</b></span>
          </div>
        </div>
      </div>; })()}
    <div className="grid g4">
      <Stat label="Steps Today" value={steps.toLocaleString()} tint="emerald"/>
      <Stat label="Calories Burned" value={cal.toLocaleString()} unit="kcal" tint="orange"/>
      <Stat label="Active Zone Min" value={activeMin} unit="min" tint="blue"/>
      <Stat label="Distance" value={dist} unit="km" tint="cyan"/>
      <Stat label="Floors" value={floors||"—"} tint="orange"/>
      <Stat label="Resting HR" value={rhr||"—"} unit="bpm" tint="pink"/>
      <Stat label="Sleep" value={sleepH||"—"} unit="h" tint="indigo"/>
      <Stat label="Activities Logged" value={acts.length} tint="violet"/>
    </div>
    <Sec t="❤️ Heart Rate" s="Across your recorded activities"/>
    <div className="grid g4">
      <Stat label="Max HR" value={maxHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="Average HR" value={avgHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="Min HR" value={minHR||"—"} unit="bpm" tint="blue"/>
      <Stat label="Resting HR" value={rhr||"—"} unit="bpm" tint="emerald"/>
    </div>

    <Sec t="🏃 Log / estimate an activity" s="Walk, run, ride or workout — describe it and AI fills distance, speed, active zone, calories & heart rate"/>
    <div className="card">
      <div style={{padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Describe it — Claude estimates the metrics</strong></div>
        <textarea className="in" value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. ran 5 km in 28 min, felt hard, hilly" style={{width:"100%",minHeight:52,marginTop:8}}/>
        <div style={{marginTop:6}}><button className="btn ghost sm" onClick={calc} disabled={busy}>{busy?"🤖 Estimating…":"✨ Calculate with AI"}</button> <span className="muted" style={{fontSize:11}}>review &amp; edit below, then Save</span></div>
      </div>
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        <input className="in" type="date" value={form.date||today()} onChange={e=>set("date",e.target.value)} style={{width:150}}/>
        {F("type","Type",110)}{F("distance","Distance km",110)}{F("duration","Duration min",110)}{F("avgSpeed","Avg speed km/h",120)}
        {F("activeZone","Active zone min",120)}{F("cal","Calories",100)}{F("avgHR","Avg HR",90)}{F("maxHR","Max HR",90)}{F("minHR","Min HR",90)}{F("laps","Laps",80)}
        <button className="btn" onClick={save}>Save activity</button>
      </div>
    </div>

    <div className="grid g3" style={{marginTop:16}}>
      <BarC title="Steps (15d, watch)" color="#10B981" data={dayVal("steps",15)}/>
      <BarC title="Calories Burned (7d)" color="#F59E0B" data={dayVal("cal",7)}/>
      <BarC title="Active Zone Min (7d)" color="#3B82F6" data={dayVal("activeMin",7)}/>
      <LineC title="Resting HR (14d)" color="#EC4899" data={ghByDay("restingHR",14).filter((x:any)=>x.value>0)}/>
      <LineC title="Daily Distance (15d, km)" color="#06B6D4" data={dailyDist}/>
      <LineC title="Activity Avg HR" color="#A855F7" data={actHR.length?actHR:[{name:"—",value:0}]}/>
    </div>

    <Sec t="👟 Steps — last 15 days" s="Daily totals from your watch (auto-filled on each sync)"/>
    {(()=>{ const rows:any[]=[]; for(let i=0;i<15;i++){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=dailyAgg[ds]||{}; rows.push({date:ds,steps:+g.steps||0,distance:Math.round((+g.distance||0)*100)/100,cal:+g.cal||0,activeMin:+g.activeMin||0}); }
      const tot=rows.reduce((a,x)=>a+x.steps,0); const avg=r0(tot/15);
      return <div className="card">
        <div className="row" style={{gap:18,flexWrap:"wrap",marginBottom:10}}><span className="muted" style={{fontSize:12}}>15-day total <b style={{color:"#E7ECF3"}}>{tot.toLocaleString()}</b> steps</span><span className="muted" style={{fontSize:12}}>daily average <b style={{color:"#E7ECF3"}}>{avg.toLocaleString()}</b></span></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
          <thead><tr>{["Date","Steps","Distance","Calories","Active min"].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r:any)=><tr key={r.date} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <td style={{padding:"6px",fontSize:12}}>{r.date}{r.date===today()?" (today)":""}</td><td style={{padding:"6px",fontSize:12}}>{r.steps?r.steps.toLocaleString():"—"}</td><td style={{padding:"6px",fontSize:12}}>{r.distance||"—"} km</td><td style={{padding:"6px",fontSize:12}}>{r.cal||"—"}</td><td style={{padding:"6px",fontSize:12}}>{r.activeMin||"—"}</td>
          </tr>)}</tbody>
        </table></div>
        <div className="muted" style={{fontSize:11,marginTop:8}}>&quot;—&quot; means no watch data synced for that day yet. Sync daily to build the full history.</div>
      </div>; })()}

    <div className="card" style={{marginTop:16}}><div className="between" style={{flexWrap:"wrap",gap:8}}><strong>Activity history</strong><div className="row" style={{gap:8,flexWrap:"wrap"}}>
      <input className="in" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} max={today()} title="Filter by date" style={{width:150}}/>
      {fDate && <button className="btn ghost sm" onClick={()=>setFDate("")}>All dates</button>}
      <button className="btn ghost sm" onClick={()=>{ if(confirm("Remove watch-imported activities? Your AI/manual ones stay.")){ SS("pos_gh_acts", LS("pos_gh_acts",[]).filter((x:any)=>x.source!=="watch")); refresh(); } }}>Clear watch imports</button>
      <button className="btn ghost sm" onClick={()=>exportCSV("pos_gh_acts",acts)}>⬇ CSV</button></div></div>
      {(()=>{ const shown=fDate?acts.filter((a:any)=>a.date===fDate):acts; return <>
      {fDate && <div className="muted" style={{fontSize:12,marginTop:8}}>{shown.length} activit{shown.length===1?"y":"ies"} on {fDate}{shown.length?` · ${r1(shown.reduce((s:number,a:any)=>s+(+a.distance||0),0))} km · ${r0(shown.reduce((s:number,a:any)=>s+(+a.cal||0),0))} kcal`:""}</div>}
      <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
        <thead><tr>{["Date","Type","Dist","Dur","Speed","AZ min","Cal","Avg HR","Max HR","Laps",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
        <tbody>{shown.length? shown.map((a:any)=><tr key={a.id} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <td style={{padding:"6px",fontSize:12}}>{a.date}</td><td style={{padding:"6px",fontSize:12}}>{a.type}</td><td style={{padding:"6px",fontSize:12}}>{a.distance||"—"}km</td><td style={{padding:"6px",fontSize:12}}>{a.duration||"—"}m</td><td style={{padding:"6px",fontSize:12}}>{a.avgSpeed||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.activeZone||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.cal||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.avgHR||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.maxHR||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.laps||"—"}</td>
          <td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(a.id)}>✕</span></td>
        </tr>): <tr><td colSpan={11} className="muted" style={{padding:"10px 6px"}}>{fDate?`No activities on ${fDate}.`:"No activities yet — describe one above and Calculate with AI, or Sync from your watch."}</td></tr>}</tbody>
      </table></div></>; })()}
    </div>
  </>;
}

/* ================= SLEEP BOARD ================= */
function SleepBoard({ refresh }: { refresh: () => void }){
  const sleep=LS("pos_sleep",[]).slice().sort((a:any,b:any)=>a.date<b.date?-1:1);
  const last=sleep[sleep.length-1]||{};
  const avg=sleep.length? r1(sleep.slice(-7).reduce((a:number,x:any)=>a+(+x.total||0),0)/Math.min(7,sleep.length)):0;
  const chart=sleep.slice(-14).map((x:any)=>({name:(x.date||"").slice(5),value:+x.total||0}));
  const eff=+last.efficiency||0; const goalPct=pctOf(+last.total||avg,8);
  const del=(d:string)=>{ SS("pos_sleep",LS("pos_sleep",[]).filter((x:any)=>x.date!==d)); refresh(); };
  return <>
    <div className="head"><h1>😴 Sleep Tracker</h1><p>Filled automatically from your watch (Google Health) — or log manually anytime.</p></div>
    <div className="grid g4">
      <Stat label="Last Night" value={+last.total||"—"} unit="h" tint="indigo"/>
      <Stat label="7-day Avg" value={avg||"—"} unit="h" tint="indigo"/>
      <Stat label="Deep" value={+last.deep||"—"} unit="h" tint="violet"/>
      <Stat label="REM" value={+last.rem||"—"} unit="h" tint="violet"/>
      <Stat label="Light" value={+last.light||"—"} unit="h" tint="blue"/>
      <Stat label="Efficiency" value={eff||"—"} unit="%" tint="emerald"/>
      <Stat label="Quality" value={eff? clamp(r0(eff*0.6+goalPct*0.4)) : (goalPct||"—")} unit="/100" tint="emerald"/>
      <Stat label="Sleep Goal" value={goalPct} unit="%" sub="target 8h" tint="cyan"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Sleep Duration (14d)" color="#8B5CF6" data={chart.length?chart:[{name:"—",value:0}]}/>
      <div className="card"><strong>Log sleep</strong><div className="muted" style={{fontSize:12,marginTop:6}}>Watch sync fills this automatically; add or correct entries here.</div><SleepQuickAdd refresh={refresh}/>
        <div style={{overflowX:"auto",marginTop:12}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Date","Total","Deep","REM","Eff","Src",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px"}}>{h}</th>)}</tr></thead>
          <tbody>{sleep.slice().reverse().slice(0,12).map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <td style={{padding:"6px",fontSize:12}}>{x.date}</td><td style={{padding:"6px",fontSize:12}}>{x.total||"—"}h</td><td style={{padding:"6px",fontSize:12}}>{x.deep||"—"}</td><td style={{padding:"6px",fontSize:12}}>{x.rem||"—"}</td><td style={{padding:"6px",fontSize:12}}>{x.efficiency||"—"}</td><td style={{padding:"6px",fontSize:11,color:"#8A94A6"}}>{x.source==="watch"?"⌚":"✎"}</td>
            <td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(x.date)}>✕</span></td></tr>)}
          {!sleep.length&&<tr><td colSpan={7} className="muted" style={{padding:"10px 6px"}}>No sleep logged yet.</td></tr>}</tbody>
        </table></div>
      </div>
    </div>
  </>;
}

/* ================= PLAN-DRIVEN WORKOUT (integrated with Goals) ================= */
const pKey=(d:string)=>"pos_plan_"+d;
const addDays=(ds:string,n:number)=>{ const d=new Date(ds); d.setDate(d.getDate()+n); return dstr(d); };
function PlanWorkout({ refresh }: { refresh:()=>void }) {
  const t=today();
  const [split,setSplit]=useState("");
  const [act,setAct]=useState<any>({});
  const [tick,setTick]=useState(0);
  const [busy,setBusy]=useState(false);
  const [proposal,setProposal]=useState<any>(null);
  const [nextDate,setNextDate]=useState(addDays(t,4));
  const [pPrompt,setPPrompt]=useState(""); const [pBusy,setPBusy]=useState(false); const [edited,setEdited]=useState(false); const [pInfo,setPInfo]=useState<string|null>(null);
  const [histOpen,setHistOpen]=useState<string|null>(null);
  const delHistory=(id:string)=>{ if(!confirm("Delete this saved workout?")) return; SS("pos_workouts", LS("pos_workouts",[]).filter((w:any)=>w.id!==id)); refresh(); setTick(x=>x+1); };
  const daySessions=(LS(pKey(t),{}).exSessions||[]) as any[];
  const session=split? daySessions.find((s:any)=>s.type===split): null;
  const hasSplit=(sp:string)=> daySessions.some((s:any)=>s.type===sp);

  useEffect(()=>{ setProposal(null); setEdited(false); setNextDate(addDays(t,4));
    if(!session){ setAct({}); return; }
    const saved=LS("pos_wact_"+t+"_"+split,null);
    if(saved){ setAct(saved); return; }
    const seed:any={}; (session.selected||[]).forEach((e:any)=>{ const n=Math.max(1,+e.sets||3); seed[e.name]={sets:Array.from({length:n},()=>({w:e.weight||"",r:e.reps||""})),done:false}; });
    setAct(seed); /* eslint-disable-next-line */ },[split]);
  const saveAct=(n:any)=>{ setAct(n); SS("pos_wact_"+t+"_"+split,n); setTick(x=>x+1); };
  const setCell=(ex:string,i:number,f:string,v:string)=>{ const e=act[ex]||{sets:[]}; const sets=e.sets.slice(); sets[i]={...sets[i],[f]:v}; saveAct({...act,[ex]:{...e,sets}}); };
  const addRow=(ex:string)=>{ const e=act[ex]||{sets:[]}; saveAct({...act,[ex]:{...e,sets:[...(e.sets||[]),{w:"",r:""}]}}); };
  const delRow=(ex:string,i:number)=>{ const e=act[ex]||{sets:[]}; const sets=(e.sets||[]).filter((_:any,x:number)=>x!==i); saveAct({...act,[ex]:{...e,sets:sets.length?sets:[{w:"",r:""}]}}); };
  const toggleDone=(ex:string)=>{ const e=act[ex]||{sets:[]}; saveAct({...act,[ex]:{...e,done:!e.done}}); };
  const saveExercise=(ex:string)=>{ const e=act[ex]||{sets:[]}; const filled=(e.sets||[]).filter((s:any)=>s.w||s.r); if(!filled.length){ alert("Enter at least one set for "+ex+"."); return; } saveAct({...act,[ex]:{...e,saved:true,done:true}}); };
  const editExercise=(ex:string)=>{ const e=act[ex]||{}; saveAct({...act,[ex]:{...e,saved:false}}); };
  const deleteExercise=(ex:string)=>{ if(!confirm("Clear the logged sets for "+ex+"?")) return; saveAct({...act,[ex]:{sets:[{w:"",r:""}],done:false,saved:false}}); };

  const shiftFrom=(n:number)=>{ const dates:string[]=[]; for(let i=0;i<200;i++){ const d=addDays(t,i); const c=LS(pKey(d),null); if(c&&Array.isArray(c.exSessions)&&c.exSessions.length) dates.push(d); }
    dates.sort().reverse().forEach(d=>{ const c=LS(pKey(d),{}); const tgt=addDays(d,n); const tc=LS(pKey(tgt),{}); const ts=Array.isArray(tc.exSessions)?tc.exSessions:[]; SS(pKey(tgt),{...tc,exSessions:[...ts,...c.exSessions]}); SS(pKey(d),{...c,exSessions:[]}); }); };
  const skipToday=()=>{ if(!confirm("Make today ("+t+") a REST day and push today's workout + everything after it forward by 1 day?")) return; shiftFrom(1); refresh(); setSplit(""); alert("✓ Today is now a rest day. Your workout and the rest of the schedule shifted forward 1 day."); };
  const moveForward=()=>{ const raw=prompt("Can't train today? Move today's workout AND everything after it forward by how many days?","1"); const n=parseInt(raw||"0"); if(!n||n<1) return;
    shiftFrom(n); refresh(); setSplit(""); alert("✓ Moved everything from "+t+" forward by "+n+" day(s). The rest of the schedule shifted too.");
  };

  const submit=async()=>{
    if(!session) return;
    const planned=(session.selected||[]).map((e:any)=>({name:e.name,sets:+e.sets||0,reps:+e.reps||0,weight:+e.weight||0}));
    const actualEx=(session.selected||[]).map((e:any)=>{ const a=act[e.name]||{sets:[]}; const sets=(a.sets||[]).filter((s:any)=>s.w||s.r).map((s:any)=>({w:+s.w||0,r:+s.r||0}));
      return { name:e.name, planned:{sets:+e.sets||0,reps:+e.reps||0,weight:+e.weight||0}, sets, done:!!a.done, missedSets:Math.max(0,(+e.sets||0)-sets.length) }; });
    if(!actualEx.some((e:any)=>e.sets.length)){ alert("Log at least one set first."); return; }
    const volume=actualEx.reduce((v:number,e:any)=>v+e.sets.reduce((a:number,s:any)=>a+s.w*s.r,0),0);
    const completion=Math.round(actualEx.filter((e:any)=>e.done).length/Math.max(1,actualEx.length)*100);
    const rec={ id:uid(), date:t, type:split, exercises:actualEx.map((e:any)=>({name:e.name,sets:e.sets.map((s:any)=>({w:s.w,r:s.r})),topWeight:e.sets.length?Math.max(0,...e.sets.map((s:any)=>s.w)):0,reps:e.sets.reduce((a:number,s:any)=>a+s.r,0),done:e.done,missedSets:e.missedSets,volume:e.sets.reduce((a:number,s:any)=>a+s.w*s.r,0)})), planned:session.selected, volume, completion, source:"plan" };
    const all=LS("pos_workouts",[]); const idx=all.findIndex((w:any)=>w.date===t&&w.type===split); if(idx>=0) all[idx]=rec; else all.unshift(rec); SS("pos_workouts",all);
    const cur:any=LS(pKey(t),{}); const sess=(cur.exSessions||[]).map((s:any)=> s.id===session.id? {...s,done:true,selected:(s.selected||[]).map((x:any)=>({...x,done:true}))}:s); SS(pKey(t),{...cur,exSessions:sess});
    refresh();
    setBusy(true);
    const history=LS("pos_workouts",[]).filter((w:any)=>w.type===split&&w.date!==t).slice(0,3).map((w:any)=>({date:w.date,volume:w.volume,exercises:(w.exercises||[]).map((e:any)=>({name:e.name,topWeight:e.topWeight,reps:e.reps}))}));
    try{ const r=await fetch("/api/next-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:split,planned,actual:actualEx,history})}); const d=await r.json();
      if(d.next) setProposal(d); else alert(d.error||"AI analysis failed."); }catch(e){ alert("AI failed — check your key."); }
    setBusy(false);
  };

  const setNextField=(i:number,f:string,v:string)=>{ setProposal((p:any)=>({...p,next:p.next.map((x:any,idx:number)=>idx===i?{...x,[f]:v}:x)})); setEdited(true); };
  const delNextRow=(i:number)=>{ setProposal((p:any)=>({...p,next:p.next.filter((_:any,idx:number)=>idx!==i)})); setEdited(true); };
  const chatEdit=async()=>{ if(!proposal||!pPrompt.trim())return; setPBusy(true);
    try{ const r=await fetch("/api/edit-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:split,exercises:proposal.next,prompt:pPrompt})}); const d=await r.json();
      if(Array.isArray(d.exercises)){ setProposal((p:any)=>({...p,next:d.exercises})); setEdited(true);} setPPrompt(""); }catch(e){} setPBusy(false); };
  const approve=()=>{
    const pk=pKey(nextDate); const cur:any=LS(pk,{}); const ex=Array.isArray(cur.exSessions)?cur.exSessions:[];
    const filtered=ex.filter((s:any)=> !(s.type===split && s.source==="ai")); // replace any prior AI-proposed same split on that date
    filtered.push({ id:uid(), time:"", type:split, done:false, source: edited?"manual":"ai", selected:(proposal.next||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""})), steps:"", distance:"", duration:"", detail: proposal.note?("AI: "+proposal.note):"" });
    SS(pk,{...cur,exSessions:filtered});
    SS("pos_wact_"+t+"_"+split,null);
    setProposal(null); setSplit(""); refresh();
    alert(`✓ Next ${split} saved to Goals on ${nextDate}${edited?" (your manually-edited version)":""}.`);
  };

  /* ---- render ---- */
  if(!split){
    const todays=daySessions.filter((s:any)=>["Push","Pull","Legs"].includes(s.type));
    return <>
      <div className="head"><h1>🏋️ Workout</h1><p>Pick today&apos;s split — it loads the plan you set in Goals, you log the actual sets, and AI plans your next one.</p></div>
      <div className="grid g3">
        {["Push","Pull","Legs"].map(sp=>{ const has=hasSplit(sp); const done=daySessions.find((s:any)=>s.type===sp)?.done; const col=sp==="Push"?"🟦":sp==="Pull"?"🟪":"🟩";
          return <div key={sp} className="card" style={{cursor:"pointer",borderColor:has?"rgba(59,130,246,.45)":undefined,opacity:has?1:.6}} onClick={()=>setSplit(sp)}>
            <div style={{fontSize:34}}>{col}</div><strong style={{fontSize:18}}>{sp}</strong>
            <div className="muted" style={{fontSize:12,marginTop:4}}>{done?"✅ Completed today":has?"Planned for today — tap to log":"Not scheduled today"}</div>
          </div>; })}
      </div>
      {!todays.length && <div className="card" style={{marginTop:16}}><strong>😌 Rest day</strong><div className="muted" style={{fontSize:13,marginTop:6}}>No Push/Pull/Legs is planned in Goals for today ({t}). Add today&apos;s session in <b>Goals → Exercise</b>, or move a workout here.</div></div>}
      <div className="card" style={{marginTop:16}}><div className="between" style={{flexWrap:"wrap",gap:8}}>
        <div><strong>Can&apos;t train today?</strong><div className="muted" style={{fontSize:12,marginTop:2}}>Skip today (it becomes a rest day) or move forward by several days. Either way the whole schedule shifts to keep your Push→Pull→Legs→gap rhythm.</div></div>
        <div className="row" style={{gap:8,flexWrap:"wrap"}}>
          <button className="btn ghost sm" onClick={skipToday}>😴 Skip today — make it rest</button>
          <button className="btn ghost sm" onClick={moveForward}>➡ Move forward…</button>
        </div>
      </div></div>
      {(()=>{ const hist=LS("pos_workouts",[]).slice(0,60); return <div className="card" style={{marginTop:16}}>
        <strong>📚 Workout history</strong>
        <div className="muted" style={{fontSize:12,marginTop:2,marginBottom:8}}>Your past sessions — tap one to see every exercise, set &amp; weight.</div>
        {hist.length? <ul className="list">{hist.map((w:any)=>{ const open=histOpen===w.id; const plannedMap:any={}; (w.planned||[]).forEach((pl:any)=>plannedMap[pl.name]=pl);
          return <li key={w.id} style={{padding:"8px 0",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <div className="between" style={{cursor:"pointer",gap:8}} onClick={()=>setHistOpen(open?null:w.id)}>
              <span style={{fontSize:13}}><b>{open?"▾":"▸"} {w.date}</b> · {w.type}</span>
              <span className="muted" style={{fontSize:12}}>{w.volume||0}kg{w.completion!=null?` · ${w.completion}%`:""}{w.calories?` · ${w.calories}kcal`:""}</span>
            </div>
            {open && <div style={{marginTop:8,paddingLeft:6}}>
              {(w.exercises||[]).length? (w.exercises||[]).map((e:any,i:number)=>{ const sets=(e.sets||[]).map((s:any)=>`${s.w||0}×${s.r||0}`).join(", ")||"—"; const pl=plannedMap[e.name]; return (
                <div key={i} style={{padding:"5px 0",fontSize:13}}>
                  <b>{exEmoji(e.name)} {e.name}</b> <a href={demoLink(e.name)} target="_blank" rel="noopener" style={{fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺</a>
                  <div className="muted" style={{fontSize:12}}>Did: {sets}{e.topWeight?` · best ${e.topWeight}kg`:""}{pl?` · plan ${pl.sets}×${pl.reps}@${pl.weight||"—"}kg`:""}{e.missedSets?` · ⚠ ${e.missedSets} set(s) missed`:""}</div>
                </div>
              ); }) : <div className="muted" style={{fontSize:12}}>{w.notes||"No per-exercise detail saved."}</div>}
              <button className="btn ghost sm" style={{marginTop:6}} onClick={()=>delHistory(w.id)}>🗑 Delete</button>
            </div>}
          </li>; })}</ul> : <div className="muted" style={{fontSize:13}}>No workouts logged yet. Complete one from the split buttons above and it&apos;ll appear here.</div>}
      </div>; })()}
    </>;
  }
  if(!session){
    return <>
      <div className="head"><h1>🏋️ {split}</h1><p>No {split} planned for today.</p></div>
      <div className="card"><div className="muted" style={{fontSize:13}}>There&apos;s no <b>{split}</b> session in Goals for today ({t}). Add it in <b>Goals → Exercise</b> (pick {split} and your exercises), then come back — it&apos;ll load here automatically.</div>
        <div style={{marginTop:12}}><button className="btn ghost sm" onClick={()=>setSplit("")}>‹ Back</button></div></div>
    </>;
  }
  const planned=session.selected||[];
  return <>
    <div className="head"><h1>🏋️ {split} — {t}</h1><p>Log the actual sets you did against your plan, then submit for AI analysis &amp; your next workout.</p></div>
    <div className="row" style={{gap:8,marginBottom:12,flexWrap:"wrap"}}><button className="btn ghost sm" onClick={()=>setSplit("")}>‹ Back</button>{session.done && <span className="in" style={{padding:"4px 10px",color:"#6ee7b7"}}>✅ Completed</span>}</div>
    {planned.map((e:any,ei:number)=>{ const a=act[e.name]||{sets:[{w:"",r:""}]}; const sets=a.sets||[{w:"",r:""}];
      const doneSets=(a.sets||[]).filter((s:any)=>s.w||s.r); const top=doneSets.length?Math.max(0,...doneSets.map((s:any)=>+s.w||0)):0;
      if(a.saved){ return (
        <div className="card" key={ei} style={{marginBottom:10,borderColor:"rgba(16,185,129,.45)"}}>
          <div className="between" style={{flexWrap:"wrap",gap:8}}>
            <div><span style={{fontSize:14,fontWeight:650}}>✅ {exEmoji(e.name)} {e.name}</span>
              <div className="muted" style={{fontSize:12,marginTop:2}}>{doneSets.length} set{doneSets.length===1?"":"s"} · {doneSets.map((s:any)=>`${s.w||0}×${s.r||0}`).join(", ")} · best {top}kg</div></div>
            <div className="row" style={{gap:8}}>
              <button className="btn ghost sm" onClick={()=>editExercise(e.name)}>✎ Edit</button>
              <button className="btn ghost sm" onClick={()=>deleteExercise(e.name)}>🗑</button>
            </div>
          </div>
        </div>
      ); }
      return (
      <div className="card" key={ei} style={{marginBottom:12}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:15,fontWeight:650}}>{exEmoji(e.name)} {e.name} <a href={demoLink(e.name)} target="_blank" rel="noopener" style={{fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a> <span onClick={()=>setPInfo(pInfo===e.name?null:e.name)} style={{fontSize:11,color:"#a5b4fc",cursor:"pointer"}}>ⓘ How to</span></div>
            <div className="muted" style={{fontSize:12,marginTop:2}}>Plan: {e.sets}×{e.reps} @ {e.weight||"—"}kg</div></div>
        </div>
        {pInfo===e.name && <div className="muted" style={{fontSize:12,lineHeight:1.6,marginTop:8}}>{HOWTO[e.name]||"Controlled form, full range of motion — tap Demo to watch it."}</div>}
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:10}}>
          <thead><tr>{["Set","Weight (kg)","Reps",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"5px"}}>{h}</th>)}</tr></thead>
          <tbody>{sets.map((s:any,i:number)=><tr key={i}>
            <td style={{padding:"5px",color:"#8A94A6",fontWeight:700,width:36}}>{i+1}</td>
            <td style={{padding:"5px"}}><input className="in" type="number" value={s.w??""} onChange={ev=>setCell(e.name,i,"w",ev.target.value)} placeholder={String(e.weight||"")} style={{width:100}}/></td>
            <td style={{padding:"5px"}}><input className="in" type="number" value={s.r??""} onChange={ev=>setCell(e.name,i,"r",ev.target.value)} placeholder={String(e.reps||"")} style={{width:100}}/></td>
            <td style={{padding:"5px"}}>{sets.length>1 && <span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delRow(e.name,i)}>✕</span>}</td>
          </tr>)}</tbody>
        </table>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <button className="btn ghost sm" onClick={()=>addRow(e.name)}>+ Add set</button>
          <button className="btn sm" onClick={()=>saveExercise(e.name)} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>✅ Save exercise</button>
        </div>
      </div>
    ); })}
    <div className="card"><button className="btn" onClick={submit} disabled={busy} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>{busy?"🤖 Analysing…":"✅ Submit workout & get AI analysis + next plan"}</button>
      <div className="muted" style={{fontSize:11,marginTop:8}}>AI compares plan vs actual, your history &amp; progression, records any missed sets, then proposes your next {split}.</div>
    </div>

    {proposal && <div className="card" style={{marginTop:16,borderColor:"rgba(16,185,129,.4)"}}>
      {proposal.analysis && <><div className="row" style={{gap:8,marginBottom:6}}><span>📊</span><strong style={{fontSize:15}}>AI Analysis</strong></div>
      <div style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.7,color:"#c9d3e0",background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",borderRadius:12,padding:14}}>{proposal.analysis}</div></>}
      <div className="row" style={{gap:8,margin:"16px 0 8px"}}><span>🎯</span><strong style={{fontSize:15}}>Proposed next {split}</strong></div>
      {proposal.note && <div className="muted" style={{fontSize:12,marginBottom:8}}>{proposal.note}</div>}
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
        <thead><tr>{["Exercise","Sets","Reps","Weight (kg)",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
        <tbody>{(proposal.next||[]).map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <td style={{padding:"6px"}}><input className="in" value={x.name||""} onChange={e=>setNextField(i,"name",e.target.value)} style={{minWidth:150,width:"100%"}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.sets??""} onChange={e=>setNextField(i,"sets",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.reps??""} onChange={e=>setNextField(i,"reps",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.weight??""} onChange={e=>setNextField(i,"weight",e.target.value)} style={{width:70}}/></td>
          <td style={{padding:"6px",whiteSpace:"nowrap"}}><a href={demoLink(x.name)} target="_blank" rel="noopener" style={{marginRight:6,textDecoration:"none"}}>📺</a><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delNextRow(i)}>✕</span></td>
        </tr>)}</tbody>
      </table></div>
      <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Ask AI to change it</strong></div>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <input className="in" value={pPrompt} onChange={e=>setPPrompt(e.target.value)} placeholder="e.g. replace bench with dumbbell press, add rear delts, lighter legs" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") chatEdit(); }}/>
          <button className="btn sm" onClick={chatEdit} disabled={pBusy}>{pBusy?"🤖…":"Apply"}</button>
        </div>
      </div>
      <div className="row" style={{gap:8,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
        <span className="muted" style={{fontSize:13}}>Schedule on:</span>
        <input className="in" type="date" value={nextDate} min={t} onChange={e=>setNextDate(e.target.value)} style={{width:160}}/>
        <span className="muted" style={{fontSize:11}}>(default +4 days — next {split} in your cycle)</span>
        <button className="btn" onClick={approve} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>✅ Accept &amp; save to Goals</button>
      </div>
      {edited && <div className="muted" style={{fontSize:11,marginTop:6,color:"#fcd34d"}}>You edited this — it&apos;ll be saved as your manual final plan.</div>}
    </div>}
  </>;
}

/* ---------- root ---------- */
export default function Fitness() {
  const [tab, setTab] = useState("ghealth");
  const [, setT] = useState(0); const refresh = () => setT(x=>x+1);
  const TABS: [string,string,string][] = [
    ["ghealth","Google Health","⌚"],["workout","Workout","🏋️"],["strava","Strava","🔗"],["sleep","Sleep","😴"],
  ];
  return <>
    <div className="row" style={{flexWrap:"wrap",gap:8,marginBottom:18}}>
      {TABS.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} className={"btn "+(tab===t[0]?"":"ghost")+" sm"} style={{fontWeight:600}}>{t[2]} {t[1]}</button>)}
    </div>
    {tab==="ghealth" && <GoogleHealthBoard refresh={refresh}/>}
    {tab==="workout" && <PlanWorkout refresh={refresh}/>}
    {tab==="strava" && <StravaView refresh={refresh} appOnly/>}
    {tab==="sleep" && <SleepBoard refresh={refresh}/>}
  </>;
}
