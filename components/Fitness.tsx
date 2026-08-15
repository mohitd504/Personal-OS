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
function exEmoji(name:string){ const n=name.toLowerCase();
  if(/(squat|lunge|leg press|leg extension|hip thrust|glute|calf|split squat)/.test(n)) return "🦵";
  if(/curl/.test(n)) return "💪";
  if(/(plank|ab wheel|crunch)/.test(n)) return "🧘";
  if(/(pull-?up|chin|pulldown|lat)/.test(n)) return "🧗";
  if(/(deadlift|row|shrug|farmer)/.test(n)) return "🏋️";
  return "🏋️"; }
function demoLink(name:string){ return "https://www.youtube.com/results?search_query="+encodeURIComponent(name+" proper form"); }
const HOWTO: Record<string,string> = {
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
      <div style={{marginTop:10}}><button className="btn" onClick={()=>commit(true)} disabled={saving}>{saving?"🤖 Estimating calories…":"Finish & save "+type+" workout"}</button></div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Each exercise you submit is saved to today&apos;s session automatically — &quot;Finish&quot; just refines the calorie estimate.</div>
    </div>
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
function StravaView({ refresh }: { refresh: () => void }) {
  const [src, setSrc] = useState<"watch"|"app">("watch");
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
    <div className="head"><h1>🔗 Strava</h1><p>Synced activities — Fitbit watch and Strava-app kept in separate tabs.</p></div>
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <button className={"btn " + (src==="watch"?"":"ghost") + " sm"} onClick={()=>setSrc("watch")}>⌚ Fitbit / Watch</button>
          <button className={"btn " + (src==="app"?"":"ghost") + " sm"} onClick={()=>setSrc("app")}>📱 Strava App</button>
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
  const sync = async () => { setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/ghealth/steps"); const d = await r.json();
      if (d.ok) { const h = LS("pos_health", {}); h.steps = d.steps; SS("pos_health", h); refresh(); setMsg(`Synced ✓ ${d.steps} steps today (Fitbit via Google Health).`); }
      else if (d.connected === false) setMsg("Not connected — click 'Connect Google Health' first.");
      else setMsg("Google Health error" + (d.code ? ` [${d.code}]` : "") + ": " + (d.error || JSON.stringify(d)));
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  return <div className="card" style={{ marginBottom: 16 }}>
    <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><span>⌚</span><strong>Fitbit · Google Health</strong><span className="muted" style={{ fontSize: 11 }}>steps from your watch — separate Google login</span></div>
      <div className="row" style={{ gap: 8 }}>
        <a className="btn ghost sm" href="/api/ghealth/connect">Connect Google Health</a>
        <button className="btn sm" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync steps"}</button>
      </div>
    </div>
    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg || "Connect once (separate from your Gmail login), then Sync to pull today's steps. Fitbit must be linked to that Google account."}</div>
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

/* ---------- overview ---------- */
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

/* ---------- root ---------- */
export default function Fitness() {
  const [tab, setTab] = useState("overview");
  const [, setT] = useState(0); const refresh = () => setT(x=>x+1);
  const TABS: [string,string,string][] = [
    ["overview","Overview","📊"],["workout","Today's Workout","🏋️"],["walk","Daily Walk","🚶"],
    ["weight","Weight","⚖️"],["cardio","Cardio","🏃"],["strava","Strava","🔗"],["analytics","Analytics","📈"],
  ];
  return <>
    <div className="row" style={{flexWrap:"wrap",gap:8,marginBottom:18}}>
      {TABS.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} className={"btn "+(tab===t[0]?"":"ghost")+" sm"} style={{fontWeight:600}}>{t[2]} {t[1]}</button>)}
    </div>
    {tab==="overview" && <Overview refresh={refresh}/>}
    {tab==="walk" && <Tracker refresh={refresh} aiCal="walking" aiParse="walk" storeKey="pos_walks" title="Daily Walk Tracker" icon="🚶"
      fields={[{k:"date",label:"Date",type:"date"},{k:"steps",label:"Steps"},{k:"distance",label:"Distance km"},{k:"cal",label:"Calories (watch)"},{k:"activeMin",label:"Active Min"},{k:"duration",label:"Duration min"},{k:"pace",label:"Avg Pace",type:"text"},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Daily Steps (7d)",field:"steps",kind:"bar",color:"#10B981"},{title:"Monthly Steps (30d)",field:"steps",kind:"bar",color:"#10B981"},{title:"Calories Burned (7d)",field:"cal",kind:"bar",color:"#F59E0B"},{title:"Active Minutes (7d)",field:"activeMin",kind:"bar",color:"#3B82F6"},{title:"Distance Walked (7d)",field:"distance",kind:"line",color:"#06B6D4"}]}/>}
    {tab==="workout" && <TodayWorkout refresh={refresh}/>}
    {tab==="weight" && <Tracker refresh={refresh} storeKey="pos_weightlog" title="Weight Tracker" icon="⚖️"
      fields={[{k:"date",label:"Date",type:"date"},{k:"weight",label:"Morning Weight kg"},{k:"bodyfat",label:"Body Fat %",optional:true},{k:"muscle",label:"Muscle %",optional:true},{k:"bmi",label:"BMI",optional:true},{k:"waist",label:"Waist",optional:true},{k:"chest",label:"Chest",optional:true},{k:"arms",label:"Arms",optional:true},{k:"thigh",label:"Thigh",optional:true},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Daily Weight (30d)",field:"weight",kind:"line",color:"#06B6D4"},{title:"Body Fat % (30d)",field:"bodyfat",kind:"line",color:"#F59E0B"}]}/>}
    {tab==="strava" && <StravaView refresh={refresh}/>}
    {tab==="cardio" && <Tracker refresh={refresh} aiCal="cardio" aiParse="cardio" storeKey="pos_cardio" title="Cardio Tracker" icon="🏃"
      fields={[{k:"date",label:"Date",type:"date"},{k:"activity",label:"Activity",type:"select",options:["Running","Cycling","StairMaster","Rowing","Walking","Swimming","Elliptical","HIIT","Other"]},{k:"duration",label:"Duration min"},{k:"distance",label:"Distance km"},{k:"cal",label:"Calories"},{k:"avgSpeed",label:"Avg Speed",optional:true},{k:"avgHR",label:"Avg HR",optional:true},{k:"maxHR",label:"Max HR",optional:true},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Weekly Cardio Duration",field:"duration",kind:"bar",color:"#EC4899"},{title:"Monthly Cardio Duration",field:"duration",kind:"bar",color:"#EC4899"},{title:"Calories Burned (7d)",field:"cal",kind:"bar",color:"#F59E0B"},{title:"Distance Covered (7d)",field:"distance",kind:"line",color:"#10B981"}]}/>}
    {tab==="analytics" && <Analytics/>}
  </>;
}
