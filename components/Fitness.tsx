"use client";
import { useState } from "react";
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

/* ---------- CSV export ---------- */
function exportCSV(name: string, rows: any[]) {
  if (!rows.length) { alert("Nothing to export yet."); return; }
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => `"${String(r[c]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = name+".csv"; a.click();
}

/* ---------- generic tracker (walk / weight / cardio) ---------- */
type Field = { k:string; label:string; type?:string; options?:string[]; optional?:boolean };
function Tracker({ storeKey, title, icon, fields, charts, refresh }:
  { storeKey:string; title:string; icon:string; fields:Field[]; charts:{title:string;field:string;kind:string;color:string}[]; refresh:()=>void }) {
  const rows: any[] = LS(storeKey, []);
  const [form, setForm] = useState<any>({ date: today() });
  const [editId, setEditId] = useState<string|null>(null);
  const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const save = () => {
    if (!form.date) { alert("Pick a date"); return; }
    const all = LS(storeKey, []);
    if (editId) { const i = all.findIndex((x:any)=>x.id===editId); if(i>=0) all[i] = { ...all[i], ...form }; }
    else all.push({ id: uid(), ...form });
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
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        {fields.map(f=> f.type==="select"
          ? <select key={f.k} className="in" value={form[f.k]||""} onChange={e=>setForm((s:any)=>({...s,[f.k]:e.target.value}))} style={{minWidth:130}}><option value="">{f.label}</option>{(f.options||[]).map(o=><option key={o}>{o}</option>)}</select>
          : <input key={f.k} className="in" type={f.type||"number"} placeholder={f.label+(f.optional?" (opt)":"")} value={form[f.k]??""} onChange={e=>setForm((s:any)=>({...s,[f.k]:f.type==="text"||f.type==="date"?e.target.value:e.target.value}))} style={{width:f.type==="text"?200:f.type==="date"?150:120}}/>
        )}
        <button className="btn" onClick={save}>{editId?"Update":"Add entry"}</button>
      </div>
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
function lastWeight(type:string, ex:string){ const hist=LS("pos_workouts",[]).filter((w:any)=>w.type===type); for(const w of hist){ const e=(w.exercises||[]).find((x:any)=>x.name===ex); if(e&&e.weight) return e.weight; } return null; }
function WorkoutPage({ type, list, refresh }: { type:string; list:string[]; refresh:()=>void }) {
  const draftKey = "pos_wdraft_"+type;
  const [rows, setRows] = useState<any>(LS(draftKey, {}));
  const [dur, setDur] = useState<any>(LS(draftKey+"_dur", ""));
  const [notes, setNotes] = useState<any>(LS(draftKey+"_notes", ""));
  const upd = (ex:string, f:string, v:any) => { const n = { ...rows, [ex]: { ...(rows[ex]||{}), [f]: v } }; setRows(n); SS(draftKey, n); };
  const volume = list.reduce((a,ex)=>{ const r=rows[ex]||{}; return a + (+r.sets||0)*(+r.reps||0)*(+r.weight||0); },0);
  const doneCount = list.filter(ex=> (rows[ex]||{}).done).length;
  const pct = Math.round(doneCount/list.length*100);
  const estCal = Math.round((+dur||0) * 6);
  const saveWorkout = () => {
    const exercises = list.map(ex=>({ name:ex, ...(rows[ex]||{}) })).filter(e=> e.sets||e.reps||e.weight||e.done);
    if (!exercises.length) { alert("Log at least one exercise."); return; }
    const all = LS("pos_workouts", []);
    all.unshift({ id:uid(), date:today(), type, duration:+dur||0, notes, exercises, volume, calories:estCal, completion:pct });
    SS("pos_workouts", all);
    SS(draftKey, {}); SS(draftKey+"_dur",""); SS(draftKey+"_notes","");
    setRows({}); setDur(""); setNotes(""); refresh();
    alert(type+" workout saved ✔");
  };
  const color = type==="Push"?"🟦":type==="Pull"?"🟪":"🟩";
  return <>
    <div className="head"><h1>{color} {type} Day</h1><p>Log sets, reps, weight, RPE — saved so you can track progressive overload.</p></div>
    <div className="card"><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
      <thead><tr>{["Exercise","Sets","Reps","Weight","RPE","Rest s","Done","Notes"].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"8px 6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
      <tbody>{list.map(ex=>{ const r=rows[ex]||{}; const lw=lastWeight(type,ex); return <tr key={ex} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
        <td style={{padding:"7px 6px",fontSize:13}}>🏋️ {ex}{lw?<div className="muted" style={{fontSize:10}}>last: {lw}kg</div>:null}</td>
        <td><input className="in" type="number" value={r.sets??""} onChange={e=>upd(ex,"sets",e.target.value)} style={{width:60}}/></td>
        <td><input className="in" type="number" value={r.reps??""} onChange={e=>upd(ex,"reps",e.target.value)} style={{width:60}}/></td>
        <td><input className="in" type="number" value={r.weight??""} onChange={e=>upd(ex,"weight",e.target.value)} style={{width:70}}/></td>
        <td><input className="in" type="number" value={r.rpe??""} onChange={e=>upd(ex,"rpe",e.target.value)} style={{width:56}}/></td>
        <td><input className="in" type="number" value={r.rest??""} onChange={e=>upd(ex,"rest",e.target.value)} style={{width:64}}/></td>
        <td style={{textAlign:"center"}}><input type="checkbox" checked={!!r.done} onChange={e=>upd(ex,"done",e.target.checked)}/></td>
        <td><input className="in" value={r.notes??""} onChange={e=>upd(ex,"notes",e.target.value)} style={{width:120}}/></td>
      </tr>; })}</tbody>
    </table></div></div>
    <div className="grid g4" style={{marginTop:16}}>
      <div className="card kpi"><div className="lbl">Total Volume</div><div className="val">{volume}<small> kg</small></div></div>
      <div className="card kpi"><div className="lbl">Completion</div><div className="val">{pct}<small>%</small></div></div>
      <div className="card kpi"><div className="lbl">Est. Calories</div><div className="val">{estCal}<small> kcal</small></div></div>
      <div className="card kpi"><div className="lbl">Duration</div><input className="in" type="number" placeholder="min" value={dur} onChange={e=>{setDur(e.target.value);SS(draftKey+"_dur",e.target.value);}} style={{width:90,marginTop:6}}/></div>
    </div>
    <div className="card" style={{marginTop:16}}><strong>Workout notes</strong>
      <textarea className="in" value={notes} onChange={e=>{setNotes(e.target.value);SS(draftKey+"_notes",e.target.value);}} placeholder="How did it feel? PRs?" style={{width:"100%",minHeight:70,marginTop:8}}/>
      <div style={{marginTop:10}}><button className="btn" onClick={saveWorkout}>Save {type} workout</button></div>
    </div>
    <div className="card" style={{marginTop:16}}><strong>Recent {type} sessions</strong>
      <ul className="list">{LS("pos_workouts",[]).filter((w:any)=>w.type===type).slice(0,6).map((w:any)=><li className="li" key={w.id}><span className="dot" style={{background:"var(--blue)"}}/><div style={{flex:1}} className="between"><span>{w.date}</span><span className="muted">{w.volume}kg · {w.completion}% · {w.calories}kcal</span></div></li>)}
      {!LS("pos_workouts",[]).filter((w:any)=>w.type===type).length && <li className="muted" style={{padding:"8px 0"}}>No saved sessions yet.</li>}</ul>
    </div>
  </>;
}

/* ---------- overview ---------- */
function Overview() {
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
    ["overview","Overview","📊"],["walk","Morning Walk","🚶"],["push","Push","🟦"],["pull","Pull","🟪"],
    ["leg","Leg","🟩"],["weight","Weight","⚖️"],["cardio","Cardio","🏃"],["analytics","Analytics","📈"],
  ];
  return <>
    <div className="row" style={{flexWrap:"wrap",gap:8,marginBottom:18}}>
      {TABS.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} className={"btn "+(tab===t[0]?"":"ghost")+" sm"} style={{fontWeight:600}}>{t[2]} {t[1]}</button>)}
    </div>
    {tab==="overview" && <Overview/>}
    {tab==="walk" && <Tracker refresh={refresh} storeKey="pos_walks" title="Morning Walk Tracker" icon="🚶"
      fields={[{k:"date",label:"Date",type:"date"},{k:"steps",label:"Steps"},{k:"distance",label:"Distance km"},{k:"cal",label:"Calories (watch)"},{k:"activeMin",label:"Active Min"},{k:"duration",label:"Duration min"},{k:"pace",label:"Avg Pace",type:"text"},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Daily Steps (7d)",field:"steps",kind:"bar",color:"#10B981"},{title:"Monthly Steps (30d)",field:"steps",kind:"bar",color:"#10B981"},{title:"Calories Burned (7d)",field:"cal",kind:"bar",color:"#F59E0B"},{title:"Active Minutes (7d)",field:"activeMin",kind:"bar",color:"#3B82F6"},{title:"Distance Walked (7d)",field:"distance",kind:"line",color:"#06B6D4"}]}/>}
    {tab==="push" && <WorkoutPage type="Push" list={PUSH} refresh={refresh}/>}
    {tab==="pull" && <WorkoutPage type="Pull" list={PULL} refresh={refresh}/>}
    {tab==="leg" && <WorkoutPage type="Legs" list={LEGS} refresh={refresh}/>}
    {tab==="weight" && <Tracker refresh={refresh} storeKey="pos_weightlog" title="Weight Tracker" icon="⚖️"
      fields={[{k:"date",label:"Date",type:"date"},{k:"weight",label:"Morning Weight kg"},{k:"bodyfat",label:"Body Fat %",optional:true},{k:"muscle",label:"Muscle %",optional:true},{k:"bmi",label:"BMI",optional:true},{k:"waist",label:"Waist",optional:true},{k:"chest",label:"Chest",optional:true},{k:"arms",label:"Arms",optional:true},{k:"thigh",label:"Thigh",optional:true},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Daily Weight (30d)",field:"weight",kind:"line",color:"#06B6D4"},{title:"Body Fat % (30d)",field:"bodyfat",kind:"line",color:"#F59E0B"}]}/>}
    {tab==="cardio" && <Tracker refresh={refresh} storeKey="pos_cardio" title="Cardio Tracker" icon="🏃"
      fields={[{k:"date",label:"Date",type:"date"},{k:"activity",label:"Activity",type:"select",options:["Running","Cycling","StairMaster","Rowing","Walking","Swimming","Elliptical","HIIT","Other"]},{k:"duration",label:"Duration min"},{k:"distance",label:"Distance km"},{k:"cal",label:"Calories"},{k:"avgSpeed",label:"Avg Speed",optional:true},{k:"avgHR",label:"Avg HR",optional:true},{k:"maxHR",label:"Max HR",optional:true},{k:"notes",label:"Notes",type:"text"}]}
      charts={[{title:"Weekly Cardio Duration",field:"duration",kind:"bar",color:"#EC4899"},{title:"Monthly Cardio Duration",field:"duration",kind:"bar",color:"#EC4899"},{title:"Calories Burned (7d)",field:"cal",kind:"bar",color:"#F59E0B"},{title:"Distance Covered (7d)",field:"distance",kind:"line",color:"#10B981"}]}/>}
    {tab==="analytics" && <Analytics/>}
  </>;
}
