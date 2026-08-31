"use client";
import { useCallback, useEffect, useState, useRef, Component } from "react";

class Boundary extends Component<{ children: any }, { err: any }> {
  constructor(p: any) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err: any) { return { err }; }
  render() {
    if (this.state.err) return (
      <div className="card" style={{ margin: 4 }}>
        <strong>⚠️ This screen hit an error</strong>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#f9a8d4", marginTop: 8 }}>{String(this.state.err?.message || this.state.err)}</pre>
        <button className="btn ghost sm" onClick={() => this.setState({ err: null })}>Dismiss</button>
      </div>
    );
    return this.props.children;
  }
}
import { PieChart, Pie, Cell, BarChart, Bar as RBar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Fitness, { HOWTO, demoLink, exEmoji } from "@/components/Fitness";
import SyncManager from "@/components/SyncManager";
import Assistant from "@/components/Assistant";
import TodayView from "@/components/features/TodayView";
import WeeklyReview from "@/components/features/WeeklyReview";
import ReminderCenter from "@/components/features/ReminderCenter";
import DataControls from "@/components/features/DataControls";
import StudyDashboard from "@/components/features/study/StudyDashboard";
import ExerciseWorkspace from "@/components/features/exercise/ExerciseWorkspace";
import NutritionWorkspace from "@/components/features/nutrition/NutritionWorkspace";
import EnglishWorkspace from "@/components/features/english/EnglishWorkspace";
import GmailWorkspace from "@/components/features/gmail/GmailWorkspace";
import type { AppSettings } from "@/lib/domain";

/* ---------- storage helpers ---------- */
const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const PPL: Record<number,string> = {0:"Recovery",1:"Push",2:"Pull",3:"Legs",4:"Push",5:"Pull",6:"Legs"};

type Sett = AppSettings;
const DEF_SETT: Sett = { name:"Mohit", age:34, heightFt:6, heightIn:1, planStart:today(), planDays:180, weightGoal:86, calorieGoal:2300, proteinGoal:170, carbGoal:230, fatGoal:60, fiberGoal:35, waterGoal:3.5, stepGoal:13000 };

const NAV = [
  { k:"today", ic:"☀️", t:"Today" }, { k:"home", ic:"🏠", t:"Dashboard" }, { k:"weekly", ic:"📈", t:"Weekly Review" }, { k:"health", ic:"❤️", t:"Health" }, { k:"exercise", ic:"🏋️", t:"Exercise" },
  { k:"nutrition", ic:"🍎", t:"Nutrition" }, { k:"study", ic:"📚", t:"Study" }, { k:"english", ic:"🗣️", t:"English" }, { k:"gmail", ic:"📧", t:"Gmail" },
  { k:"calendar", ic:"📅", t:"Calendar" }, { k:"goals", ic:"🎯", t:"Goals" }, { k:"settings", ic:"⚙️", t:"Settings" },
];

export default function Dashboard({ onSignOut, name }: { onSignOut: ()=>void; name: string }) {
  const [view, setView] = useState<string>("today");
  const [clock, setClock] = useState("");
  const [sett, setSett] = useState<Sett>(DEF_SETT);
  const [tick, setTick] = useState(0);
  const [selDate, setSelDate] = useState(today());
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const shiftDate = (n:number) => { const d=new Date(selDate); d.setDate(d.getDate()+n); const nd=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if(nd<=today()) setSelDate(nd); };

  useEffect(() => { setSett({ ...DEF_SETT, ...LS("pos_settings", {}), name }); }, [name]);
  useEffect(() => {
    const f = () => { const d = new Date(); let h = d.getHours(); const ap = h>=12?"PM":"AM"; h = h%12||12;
      setClock(`${h}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")} ${ap}`); };
    f(); const i = setInterval(f, 1000); return () => clearInterval(i);
  }, []);
  const saveSett = (s: Sett) => { setSett(s); SS("pos_settings", s); };

  return (
    <div className="app">
      <SyncManager onSync={refresh} />
      <Assistant onApplied={refresh} />
      <nav className="sidebar">
        <div className="brand"><span className="mark" /><span className="bt">Personal OS<small>Command Center</small></span></div>
        {NAV.map(n => (
          <div key={n.k} className={"nav" + (view===n.k?" active":"")} onClick={()=>setView(n.k)}>
            <span className="ic">{n.ic}</span><span className="tx">{n.t}</span>
          </div>
        ))}
        <div style={{ marginTop:"auto" }}>
          <div className="nav" onClick={onSignOut}><span className="ic">↩</span><span className="tx">Sign out</span></div>
        </div>
      </nav>
      <div className={`main view-${view}`}>
        <div className="topbar">
          <div className="topbar-title"><span>PERSONAL OS</span><strong>{view === "home" ? "Dashboard" : NAV.find(n=>n.k===view)?.t || view}</strong></div>
          <div className="row" style={{gap:6,flexWrap:"wrap"}}>
            {["home","nutrition","study"].includes(view) && <>
              <button className="btn ghost sm" onClick={()=>shiftDate(-1)}>‹</button>
              <input className="in" type="date" value={selDate} max={today()} onChange={e=>setSelDate(e.target.value)} style={{width:150}}/>
              <button className="btn ghost sm" onClick={()=>shiftDate(1)} disabled={selDate>=today()}>›</button>
              <button className="btn ghost sm" onClick={()=>setSelDate(today())}>Today</button>
            </>}
            <span className="in" style={{ padding:"6px 12px" }}>{clock}</span>
            <span className="build-mark" title="build marker — bump this to verify a deploy went live">build&nbsp;112</span>
          </div>
        </div>
        <div className="content"><Boundary key={view}><div className={`dashboard-screen screen-${view}`}>
          {view==="today" && <TodayView settings={sett} tick={tick} onNavigate={setView} />}
          {view==="home" && <Home sett={sett} tick={tick} date={selDate} />}
          {view==="weekly" && <WeeklyReview settings={sett} tick={tick} />}
          {view==="health" && <Health sett={sett} refresh={refresh} tick={tick} />}
          {view==="exercise" && <ExerciseWorkspace tracker={<Fitness />} />}
          {view==="nutrition" && <NutritionWorkspace settings={sett} tracker={<Nutrition sett={sett} refresh={refresh} tick={tick} date={selDate} />} />}
          {view==="study" && <Study sett={sett} refresh={refresh} tick={tick} date={selDate} />}
          {view==="english" && <EnglishWorkspace practice={<English />} />}
          {view==="gmail" && <GmailWorkspace />}
          {view==="calendar" && <Calendar sett={sett} tick={tick} />}
          {view==="goals" && <Goals sett={sett} tick={tick} />}
          {view==="settings" && <Settings sett={sett} save={saveSett} />}
        </div></Boundary></div>
      </div>
    </div>
  );
}

/* ---------- shared ---------- */
const Chip = ({ tint, children }: any) => <div className={"ic-chip tint-"+tint}>{children}</div>;
function Kpi({ lbl, val, unit, ic, tint, sub }: any) {
  return <div className="card kpi"><div className="between"><div className="lbl">{lbl}</div><Chip tint={tint}>{ic}</Chip></div>
    <div className="val">{val}{unit && <small> {unit}</small>}</div>{sub && <div className="muted" style={{fontSize:11,marginTop:8}}>{sub}</div>}</div>;
}
function Head({ t, p }: any) { return <div className="head"><h1>{t}</h1><p>{p}</p></div>; }
function Bar({ v, goal, color }: any) { const p = goal? Math.min(v/goal*100,100):0; return <div className="bar"><span style={{width:p+"%",background:color}} /></div>; }

/* ---------- charts ---------- */
const PIE_COLORS = ["#3B82F6","#10B981","#F59E0B","#A855F7","#EC4899","#06B6D4"];
const TT = { background:"#0f172a", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, color:"#E7ECF3" } as any;
function last7(){ const out:{name:string;ds:string}[]=[]; for(let i=6;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); const ds=`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; out.push({name:["Su","Mo","Tu","We","Th","Fr","Sa"][x.getDay()],ds}); } return out; }
function PieCard({ title, data }: { title:string; data:{name:string;value:number}[] }) {
  const empty = data.every(d=>!d.value);
  return <div className="card"><strong>{title}</strong>
    <div style={{height:230,marginTop:6}}>{empty? <div className="muted" style={{textAlign:"center",paddingTop:92}}>No data yet — log some to see the chart</div> :
      <ResponsiveContainer width="100%" height="100%"><PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
          {data.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
        </Pie><Tooltip contentStyle={TT}/></PieChart></ResponsiveContainer>}</div>
    <div className="row" style={{flexWrap:"wrap",gap:12,marginTop:6}}>{data.map((d,i)=><span key={i} className="muted" style={{fontSize:12}}><span style={{display:"inline-block",width:10,height:10,borderRadius:3,background:PIE_COLORS[i%PIE_COLORS.length],marginRight:6}}/>{d.name}: {d.value}</span>)}</div>
  </div>;
}
function BarCard({ title, data, color }: { title:string; data:{name:string;value:number}[]; color:string }) {
  return <div className="card"><strong>{title}</strong><div style={{height:230,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false} width={30}/>
      <Tooltip cursor={{fill:"rgba(255,255,255,.05)"}} contentStyle={TT}/>
      <RBar dataKey="value" fill={color} radius={[6,6,0,0]}/>
    </BarChart></ResponsiveContainer></div></div>;
}
function LineCard({ title, data, color }: { title:string; data:{name:string;value:number}[]; color:string }) {
  return <div className="card"><strong>{title}</strong><div style={{height:230,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false}/>
      <YAxis domain={["auto","auto"]} tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false} width={34}/>
      <Tooltip contentStyle={TT}/>
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{r:3,fill:color}}/>
    </LineChart></ResponsiveContainer></div></div>;
}

/* ---------- HOME ---------- */
function Home({ sett, tick, date }: any) {
  const D = date || today(); const viewing = D !== today();
  const w = LS("pos_weight", [{date:today(),kg:97}]); const cur = w[w.length-1].kg;
  const nt = nutTotals(D); const st = studyTotal(D);
  const H = LS("pos_health", {});
  const plan = LS("pos_plan_"+D, {});
  const steps = +(H.steps||0); const recovery = +(H.recovery||0);
  const stepPct = Math.min(100,Math.round(steps/Math.max(1,sett.stepGoal)*100));
  const proteinPct = Math.min(100,Math.round(nt.protein/Math.max(1,sett.proteinGoal)*100));
  const caloriePct = Math.min(100,Math.round(nt.cal/Math.max(1,sett.calorieGoal)*100));
  const studyPct = Math.min(100,Math.round(st/120*100));
  const score = Math.round((stepPct+proteinPct+studyPct+(recovery||50))/4);
  const start = new Date(sett.planStart); const dayNo = Math.max(1, Math.floor((new Date(D).getTime()-start.getTime())/86400000)+1);
  const h = new Date().getHours(); const greet = h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  const pretty = new Date(D).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  const exAll = (plan.exSessions||[]); const gymEx = exAll.find((s:any)=>GYM_TYPES.includes(s.type)); const walkEx = exAll.find((s:any)=>s.type==="Walk"); const ex = gymEx || exAll[0];
  const woLabel = gymEx ? `${gymEx.type} + Walk` : (walkEx ? "Rest day · Walk only" : `${PPL[new Date().getDay()]} workout`);
  const woDetail = gymEx ? `11,000-step walk · ${(gymEx.selected||[]).length} ${gymEx.type} exercises` : (walkEx ? "11,000-step walk" : "Open Goals to plan");
  const woDone = gymEx ? (!!gymEx.done && (walkEx ? !!walkEx.done : true)) : (walkEx ? !!walkEx.done : false);
  const studies=(plan.studyList||[]).slice(0,2); const meals=plan.meals||{};
  const stTasks=(plan.studyList||[]).flatMap((s:any)=>Array.isArray(s.plan)?s.plan:[]); const stDone=stTasks.filter((t:any)=>t.done).length; const stTaskPct=stTasks.length?Math.round(stDone/stTasks.length*100):studyPct;
  const stLabel=(plan.studyList||[])[0]?.label||(plan.studyList||[])[0]?.title||(plan.studyList||[])[0]?.name||"Study session";
  const stDetail=stTasks.length?`${stDone}/${stTasks.length} tasks done${st?` · ${fmt(st)}`:""}`:(st?`${fmt(st)} completed`:"120 min target");
  const cprog=studyProgress(); const cList=[["Agentic AI",cprog.courses.agentic],["System Design",cprog.courses.sysdesign],["DSA",cprog.courses.dsa]].filter((c:any)=>c[1]&&c[1].total>0) as any[];
  const todayTasks=[
    {ic:"🚶",label:"Daily steps",detail:`${steps.toLocaleString()} / ${sett.stepGoal.toLocaleString()}`,pct:stepPct,color:"#10B981"},
    {ic:"🏋️",label:woLabel,detail:woDetail,pct:woDone?100:0,color:"#8B5CF6"},
    {ic:"🍗",label:"Protein target",detail:`${nt.protein} / ${sett.proteinGoal} g`,pct:proteinPct,color:"#F59E0B"},
    {ic:"📚",label:stLabel,detail:stDetail,pct:stTaskPct,color:"#3B82F6"},
    {ic:"🗣️",label:"English practice",detail:"Speaking · pronunciation · fluency",pct:0,color:"#A855F7"},
  ];
  return <>
    <Head t={viewing? `Dashboard — ${pretty}` : `${greet}, ${sett.name}`} p={viewing? `Viewing a past day · Day ${dayNo} of your ${sett.planDays}-day plan` : `${pretty} · Your health, training, nutrition and learning command center`} />
    <div className="dashboard-kpis">
      <div className="card score-card"><div><div className="dash-label">TODAY SCORE</div><div className="dash-number blue">{score}</div><div className="muted">{score>=80?"Great progress":score>=60?"Building momentum":"Start with one task"}</div></div><div className="score-ring" style={{"--score":`${score*3.6}deg`} as any}><span>{score}</span></div></div>
      <div className="card metric-card"><div className="dash-label">WEIGHT</div><div className="dash-number">{cur}<small> kg</small></div><div className="metric-good">Target {sett.weightGoal} kg</div><div className="mini-line">{w.slice(-12).map((x:any,i:number)=><i key={i} style={{height:Math.max(8,34-(x.kg-cur)*6)}}/> )}</div></div>
      <div className="card metric-card"><div className="dash-label">STEPS</div><div className="dash-number green">{steps.toLocaleString()}</div><div className="muted">of {sett.stepGoal.toLocaleString()} steps</div><Bar v={steps} goal={sett.stepGoal} color="#22c55e"/></div>
      <div className="card metric-card"><div className="dash-label">RECOVERY</div><div className="dash-number violet">{recovery||"—"}{recovery?"%":""}</div><div className="muted">Sleep {H.sleepH||0}h {H.sleepM||0}m · RHR {H.restingHR||"—"}</div><Bar v={recovery} goal={100} color="#8b5cf6"/></div>
    </div>
    <div className="dashboard-main-grid">
      <div className="card today-plan"><div className="section-title"><div><strong>Today&apos;s Plan</strong><span>Day {dayNo} of {sett.planDays}</span></div><span className="status-pill">{PPL[new Date().getDay()]} day</span></div>
        <div className="task-stack">{todayTasks.map((x,i)=><div className="plan-task" key={i}><span className="task-icon" style={{background:x.color+"1f",color:x.color}}>{x.ic}</span><div className="task-copy"><b>{x.label}</b><small>{x.detail}</small></div><div className="task-progress"><span style={{width:x.pct+"%",background:x.color}}/></div><span className={x.pct>=100?"task-state done":"task-state"}>{x.pct>=100?"✓":"○"}</span></div>)}</div>
      </div>
      <div className="dashboard-side-stack">
        <div className="card compact-card"><div className="section-title"><strong>Calories &amp; Macros</strong><span>{sett.calorieGoal} kcal goal</span></div><div className="macro-overview"><div className="macro-ring" style={{"--macro":`${caloriePct*3.6}deg`} as any}><b>{nt.cal}</b><small>kcal</small></div><div className="macro-bars"><div><span>Protein</span><b>{nt.protein}/{sett.proteinGoal}g</b></div><Bar v={nt.protein} goal={sett.proteinGoal} color="#22c55e"/><div><span>Carbs</span><b>{nt.carbs}/{sett.carbGoal}g</b></div><Bar v={nt.carbs} goal={sett.carbGoal} color="#3b82f6"/><div><span>Fat</span><b>{nt.fat}/{sett.fatGoal}g</b></div><Bar v={nt.fat} goal={sett.fatGoal} color="#f59e0b"/></div></div></div>
        <div className="card compact-card"><div className="section-title"><strong>Today&apos;s Workout</strong><span>{ex?.type||PPL[new Date().getDay()]}</span></div><div className="workout-preview"><span className="workout-orb">🏋️</span><div><b>{ex?.type||PPL[new Date().getDay()]} Day</b><small>{(ex?.selected||[]).length||6} exercises · ~55 min</small></div></div><div className="workout-list">{((ex?.selected||[]).slice(0,3)).map((x:any,i:number)=><span key={i}>{i+1}. {x.name} <b>{x.sets}×{x.reps}</b></span>)}{!ex&&<><span>1. Main compound lift <b>4×8</b></span><span>2. Secondary movement <b>3×10</b></span><span>3. Accessory work <b>3×12</b></span></>}</div></div>
        <div className="card compact-card"><div className="section-title"><strong>Course Progress</strong><span>{cprog.tasksDone}/{cprog.tasksTotal} tasks</span></div>
          {cList.length? <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>{cList.map(([nm,c]:any,i:number)=>{ const pct=c.total?Math.round(c.done/c.total*100):0; return <div key={i}><div className="between" style={{fontSize:12,marginBottom:4}}><b style={{color:"#E7ECF3"}}>{nm}</b><span className="muted">{c.done}/{c.total} days{pct>=100?" ✓":""}</span></div><Bar v={c.done} goal={c.total} color={pct>=100?"#22c55e":"#8B5CF6"}/></div>; })}</div> : <div className="muted" style={{fontSize:12,marginTop:8}}>Tick your study tasks in Goals — course completion shows here.</div>}
        </div>
      </div>
    </div>
    <div className="grid g3 dashboard-charts" style={{marginTop:14}}>
      <LineCard title="7-Day Weight Trend" color="#3B82F6" data={w.slice(-12).map((x:any)=>({name:x.date.slice(5),value:x.kg}))}/>
      <BarCard title="Study — last 7 days" color="#8B5CF6" data={last7().map(x=>({name:x.name,value:Math.round(studyTotal(x.ds)/60*10)/10}))}/>
      <BarCard title="Calories — last 7 days" color="#F59E0B" data={last7().map(x=>({name:x.name,value:nutTotals(x.ds).cal}))}/>
    </div>
  </>;
}
function studyByK(k:string){ const s=loadStudy(today()); return s[k]||0; }

/* ---------- HEALTH ---------- */
function Health({ sett, refresh, tick }: any) {
  const H = LS("pos_health", {}); const w = LS("pos_weight",[{date:today(),kg:97}]); const cur = w[w.length-1].kg;
  const hM = ((sett.heightFt*12+sett.heightIn)*2.54)/100; const bmi = hM? +(cur/(hM*hM)).toFixed(1):0;
  const set = (k:string,v:any)=>{ const n={...H,[k]:+v||0}; SS("pos_health",n); refresh(); };
  const setW=(v:any)=>{ const arr=LS("pos_weight",[{date:today(),kg:97}]); arr[arr.length-1].kg=+v||0; SS("pos_weight",arr); refresh(); };
  const F=(lbl:string,val:any,on:(v:any)=>void)=> <div><div className="lbl muted" style={{marginBottom:6}}>{lbl}</div><input className="in" type="number" defaultValue={val} onBlur={e=>on(e.target.value)} style={{width:"100%"}}/></div>;
  return <>
    <Head t="Health" p={`Body composition & vitals · ${sett.age}y · ${sett.heightFt}'${sett.heightIn}"`} />
    <div className="grid g4">
      <Kpi lbl="Weight" ic="⚖️" tint="emerald" val={cur} unit="kg" sub={`Goal ${sett.weightGoal}kg`} />
      <Kpi lbl="BMI" ic="📐" tint="blue" val={bmi} sub={bmi<18.5?"Underweight":bmi<25?"Healthy":bmi<30?"Overweight":"High"} />
      <Kpi lbl="Recovery" ic="🌙" tint="cyan" val={H.recovery||0} unit="%" sub={`Sleep ${H.sleepH||0}h ${H.sleepM||0}m`} />
      <Kpi lbl="Resting HR" ic="❤️" tint="pink" val={H.restingHR||0} unit="bpm" />
    </div>
    <div className="card" style={{marginTop:16}}><strong>Log vitals</strong>
      <div className="grid g4" style={{marginTop:12}}>
        {F("Weight (kg)",cur,setW)}{F("Recovery %",H.recovery||0,(v)=>set("recovery",v))}{F("Resting HR",H.restingHR||0,(v)=>set("restingHR",v))}{F("Sleep h",H.sleepH||0,(v)=>set("sleepH",v))}
        {F("Sleep m",H.sleepM||0,(v)=>set("sleepM",v))}{F("Water (L)",H.water||0,(v)=>set("water",v))}{F("Cal burned",H.caloriesBurned||0,(v)=>set("caloriesBurned",v))}{F("Steps",H.steps||0,(v)=>set("steps",v))}
      </div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineCard title="Weight trend (kg)" color="#10B981" data={w.map((x:any)=>({name:x.date.slice(5),value:x.kg}))}/>
      <PieCard title="Recovery vs remaining" data={[{name:"Recovery",value:H.recovery||0},{name:"Remaining",value:Math.max(0,100-(H.recovery||0))}]}/>
    </div>
  </>;
}

/* ---------- EXERCISE ---------- */
const LIB:Record<string,string[]> = {
  Push:["Barbell Bench Press","Incline Dumbbell Press","Overhead Press","Dumbbell Lateral Raise","Rope Pushdown","Skull Crushers","Chest Dips"],
  Pull:["Deadlift","Pull-ups","Lat Pulldown","Barbell Row","Seated Cable Row","Barbell Curl","Hammer Curl","Face Pull"],
  Legs:["Back Squat","Leg Press","Romanian Deadlift","Walking Lunges","Leg Curl","Hip Thrust","Standing Calf Raise"],
};
function Exercise({ sett, refresh, tick }: any) {
  const [type,setType]=useState(PPL[new Date().getDay()]==="Recovery"?"Push":PPL[new Date().getDay()]);
  const [sess,setSess]=useState<any[]>([]);
  const H=LS("pos_health",{}); const setH=(k:string,v:any)=>{SS("pos_health",{...H,[k]:+v||0});refresh();};
  const runs=LS("pos_runs",[]);
  const add=()=>{ const el=(id:string)=>(document.getElementById(id) as HTMLInputElement); const ex=el("exName").value;
    const wt=+el("exW").value||0,s=+el("exS").value||0,r=+el("exR").value||0;
    setSess(x=>[...x,{name:ex,weight:wt,sets:s,reps:r,rpe:+el("exRPE").value||0,vol:wt*s*r}]); ["exW","exS","exR","exRPE"].forEach(i=>el(i).value=""); };
  const save=()=>{ if(!sess.length)return; const wk=LS("pos_workouts",[]); wk.unshift({date:today(),type,exercises:sess,volume:sess.reduce((a,x)=>a+x.vol,0)}); SS("pos_workouts",wk); setSess([]); refresh(); };
  const addRun=()=>{ const el=(id:string)=>(document.getElementById(id) as HTMLInputElement); const type=(document.getElementById("rType") as HTMLSelectElement)?.value||"Walk"; const dist=+el("rDist").value||0,dur=+el("rDur").value||0; if(!dist&&!dur)return;
    const r=LS("pos_runs",[]); r.push({date:el("rDate").value||today(),type,dist,dur}); SS("pos_runs",r); el("rDist").value="";el("rDur").value=""; refresh(); };
  const logWeight=()=>{ const el=document.getElementById("wLog") as HTMLInputElement; const v=+el.value; if(!(v>0))return; const arr=LS("pos_weight",[{date:today(),kg:97}]); const i=arr.findIndex((x:any)=>x.date===today()); if(i>=0)arr[i].kg=v; else arr.push({date:today(),kg:v}); SS("pos_weight",arr); el.value=""; refresh(); };
  const F=(lbl:string,k:string)=> <div><div className="lbl muted" style={{marginBottom:6}}>{lbl}</div><input className="in" type="number" defaultValue={H[k]||0} onBlur={e=>setH(k,e.target.value)} style={{width:"100%"}}/></div>;
  return <>
    <Head t="Exercise" p="Push · Pull · Legs — twice weekly" />
    <div className="card"><strong>Today&apos;s Activity</strong>
      <div className="grid g4" style={{marginTop:12}}>{F("Steps","steps")}{F("Distance (km)","distance")}{F("Floors","floors")}{F("Active Zone Min","azm")}{F("Walking min","walkMin")}{F("Running min","runMin")}{F("Calories Burned","caloriesBurned")}{F("Resting HR","restingHR")}</div>
    </div>
    <div className="card" style={{marginTop:16}}>
      <div className="between"><strong>Gym Tracker — {type}</strong>
        <select className="in" value={type} onChange={e=>setType(e.target.value)} style={{minWidth:230}}>
          <option value="Push">🟦 Push — Chest · Shoulders · Triceps</option>
          <option value="Pull">🟪 Pull — Back · Biceps · Rear delts</option>
          <option value="Legs">🟩 Legs — Quads · Hams · Glutes · Calves</option>
        </select></div>
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        <select className="in" id="exName" style={{flex:1,minWidth:200}}>{(LIB[type]||[]).map(x=><option key={x} value={x}>{(type==="Push"?"🟦":type==="Pull"?"🟪":"🟩")+" "+x}</option>)}</select>
        <input className="in" id="exW" type="number" placeholder="kg" style={{width:80}}/><input className="in" id="exS" type="number" placeholder="sets" style={{width:80}}/>
        <input className="in" id="exR" type="number" placeholder="reps" style={{width:80}}/><input className="in" id="exRPE" type="number" placeholder="RPE" style={{width:80}}/>
        <button className="btn" onClick={add}>Log set</button></div>
      <ul className="list" style={{marginTop:10}}>{sess.length? sess.map((x,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--purple)"}}/><div style={{flex:1}} className="between"><span>🏋️ {x.name}</span><span className="muted">{x.weight}kg · {x.sets}×{x.reps} · {x.vol}vol</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>No sets yet.</li>}</ul>
      <div className="between" style={{marginTop:10}}><span className="muted" style={{fontSize:12}}>{sess.reduce((a,x)=>a+x.sets,0)} sets · {sess.reduce((a,x)=>a+x.vol,0)} kg volume</span><button className="btn ghost sm" onClick={save}>Save session</button></div>
    </div>
    <div className="card" style={{marginTop:16}}><strong>🚶 Walk / Run / Cardio</strong>
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        <select className="in" id="rType" style={{width:120}}><option>Walk</option><option>Run</option><option>Cycle</option><option>Other</option></select>
        <input className="in" id="rDate" type="date" defaultValue={today()} style={{width:150}}/>
        <input className="in" id="rDist" type="number" placeholder="Distance km" style={{width:120}}/>
        <input className="in" id="rDur" type="number" placeholder="Duration min" style={{width:130}}/>
        <button className="btn sm" onClick={addRun}>Add</button></div>
      <ul className="list" style={{marginTop:10}}>{runs.length? runs.slice(-8).reverse().map((r:any,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--emerald)"}}/><div style={{flex:1}} className="between"><span>{iconFor(r.type)} {r.type||"Walk"} · {r.date}</span><span className="muted">{r.dist} km · {r.dur} min</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>No walks/runs logged yet.</li>}</ul>
    </div>
    <div className="card" style={{marginTop:16}}><strong>⚖️ Log today&apos;s weight</strong>
      <div className="row" style={{marginTop:12,gap:8,flexWrap:"wrap"}}><input className="in" id="wLog" type="number" step="0.1" placeholder="Weight kg" style={{width:150}}/><button className="btn sm" onClick={logWeight}>Log weight</button><span className="muted" style={{fontSize:12}}>Latest: {LS("pos_weight",[{kg:96}]).slice(-1)[0].kg} kg · adds to the trend chart</span></div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <PieCard title="Volume by day type (kg)" data={[{name:"Push",value:volType("Push")},{name:"Pull",value:volType("Pull")},{name:"Legs",value:volType("Legs")}]}/>
      <BarCard title="Session volume (kg)" color="#3B82F6" data={LS("pos_workouts",[]).slice(0,7).reverse().map((w:any)=>({name:(w.date||"").slice(5),value:w.volume||0}))}/>
    </div>
    <div style={{marginTop:16}}><LineCard title="Weight trend (kg)" color="#10B981" data={LS("pos_weight",[{date:today(),kg:97}]).map((x:any)=>({name:(x.date||"").slice(5),value:x.kg}))}/></div>
    <PlanCalendar sett={sett}/>
  </>;
}
function iconFor(t:string){ return t==="Run"?"🏃":t==="Cycle"?"🚴":t==="Other"?"🤸":"🚶"; }
function volType(t:string){ let s=0; LS("pos_workouts",[]).forEach((w:any)=>{ if(w.type===t) s+=w.volume||0; }); return s; }

/* ---------- NUTRITION ---------- */
function nutKey(d:string){return "pos_nutri_"+d;}
function loadNut(d:string){return LS(nutKey(d),{meals:[],water:0});}
function nutTotals(d:string){const n=loadNut(d);const t={cal:0,protein:0,carbs:0,fat:0,fiber:0};n.meals.forEach((m:any)=>{t.cal+=m.cal||0;t.protein+=m.protein||0;t.carbs+=m.carbs||0;t.fat+=m.fat||0;t.fiber+=m.fiber||0;});return t;}
function Nutrition({ sett, refresh, tick, date }: any) {
  const D=date||today(); const n=loadNut(D); const t=nutTotals(D);
  const [busy,setBusy]=useState(false);
  const [estimateNote,setEstimateNote]=useState("");
  const [paste,setPaste]=useState("");
  const [photoBusy,setPhotoBusy]=useState(false); const [photoMsg,setPhotoMsg]=useState("");
  // shrink the image in the browser so the upload stays well under the request size limit
  const compress=(file:File):Promise<string>=>new Promise((resolve,reject)=>{
    const rd=new FileReader();
    rd.onerror=()=>reject(new Error("read"));
    rd.onload=()=>{ const img=new Image(); img.onerror=()=>reject(new Error("img"));
      img.onload=()=>{ const max=1024; let{width:w,height:h}=img; if(w>h&&w>max){h=Math.round(h*max/w);w=max;} else if(h>max){w=Math.round(w*max/h);h=max;}
        const c=document.createElement("canvas"); c.width=w; c.height=h; const ctx=c.getContext("2d"); if(!ctx){reject(new Error("ctx"));return;} ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",0.7)); };
      img.src=rd.result as string; };
    rd.readAsDataURL(file);
  });
  const onPhoto=async(file:File|undefined)=>{ if(!file) return; setPhotoBusy(true); setPhotoMsg("Analysing photo…");
    try{
      const image=await compress(file);
      const r=await fetch("/api/food-photo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image})});
      if(!r.ok){ setPhotoMsg(`Upload failed (${r.status}). Try a smaller/clearer photo.`); setPhotoBusy(false); return; }
      const d=await r.json();
      if(d && !d.error && (d.cal||d.protein||d.carbs)){ const g=Math.round(d.grams||0); const nm=(d.name||"Photo meal")+(g?` (~${g}g)`:""); const m=loadNut(D); m.meals.push({name:nm,grams:g,cal:Math.round(d.cal||0),protein:Math.round(d.protein||0),carbs:Math.round(d.carbs||0),fat:Math.round(d.fat||0),fiber:Math.round(d.fiber||0)}); SS(nutKey(D),m); refresh(); setPhotoMsg(`Added ✓ ${d.name||"meal"}${g?` · ~${g}g`:""} · ${Math.round(d.cal||0)} kcal`); }
      else setPhotoMsg(d.error||"Couldn't read that photo — try a clearer shot.");
    }catch(e:any){ setPhotoMsg("Photo read failed ("+(e?.message||"error")+")."); }
    setPhotoBusy(false);
  };
  const importPaste=()=>{ const text=paste; if(!text.trim())return;
    const num=(re:RegExp)=>{const m=text.match(re);return m?parseFloat(m[1]):0;};
    const macro={ cal:Math.round(num(/calor\w*[^0-9-]*([\d.]+)/i)), protein:Math.round(num(/protein[^0-9-]*([\d.]+)/i)), carbs:Math.round(num(/carb\w*[^0-9-]*([\d.]+)/i)), fat:Math.round(num(/\bfat[^0-9-]*([\d.]+)/i)), fiber:Math.round(num(/fib\w*[^0-9-]*([\d.]+)/i)) };
    if(!(macro.cal||macro.protein||macro.carbs||macro.fat||macro.fiber)){ alert("Couldn't find nutrition numbers in the pasted text."); return; }
    const m=loadNut(D); m.meals.push({name:"Pasted total", ...macro}); SS(nutKey(D),m); setPaste(""); refresh(); };
  const add=async()=>{ const el=(id:string)=>(document.getElementById(id) as HTMLInputElement); const name=el("nName").value.trim(); if(!name)return;
    let cal=+el("nCal").value||0; let p=+el("nP").value||0,c=+el("nC").value||0,f=+el("nF").value||0,fb=+el("nFb").value||0;
    if(!(cal||p||c||f||fb)){
      setBusy(true);
      try{ const r=await fetch("/api/nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({food:name})}); const d=await r.json(); if(!r.ok)throw new Error(d.error||"Estimate failed"); cal=d.cal||0;p=d.protein||0;c=d.carbs||0;f=d.fat||0;fb=d.fiber||0;setEstimateNote(`${d.source==="ai"?"AI estimate":"Reference estimate"}: ${d.assumption||"Review the values before relying on them."}`); }catch(e){setEstimateNote(e instanceof Error?e.message:"Estimate failed");}
      setBusy(false);
    } else if(!cal){ cal=Math.round(p*4+c*4+f*9); }
    const m=loadNut(D); m.meals.push({name,cal,protein:p,carbs:c,fat:f,fiber:fb}); SS(nutKey(D),m);
    ["nName","nCal","nP","nC","nF","nFb"].forEach(i=>el(i).value=""); refresh(); };
  const del=(i:number)=>{ const m=loadNut(D); m.meals.splice(i,1); SS(nutKey(D),m); refresh(); };
  const water=(d:number)=>{ const m=loadNut(D); m.water=Math.max(0,Math.round((m.water+d)*100)/100); SS(nutKey(D),m); refresh(); };
  const R=(lbl:string,v:number,g:number,color:string,u:string)=><div className="card"><div className="between"><div className="lbl muted">{lbl}</div></div><div className="val" style={{fontSize:24,fontWeight:760,marginTop:6}}>{v}<small className="muted"> /{g}{u}</small></div><Bar v={v} goal={g} color={color}/></div>;
  return <>
    <Head t="Nutrition" p="Track calories, macros, water & meals" />
    <div className="grid g3" style={{marginBottom:16}}>
      <div className="panel">
        <div className="panel-h"><div className="t">🎯 Calorie Goal</div></div>
        <div className="row" style={{gap:18,alignItems:"center"}}>
          <div className="ring lg" style={{["--p" as any]:Math.min(100,Math.round(t.cal/Math.max(1,sett.calorieGoal)*100)),["--c" as any]:"#f59e0b"}}><div className="rc"><b>{t.cal}</b><small>of {sett.calorieGoal}</small></div></div>
          <div style={{flex:1,minWidth:0}}>
            {[["Protein",t.protein,sett.proteinGoal,"grad-green"],["Carbs",t.carbs,sett.carbGoal,"grad-blue"],["Fat",t.fat,sett.fatGoal,"grad-orange"]].map((x:any)=>(
              <div className="stat" key={x[0]}><span className="sl">{x[0]}</span><span className="track"><i className={x[3]} style={{width:Math.min(100,Math.round(x[1]/Math.max(1,x[2])*100))+"%"}}/></span><span className="sv">{x[1]} / {x[2]} g</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><div className="t">💧 Water Tracker</div></div>
        <div style={{fontSize:22,fontWeight:800}}>{n.water}<small className="muted" style={{fontSize:13,fontWeight:600}}> / {sett.waterGoal} L</small></div>
        <div className="glasses">{Array.from({length:Math.max(8,Math.round(sett.waterGoal/0.25))}).map((_,i)=><span key={i} className={"glass"+(i<Math.round(n.water/0.25)?" on":"")}/>)}</div>
        <div className="row" style={{marginTop:14,gap:8}}><button className="btn ghost sm" onClick={()=>water(-0.25)}>−250ml</button><button className="btn sm" onClick={()=>water(0.25)}>+ Add Water</button></div>
      </div>
      <div className="panel">
        <div className="panel-h"><div className="t">🍽️ Meal Timeline</div></div>
        {n.meals.length? <div className="mealline">{n.meals.slice(0,4).map((m:any,i:number)=><div className="meal" key={i}><div className="mimg">{["🍳","🥗","🍎","🍲"][i]||"🍽️"}</div><span className="mt">{String(m.name).slice(0,12)}</span><span className="mk">{m.cal} kcal</span></div>)}</div> : <div className="muted" style={{fontSize:12,marginTop:20}}>No meals logged yet — add one below and it appears here.</div>}
      </div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <div className="card"><strong>Log a meal</strong>
        <div className="row" style={{marginTop:12}}><input className="in" id="nName" placeholder="Food name" style={{flex:1}}/></div>
        <div className="row" style={{marginTop:8,flexWrap:"wrap",gap:8}}><input className="in" id="nCal" type="number" placeholder="Calories" style={{width:100}}/><input className="in" id="nP" type="number" placeholder="Protein g" style={{width:100}}/><input className="in" id="nC" type="number" placeholder="Carbs g" style={{width:95}}/><input className="in" id="nF" type="number" placeholder="Fat g" style={{width:85}}/><input className="in" id="nFb" type="number" placeholder="Fiber g" style={{width:90}}/><button className="btn" onClick={add} disabled={busy}>{busy?"🤖 Fetching…":"Add meal"}</button></div>
        <div className="muted" style={{fontSize:11,margin:"6px 0"}}>Type just the food name and hit Add — AI estimates the macros. All estimates are editable and may vary by portion or preparation.</div>
        {estimateNote&&<div style={{fontSize:11,margin:"8px 0",padding:8,borderRadius:8,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)"}}>ℹ️ {estimateNote}</div>}
        <div style={{marginTop:6,padding:10,borderRadius:12,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)"}}>
          <div className="row" style={{gap:8,flexWrap:"wrap"}}><span>📷</span><strong style={{fontSize:13}}>Snap a food photo</strong>
            <label className="btn ghost sm" style={{cursor:"pointer",marginLeft:"auto"}}>{photoBusy?"🤖 Analysing…":"Upload / take photo"}<input type="file" accept="image/*" capture="environment" style={{display:"none"}} disabled={photoBusy} onChange={e=>onPhoto(e.target.files?.[0])}/></label>
          </div>
          <div className="muted" style={{fontSize:11,marginTop:6}}>{photoMsg||"Take or upload a picture of your plate — Claude estimates the calories & macros and adds it."}</div>
        </div>
        <ul className="list">{n.meals.length? n.meals.map((m:any,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--orange)"}}/><div style={{flex:1}}><div className="between"><strong>{m.name}</strong><span>{m.cal} kcal</span></div><div className="muted" style={{fontSize:12}}>P {m.protein}g · C {m.carbs}g · F {m.fat}g · Fiber {m.fiber}g</div></div><span className="btn ghost sm" onClick={()=>del(i)} style={{cursor:"pointer"}}>✕</span></li>):<li className="muted" style={{padding:"8px 0"}}>No meals logged today.</li>}</ul>
      </div>
      <div className="card"><div className="between"><strong>Hydration</strong><Chip tint="cyan">💧</Chip></div>
        <div className="val" style={{fontSize:26,fontWeight:770,marginTop:12}}>{n.water}<small className="muted"> /{sett.waterGoal}L</small></div>
        <Bar v={n.water} goal={sett.waterGoal} color="var(--cyan)"/>
        <div className="row" style={{marginTop:12}}><button className="btn ghost sm" onClick={()=>water(-0.25)}>−250ml</button><button className="btn sm" onClick={()=>water(0.25)}>+250ml</button></div>
        <div style={{marginTop:14}} className="muted">Fiber {t.fiber}g / {sett.fiberGoal}g</div><Bar v={t.fiber} goal={sett.fiberGoal} color="var(--emerald)"/>
      </div>
    </div>
    <div className="card" style={{marginTop:16}}><div className="between"><strong>📋 Paste &amp; Import</strong><span className="muted" style={{fontSize:12}}>paste a totals table or log</span></div>
      <textarea className="in" value={paste} onChange={e=>setPaste(e.target.value)} placeholder={"Paste like:\nCalories ~837 kcal\nProtein ~55.6 g\nCarbohydrates ~134.3 g\nFat ~10.4 g\nFiber ~21.5 g"} style={{width:"100%",minHeight:120,marginTop:8}}/>
      <div style={{marginTop:8}}><button className="btn" onClick={importPaste}>Read &amp; add to today</button></div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <PieCard title="Macro split (today)" data={[{name:"Protein",value:t.protein},{name:"Carbs",value:t.carbs},{name:"Fat",value:t.fat}]}/>
      <BarCard title="Calories — last 7 days" color="#F59E0B" data={last7().map(x=>({name:x.name,value:nutTotals(x.ds).cal}))}/>
    </div>
  </>;
}

/* ---------- STUDY ---------- */
function studyKey(d:string){return "pos_study_"+d;}
function loadStudy(d:string){return LS(studyKey(d),{});}
function studyTotal(d:string){const s=loadStudy(d);return Object.keys(s).reduce((a,k)=>a+(s[k]||0),0);}
function fmt(m:number){m=Math.round(m||0);return Math.floor(m/60)+"h "+(m%60)+"m";}
function streak(){let n=0;const d=new Date();for(;;){const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;if(studyTotal(ds)>0){n++;d.setDate(d.getDate()-1);}else break;if(n>400)break;}return n;}
const SUBJ=[{k:"ai",label:"Artificial Intelligence"},{k:"devops",label:"DevOps"},{k:"system",label:"System Design"}];
function Study({ sett, refresh, tick }: any) {
  useEffect(()=>{ if(LS("pos_seed_all","")==="v1") return; courseStart(); seedAllCourses(undefined,false); SS("pos_seed_all","v1"); refresh(); },[refresh]);
  return <StudyDashboard settings={sett} tick={tick} onRefresh={refresh} planner={<GoalPlanner sett={sett} mode="study"/>} coursePlanner={<CoursePlanner/>} curriculum={<Curriculum/>}/>;
}

// Retained temporarily as a compatibility reference while the dedicated study modules settle.
function StudyLegacyAnalytics({ sett, refresh, tick, date }: any) {
  const D=date||today(); const s=loadStudy(D); const weekend=[0,6].includes(new Date(D).getDay()); const goal=weekend?300:240;
  useEffect(()=>{ if(LS("pos_seed_all","")==="v1") return; courseStart(); seedAllCourses(undefined,false); SS("pos_seed_all","v1"); refresh(); },[refresh]);
  const log=(k:string,v:number)=>{ if(!(v>0))return; const d=loadStudy(D); d[k]=(d[k]||0)+v; SS(studyKey(D),d); refresh(); };
  const cur=LS("pos_curriculum",seedCurr()); if(!LS("pos_curriculum",null)) SS("pos_curriculum",cur);
  return <>
    <Head t="Study" p="AI · DevOps · System Design" />
    {(()=>{ const pr=studyProgress(); const cs=[["Agentic AI",pr.courses.agentic,"#22c55e"],["System Design",pr.courses.sysdesign,"#a855f7"],["DSA",pr.courses.dsa,"#f59e0b"]].filter((c:any)=>c[1]&&c[1].total>0);
      if(!cs.length) return null;
      return <div className="panel" style={{marginBottom:16}}>
        <div className="panel-h"><div className="t">📚 Course Progress</div><span className="lk">{pr.tasksDone}/{pr.tasksTotal} tasks done</span></div>
        <div className="row" style={{gap:16,flexWrap:"wrap",justifyContent:"space-around"}}>{cs.map((c:any,i:number)=>{ const pct=c[1].total?Math.round(c[1].done/c[1].total*100):0; return <div key={i} style={{textAlign:"center"}}><div className="ring sm" style={{["--p" as any]:pct,["--c" as any]:c[2]}}><div className="rc"><b>{pct}%</b></div></div><div style={{fontSize:12,fontWeight:700,marginTop:8}}>{c[0]}</div><div className="muted" style={{fontSize:10}}>{c[1].done}/{c[1].total} days</div></div>; })}</div>
      </div>; })()}
    <div className="grid g3">
      <Kpi lbl="Study" ic="⏱️" tint="purple" val={fmt(studyTotal(D))} sub={`Goal ${goal}m`} />
      <Kpi lbl="Streak" ic="🔥" tint="orange" val={streak()} unit="days" />
      <Kpi lbl="This Week" ic="📅" tint="blue" val={fmt(weekStudy())} sub={weekend?"~34h target":"~28h target"} />
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      {SUBJ.map(su=>{const g=weekend?(su.k==="ai"?150:su.k==="devops"?90:60):(su.k==="ai"?120:60);const m=s[su.k]||0;return (
        <div className="card" key={su.k}><strong>{su.label}</strong><div className="val" style={{fontSize:22,fontWeight:750,marginTop:8}}>{fmt(m)}</div><Bar v={m} goal={g} color="var(--purple)"/>
          <div className="row" style={{marginTop:10}}><input className="in" id={"st_"+su.k} type="number" placeholder="+min" style={{width:90}}/><button className="btn sm" onClick={()=>{const el=document.getElementById("st_"+su.k) as HTMLInputElement;log(su.k,+el.value);el.value="";}}>Log</button></div>
        </div>);})}
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <PieCard title="Study split (today)" data={[{name:"AI",value:s.ai||0},{name:"DevOps",value:s.devops||0},{name:"System",value:s.system||0}]}/>
      <BarCard title="Study — last 7 days (hrs)" color="#A855F7" data={last7().map(x=>({name:x.name,value:Math.round(studyTotal(x.ds)/60*10)/10}))}/>
    </div>
    {(()=>{ const pr=studyProgress(); const rows=[pr.courses.agentic,pr.courses.sysdesign,pr.courses.dsa,pr.courses.other].filter((c:any)=>c.total>0);
      return <div className="card" style={{marginTop:16}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}><strong>📚 Study Plan Progress</strong><span className="muted" style={{fontSize:12}}>{pr.tasksDone}/{pr.tasksTotal} tasks done · from your Goals plan</span></div>
        {rows.length? rows.map((c:any)=>{ const pct=c.total?Math.round(c.done/c.total*100):0; return <div key={c.label} style={{marginTop:12}}>
          <div className="between" style={{fontSize:13,marginBottom:4}}><span>{c.label}</span><b>{c.done}/{c.total} days · {pct}%</b></div>
          <Bar v={c.done} goal={c.total} color="var(--purple)"/>
        </div>; }) : <div className="muted" style={{fontSize:13,marginTop:8}}>No study plan yet — add subjects or courses in Goals, tick tasks done, and progress shows here.</div>}
        {pr.recent.length>0 && <div style={{marginTop:16}}><div className="muted" style={{fontSize:11,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Recently completed</div>
          <ul className="list">{pr.recent.map((r:any,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--emerald)"}}/><div style={{flex:1}} className="between"><span style={{fontSize:13}}>✅ {r.label}</span><span className="muted" style={{fontSize:11}}>{r.date}</span></div></li>)}</ul>
        </div>}
      </div>; })()}
    <div style={{marginTop:16}}><CoursePlanner /></div>
    <GoalPlanner sett={sett} mode="study" />
    <Curriculum />
  </>;
}
function weekStudy(){let t=0;const d=new Date();for(let i=0;i<7;i++){const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;t+=studyTotal(ds);d.setDate(d.getDate()-1);}return t;}
function studyProgress(){
  const courses:any={agentic:{label:"🤖 Agentic AI",done:0,total:0},sysdesign:{label:"🗄️ System Design",done:0,total:0},dsa:{label:"🧩 DSA (Srivastava)",done:0,total:0},other:{label:"📚 Other subjects",done:0,total:0}};
  let tasksDone=0, tasksTotal=0; const recent:any[]=[]; const base=new Date();
  for(let i=-200;i<=260;i++){ const d=new Date(base); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const pl:any=LS("pos_plan_"+ds,null); if(!pl||!Array.isArray(pl.studyList)) continue;
    pl.studyList.forEach((s:any)=>{ const cid=courses[s.courseId]?s.courseId:"other"; courses[cid].total++; const tasks=s.plan||[]; tasksTotal+=tasks.length; const dn=tasks.filter((t:any)=>t.done).length; tasksDone+=dn; const complete=tasks.length>0 && dn===tasks.length; if(complete){ courses[cid].done++; recent.push({date:ds,label:s.label}); } });
  }
  recent.sort((a,b)=> a.date<b.date?1:-1);
  return { courses, tasksDone, tasksTotal, recent:recent.slice(0,12) };
}
function seedCurr(){const mk=(a:string[])=>a.map((topic,i)=>({topic,date:"",status:"todo"}));return{
  ai:mk(["Python & math foundations","ML fundamentals","Deep Learning (NN/CNN/RNN)","NLP & Transformers","LLMs & fine-tuning","RAG","Agents & tool use","MLOps & deployment","Capstone"]),
  devops:mk(["Linux & shell","Git & CI/CD","Docker","Kubernetes","Terraform/IaC","Observability","Cloud (AWS/GCP)","Security","Capstone"]),
  system:mk(["Scalability & latency","Databases & sharding","Caching & CDN","Load balancing & queues","Microservices & APIs","CAP & consistency","URL shortener / rate limiter","Feed & chat design","Mock interviews"]),
};}
function Curriculum(){
  const [subj,setSubj]=useState("ai"); const [,force]=useState(0);
  const cur=LS("pos_curriculum",seedCurr());
  const upd=(i:number,f:string,v:string)=>{cur[subj][i][f]=v;SS("pos_curriculum",cur);force(x=>x+1);};
  return <div className="card" style={{marginTop:16}}><div className="between"><strong>Structured Curriculum</strong>
    <select className="in" value={subj} onChange={e=>setSubj(e.target.value)}><option value="ai">AI</option><option value="devops">DevOps</option><option value="system">System Design</option></select></div>
    <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}><tbody>
      {cur[subj].map((it:any,i:number)=><tr key={i} style={{borderTop:"1px solid rgba(255,255,255,.06)"}}>
        <td style={{padding:"8px 6px"}}>{it.topic}</td>
        <td style={{padding:"8px 6px",width:150}}><input className="in" type="date" defaultValue={it.date} onBlur={e=>upd(i,"date",e.target.value)} style={{width:"100%"}}/></td>
        <td style={{padding:"8px 6px",width:130}}><select className="in" defaultValue={it.status} onChange={e=>upd(i,"status",e.target.value)} style={{width:"100%"}}><option value="todo">To do</option><option value="doing">In progress</option><option value="done">Done</option></select></td>
      </tr>)}
    </tbody></table></div>;
}

/* ---------- GMAIL (live) ---------- */
function Gmail(){
  const [q,setQ]=useState("is:unread in:inbox"); const [msgs,setMsgs]=useState<any[]|null>(null); const [err,setErr]=useState("");
  const [reply,setReply]=useState<Record<string,string>>({}); const [status,setStatus]=useState<Record<string,string>>({});
  const load=(query:string)=>{ setMsgs(null);setErr(""); fetch("/api/gmail?q="+encodeURIComponent(query)).then(r=>r.json()).then(d=>{ if(d.error){setErr(d.error);setMsgs([]);}else setMsgs(d.messages||[]); }).catch(e=>{setErr(String(e));setMsgs([]);}); };
  useEffect(()=>{load("is:unread in:inbox");},[]);
  const emailOf=(s:string)=>{const m=s.match(/<([^>]+)>/);return (m?m[1]:s).trim();};
  const nameOf=(s:string)=>{const m=s.match(/^\s*"?([^"<]+?)"?\s*</);return m?m[1].trim():s.split("@")[0];};
  const saveDraft=async(m:any)=>{ const body=reply[m.id]||""; if(!body.trim()){setStatus(s=>({...s,[m.id]:"Write something first"}));return;}
    setStatus(s=>({...s,[m.id]:"Saving…"}));
    const r=await fetch("/api/gmail/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:emailOf(m.from),subject:m.subject.startsWith("Re:")?m.subject:"Re: "+m.subject,body,threadId:m.threadId})});
    const d=await r.json(); setStatus(s=>({...s,[m.id]:d.ok?"✓ Draft saved in Gmail":"Error: "+(d.error||"failed")})); };
  return <>
    <Head t="Gmail" p="Live inbox — replies save as Gmail drafts" />
    <div className="row" style={{marginBottom:16,flexWrap:"wrap",gap:8}}>
      {[["Unread","is:unread in:inbox"],["Starred","is:starred"],["Important","is:important"],["Today","in:inbox newer_than:1d"]].map(b=>
        <button key={b[1]} className="btn ghost sm" onClick={()=>{setQ(b[1]);load(b[1]);}}>{b[0]}</button>)}
      <input className="in" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:180}}/><button className="btn sm" onClick={()=>load(q)}>Search</button>
    </div>
    <div className="card">
      {msgs===null && <div className="muted">Loading inbox…</div>}
      {err && <div style={{color:"var(--pink)"}}>{err}</div>}
      {msgs && msgs.length===0 && !err && <div className="muted">No matching emails.</div>}
      <ul className="list">{(msgs||[]).map(m=><li className="li" key={m.id}><span className="dot" style={{background:"var(--sky)"}}/>
        <div style={{flex:1,minWidth:0}}>
          <strong style={{fontSize:13}}>{nameOf(m.from)}</strong>
          <div style={{fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.subject}</div>
          <div className="muted" style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.snippet}</div>
          <div style={{marginTop:8}}><textarea className="in" placeholder={"Reply to "+nameOf(m.from)+"…"} value={reply[m.id]||""} onChange={e=>setReply(s=>({...s,[m.id]:e.target.value}))} style={{width:"100%",minHeight:60}}/>
            <div className="row" style={{marginTop:6}}><button className="btn sm" onClick={()=>saveDraft(m)}>Save as Gmail draft</button><span className="muted" style={{fontSize:12}}>{status[m.id]||""}</span></div></div>
        </div></li>)}</ul>
    </div>
  </>;
}

/* ---------- CALENDAR (live) ---------- */
function Calendar({ sett, tick }: any) {
  const [today_,setToday]=useState<any[]|null>(null); const [week,setWeek]=useState<any[]|null>(null); const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/calendar?days=1").then(r=>r.json()).then(d=>{if(d.error)setErr(d.error);setToday(d.events||[]);}).catch(e=>setErr(String(e)));
    fetch("/api/calendar?days=7").then(r=>r.json()).then(d=>setWeek(d.events||[])).catch(()=>{}); },[]);
  const t=(e:any)=> e.allDay? "All day" : new Date(e.start).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
  return <>
    <Head t="Calendar" p="Live from Google Calendar" />
    {err && <div className="card" style={{color:"var(--pink)",marginBottom:16}}>{err}</div>}
    <div className="grid g2">
      <div className="card"><strong>Today</strong><ul className="list">{today_===null?<li className="muted" style={{padding:"8px 0"}}>Loading…</li>:today_.length?today_.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--violet)"}}/><div style={{flex:1}} className="between"><strong style={{fontSize:13}}>{e.summary}</strong><span className="muted" style={{fontSize:11}}>{t(e)}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Clear day 🎯</li>}</ul></div>
      <div className="card"><strong>Next 7 days</strong><ul className="list">{week===null?<li className="muted" style={{padding:"8px 0"}}>Loading…</li>:week.length?week.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--blue)"}}/><div style={{flex:1}} className="between"><strong style={{fontSize:13}}>{e.summary}</strong><span className="muted" style={{fontSize:11}}>{e.allDay?"":new Date(e.start).toLocaleDateString(undefined,{weekday:"short",hour:"numeric",minute:"2-digit"})}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Nothing scheduled.</li>}</ul></div>
    </div>
    <Cal120 />
    <PlanCalendar sett={sett}/>
  </>;
}
/* ---------- 120-day calendar outlook ---------- */
function Cal120(){
  const [events,setEvents]=useState<any[]|null>(null); const [err,setErr]=useState("");
  const [sel,setSel]=useState<string>("");
  useEffect(()=>{ fetch("/api/calendar?days=120").then(r=>r.json()).then(d=>{ if(d.error)setErr(d.error); setEvents(d.events||[]); }).catch(e=>setErr(String(e))); },[]);
  const byDay:Record<string,any[]>={}; (events||[]).forEach(e=>{ const ds=(e.start||"").slice(0,10); if(!ds)return; (byDay[ds]=byDay[ds]||[]).push(e); });
  const cells=[]; for(let i=0;i<120;i++){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; const n=(byDay[ds]||[]).length;
    const bg=n===0?"rgba(255,255,255,.05)":n<=1?"rgba(59,130,246,.4)":n<=3?"rgba(59,130,246,.7)":"rgba(59,130,246,1)";
    cells.push(<div key={i} onClick={()=>setSel(ds)} title={`${ds} · ${n} event${n===1?"":"s"}`} style={{aspectRatio:"1",borderRadius:5,background:bg,cursor:"pointer",outline:ds===sel?"2px solid #fff":ds===today()?"1px solid rgba(255,255,255,.4)":"none"}}/>); }
  const scheduled=Object.keys(byDay).length; const free=120-scheduled;
  const selList=sel?(byDay[sel]||[]):[];
  return <div className="card" style={{marginTop:16}}>
    <div className="between" style={{flexWrap:"wrap",gap:8}}><strong>Next 120 days — schedule outlook</strong>
      <div className="row" style={{gap:14}}><span className="muted" style={{fontSize:12}}>Scheduled <b style={{color:"#E7ECF3"}}>{scheduled}</b> days</span><span className="muted" style={{fontSize:12}}>Free <b style={{color:"#E7ECF3"}}>{free}</b> days</span></div>
    </div>
    {err && <div className="muted" style={{color:"var(--pink)",fontSize:12,marginTop:8}}>{err}</div>}
    {events===null? <div className="muted" style={{padding:"10px 0"}}>Loading 120-day outlook…</div> :
      <><div className="cal-grid" style={{gridTemplateColumns:"repeat(20,1fr)"}}>{cells}</div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Bluer = more events. Tap a day to see what's on it.</div>
      {sel && <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <strong style={{fontSize:13}}>{sel}</strong>
        <ul className="list">{selList.length? selList.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--violet)"}}/><div style={{flex:1}} className="between"><span style={{fontSize:13}}>{e.summary}</span><span className="muted" style={{fontSize:11}}>{e.allDay?"All day":new Date(e.start).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Free day — nothing scheduled 🎯</li>}</ul>
      </div>}</>}
  </div>;
}
function PlanCalendar({ sett }: any) {
  const start=new Date(sett.planStart); const done:Record<string,boolean>={}; LS("pos_workouts",[]).forEach((w:any)=>done[w.date]=true);
  const col:Record<string,string>={Push:"var(--blue)",Pull:"var(--purple)",Legs:"var(--emerald)",Recovery:"var(--mut2)"};
  const cells=[]; for(let i=0;i<sett.planDays;i++){const d=new Date(start);d.setDate(d.getDate()+i);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const sp=PPL[d.getDay()];const act=done[ds]||studyTotal(ds)>0;
    cells.push(<div key={i} className={"cal-cell"+(sp==="Recovery"?" rest":"")+(ds===today()?" today":"")} title={`Day ${i+1} · ${ds} · ${sp}`}><div className="cd">{i+1}</div><div className="cs" style={{color:col[sp]}}>{sp[0]}</div>{act && <div style={{position:"absolute",top:2,right:3,color:"var(--emerald)",fontSize:9}}>✓</div>}</div>);}
  return <div className="card" style={{marginTop:16}}><strong>{sett.planDays}-Day Plan Calendar</strong><div className="cal-grid">{cells}</div></div>;
}

/* ---------- GOALS ---------- */
function Goals({ sett, tick }: any) {
  const start=new Date(sett.planStart); const dayNo=Math.max(0,Math.floor((Date.now()-start.getTime())/86400000)); const pct=Math.min(100,Math.round(dayNo/sett.planDays*100));
  useEffect(()=>{ if(LS("pos_seed_all","")==="v2dsa") return; const t=dstrD(new Date()); SS("pos_course_start",t); const [y,m,d]=t.split("-").map(Number); seedAllCourses(new Date(y,m-1,d),true); SS("pos_seed_all","v2dsa"); },[]);
  useEffect(()=>{ const v=LS("pos_seed_workout",""); if(v==="v3") return; SS("pos_workout_start","2026-09-01"); seedWorkoutPlan(new Date(2026,8,1),125,true); SS("pos_seed_workout","v3"); },[]);
  return <>
    <Head t="Goals" p={`${sett.planDays}-day transformation`} />
    <div className="card" style={{background:"linear-gradient(120deg,rgba(236,72,153,.15),rgba(99,102,241,.12))"}}>
      <div className="between"><strong>{sett.planDays}-Day Transformation</strong><span className="in" style={{padding:"4px 10px"}}>{sett.planDays-dayNo} days left</span></div>
      <div className="val" style={{fontSize:30,fontWeight:770,marginTop:10}}>{pct}%</div><Bar v={pct} goal={100} color="linear-gradient(90deg,var(--pink),var(--indigo))"/>
      <div className="muted" style={{marginTop:6}}>Day {dayNo} of {sett.planDays} · started {sett.planStart}</div>
    </div>
    <GoalPlanner sett={sett} mode="goals"/>
    <PlanCalendar sett={sett}/>
  </>;
}
/* ---------- 120-day daily goal planner ---------- */
function planKey(d:string){ return "pos_plan_"+d; }
const dstrD=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function seedStart(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function purgeCourse(cid:string){ const base=new Date(); for(let i=-90;i<=200;i++){ const d=new Date(base); d.setDate(d.getDate()+i); const ds=dstrD(d); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.studyList)&&c.studyList.some((x:any)=>x.courseId===cid)) SS(planKey(ds),{...c,studyList:c.studyList.filter((x:any)=>x.courseId!==cid)}); } }
const PLAN_DEF:any={exSessions:[],meals:{breakfast:[],lunch:[],dinner:[]},studyList:[],journal:""};
function loadPlan(d:string){ const raw:any=LS(planKey(d),{}); const mealArr=(g:string)=>Array.isArray(raw.meals?.[g])?raw.meals[g]:[];
  return {...PLAN_DEF, ...raw, exSessions:Array.isArray(raw.exSessions)?raw.exSessions:[], studyList:Array.isArray(raw.studyList)?raw.studyList:[], meals:{breakfast:mealArr("breakfast"),lunch:mealArr("lunch"),dinner:mealArr("dinner")}, journal:raw.journal||""}; }
const EX_TYPES=["Rest","Push","Pull","Legs","Arms","Cardio","Walk","HIIT","Yoga"];
const SESS_EMOJI:Record<string,string>={Walk:"🚶",Push:"🤚",Pull:"🏋️",Legs:"🦵",Arms:"💪",Rest:"😴",Cardio:"🏃",HIIT:"⚡",Yoga:"🧘"};
const SESS_GRAD:Record<string,string>={Walk:"linear-gradient(120deg,rgba(34,197,94,.22),rgba(16,185,129,.14))",Push:"linear-gradient(120deg,rgba(239,68,68,.20),rgba(249,115,22,.14))",Pull:"linear-gradient(120deg,rgba(59,130,246,.22),rgba(139,92,246,.16))",Legs:"linear-gradient(120deg,rgba(168,85,247,.20),rgba(59,130,246,.14))",Arms:"linear-gradient(120deg,rgba(236,72,153,.20),rgba(139,92,246,.14))",Rest:"linear-gradient(120deg,rgba(148,163,184,.18),rgba(100,116,139,.12))",Cardio:"linear-gradient(120deg,rgba(249,115,22,.20),rgba(234,179,8,.14))"};
const P_PUSH=["Bench Press","Incline Bench Press","Decline Bench Press","Flat Dumbbell Press","Incline Dumbbell Press","Machine Chest Press","Cable Fly","Incline Cable Fly","Pec Deck Fly","Push-ups","Dips","Overhead Shoulder Press","Seated Dumbbell Shoulder Press","Arnold Press","Military Press","Lateral Raise","Cable Lateral Raise","Front Raise","Rear Delt Fly","Upright Row","Tricep Pushdown","Rope Pushdown","Overhead Tricep Extension","Skull Crushers","Close-Grip Bench Press"];
const P_PULL=["Deadlift","Barbell Row","Pendlay Row","T-Bar Row","Seated Cable Row","Single Arm Dumbbell Row","Lat Pulldown","Wide-Grip Lat Pulldown","Close-Grip Pulldown","Pull-ups","Chin-ups","Face Pull","Straight-Arm Pulldown","Shrugs","Barbell Curl","Dumbbell Curl","Hammer Curl","Preacher Curl","Incline Dumbbell Curl","Concentration Curl","Cable Curl","Reverse Curl","Spider Curl","Farmer Walk"];
const P_LEGS=["Squat","Front Squat","Hack Squat","Leg Press","Bulgarian Split Squat","Walking Lunges","Reverse Lunges","Goblet Squat","Leg Extension","Romanian Deadlift","Stiff-Leg Deadlift","Lying Hamstring Curl","Seated Leg Curl","Hip Thrust","Glute Bridge","Cable Glute Kickback","Sumo Deadlift","Standing Calf Raise","Seated Calf Raise","Step-ups","Adductor Machine","Abductor Machine","Box Jumps"];
const P_ARMS=["EZ-Bar Curl","Barbell Curl","Incline Dumbbell Curl","Hammer Curl","Preacher Curl","Cable Curl","Concentration Curl","Spider Curl","Close-Grip Bench Press","Tricep Pushdown","Rope Pushdown","Overhead Tricep Extension","Skull Crushers","Dips","Overhead Cable Tricep Extension","Reverse Curl","Zottman Curl","Kickbacks"];
const EX_LIB:Record<string,string[]>={Push:P_PUSH,Pull:P_PULL,Legs:P_LEGS,Arms:P_ARMS};
const WORKOUT_CYCLE=["Push","Pull","Legs","Rest","Push","Pull","Legs","Arms"];
const GYM_TYPES=["Push","Pull","Legs","Arms"];
function workoutStart(){ let s=LS("pos_workout_start",""); if(!s){ s=dstrD(new Date()); SS("pos_workout_start",s); } const [y,m,d]=String(s).split("-").map(Number); const dt=new Date(y,m-1,d); dt.setHours(0,0,0,0); return dt; }
function seedWorkoutPlan(start?:Date, days:number=125, overwrite:boolean=true){
  const s0=start||workoutStart();
  for(let i=0;i<days;i++){
    const d=new Date(s0); d.setDate(d.getDate()+i); const ds=dstrD(d); const key=planKey(ds);
    const cur:any=LS(key,{}); let list=Array.isArray(cur.exSessions)?cur.exSessions:[];
    const has=list.some((s:any)=>s.seeded);
    if(!overwrite && has) continue;
    if(overwrite) list=list.filter((s:any)=>!s.seeded);
    const type=WORKOUT_CYCLE[i%WORKOUT_CYCLE.length];
    const sessions:any[]=[{id:uid(),seeded:true,time:"06:30",type:"Walk",done:false,steps:"11000",distance:"",duration:"",detail:"11,000-step walk",selected:[]}];
    if(type!=="Rest"){ const lib=EX_LIB[type]||[]; sessions.push({id:uid(),seeded:true,time:"18:00",type,done:false,steps:"",distance:"",duration:"",detail:type+" day",selected:lib.slice(0,7).map((n:string)=>({name:n,sets:"3",reps:"10",weight:"",note:""}))}); }
    SS(key,{...cur,exSessions:[...sessions,...list]});
  }
}
const COURSES=["AI / ML","Interview Prep","Data Structures & Algorithms","System Design","DevOps","Cloud","Frontend","Other"];
const ENGLISH_TOPICS=["Advanced present tenses (simple vs continuous nuance)","Past tenses mastery (past simple vs present perfect)","Perfect tenses (present/past perfect & continuous)","Future forms (will vs going to vs present continuous)","Articles a/an/the — advanced usage","Prepositions of time & place — tricky cases","Prepositions with verbs & adjectives (depend on, good at)","Phrasal verbs — everyday (get, take, put)","Phrasal verbs — work & business","Idioms & how to use them naturally","Conditionals (0,1,2,3)","Mixed & inverted conditionals","Reported speech","Passive voice — when & how","Modal verbs — ability, permission, obligation","Modals of deduction & probability (must, might, can't)","Collocations — natural word pairs","Connectors & linking words (however, therefore)","Relative clauses (defining & non-defining)","Gerunds vs infinitives","Formal vs informal English","Polite English & softening language","Small talk & everyday conversation","Describing people & personality","Describing places & travel","Narrating a story (sequencing & tenses)","Giving opinions, agreeing & disagreeing","Argument & persuasion language","Comparisons & degrees (as…as, the more…)","Expressing feelings & reactions","Business email English","Meetings & discussions English","Job interview English — common questions","Presentations & public speaking phrases","Telephoning & video calls","Negotiation & making requests","Vocabulary: technology & work","Vocabulary: money & shopping","Vocabulary: health & lifestyle","Pronunciation & word stress","Fix your top common mistakes","Paraphrasing & summarizing","Advanced vocabulary & synonym upgrades","Fluency drills — thinking in English","Review + mock interview + final essay"];
const SCENARIOS=["Free conversation","Job interview","Small talk / networking","At a restaurant","Business meeting","Travel & airport","Doctor's appointment","Debate a topic","Phone / customer service","Making friends","Negotiation","Presentation Q&A"];
function MiniTimer({ minutes }:{ minutes:number }){ const [sec,setSec]=useState(0); const [run,setRun]=useState(false);
  useEffect(()=>{ if(!run) return; const id=setInterval(()=>setSec((s:number)=>s+1),1000); return ()=>clearInterval(id); },[run]);
  const f=(s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; const over=sec>=minutes*60;
  return <span className="row" style={{gap:6}}><span style={{fontSize:13,fontWeight:700,color:over?"#f9a8d4":run?"#6ee7b7":"#8A94A6",fontVariantNumeric:"tabular-nums"}}>⏱ {f(sec)} / {minutes}:00</span><button className="btn ghost sm" onClick={()=>setRun(r=>!r)}>{run?"⏸":"▶"}</button><button className="btn ghost sm" onClick={()=>{setSec(0);setRun(false);}}>↺</button></span>; }
function PRow({ icon, tint, title, action, children }: any){ return <div className="card" style={{marginBottom:14}}>
  <div className="between" style={{gap:10,marginBottom:10,flexWrap:"wrap"}}><div className="row" style={{gap:10}}><Chip tint={tint}>{icon}</Chip><strong style={{fontSize:15}}>{title}</strong></div>{action}</div>{children}</div>; }
const OPT = { background:"#0f172a", color:"#E7ECF3" } as any;
const uid=()=>Math.random().toString(36).slice(2,9);
const firstUrl=(s:string)=>{ const m=String(s||"").match(/https?:\/\/\S+/); return m?m[0]:""; };
function mdToHtml(md:string){ const escc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const inline=(t:string)=> escc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/`(.+?)`/g,'<code>$1</code>');
  const lines=String(md||"").split(/\r?\n/); let html=""; let ul=false;
  for(const raw of lines){ const l=raw.trim();
    if(/^#{1,6}\s/.test(l)){ if(ul){html+="</ul>";ul=false;} const lvl=(l.match(/^#+/)||["#"])[0].length; const txt=l.replace(/^#+\s/,""); html+=`<h${lvl<=2?4:5} style="font-size:${lvl<=2?17:15}px;margin:16px 0 6px;color:#c4b5fd">${inline(txt)}</h${lvl<=2?4:5}>`; continue; }
    if(/^([-*]|\d+\.)\s/.test(l)){ if(!ul){html+="<ul style='margin:6px 0 6px 18px'>";ul=true;} html+=`<li style="margin:3px 0">${inline(l.replace(/^([-*]|\d+\.)\s/,""))}</li>`; continue; }
    if(ul){html+="</ul>";ul=false;}
    if(l==="") continue;
    html+=`<p style="margin:6px 0;line-height:1.7">${inline(l)}</p>`;
  }
  if(ul) html+="</ul>"; return html;
}
function printNotes(title:string, html:string){ const w=window.open("","_blank"); if(!w) return;
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:Georgia,serif;max-width:760px;margin:32px auto;padding:0 24px;color:#111;line-height:1.7}h1{font-size:22px}h4{color:#4338ca;margin:16px 0 6px}h5{color:#4338ca}code{background:#f2f2f2;padding:1px 4px;border-radius:4px}ul{margin:6px 0 6px 18px}</style></head><body><h1>${title}</h1>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`); w.document.close();
}
const COURSE_RES=[
  "Course video: https://www.youtube.com/watch?v=rV3HJ4LEZ7k",
  "LangChain: https://github.com/krishnaik06/Langchain-V1-Crash-Course",
  "LangGraph: https://github.com/krishnaik06/Agentic-LanggraphCrash-course",
  "RAG / Vectorless RAG: https://github.com/krishnaik06/RAG-Tutorials",
  "Guardrails: https://github.com/krishnaik06/Langchain-V1-Crash-Course/blob/main/updatedlangchain/langchain_guardrails_crash_course.ipynb",
  "LLM Evals: https://github.com/krishnaik06/RAG-Tutorials/blob/main/1-rag_evaluation.ipynb",
  "Agentic AI Roadmap: https://github.com/krishnaik06/Roadmap-To-Learn-Agentic-AI",
].join("\n");
const YT="https://www.youtube.com/watch?v=rV3HJ4LEZ7k";
const GH_LC="https://github.com/krishnaik06/Langchain-V1-Crash-Course";
const GH_LG="https://github.com/krishnaik06/Agentic-LanggraphCrash-course";
const GH_RAG="https://github.com/krishnaik06/RAG-Tutorials";
const GH_GUARD="https://github.com/krishnaik06/Langchain-V1-Crash-Course/blob/main/updatedlangchain/langchain_guardrails_crash_course.ipynb";
const GH_EVAL="https://github.com/krishnaik06/RAG-Tutorials/blob/main/1-rag_evaluation.ipynb";
const GH_ROAD="https://github.com/krishnaik06/Roadmap-To-Learn-Agentic-AI";
/* 15-day Agentic AI course plan (Krish Naik, 10h video) — 1.5h/day, ~40min video + practice */
const AGENTIC_COURSE=[
  {title:"LangChain setup & intro",brief:"Install LangChain v1, understand chat models, messages, and your first chain.",link:GH_LC,timing:"0:00–0:40"},
  {title:"Prompts, LCEL & output parsers",brief:"Prompt templates, the LangChain Expression Language (|) and structured output parsers.",link:GH_LC,timing:"0:40–1:20"},
  {title:"Memory, tools & tool-calling",brief:"Add conversation memory and let the model call tools/functions.",link:GH_LC,timing:"1:20–2:00"},
  {title:"LangGraph basics — state, nodes, edges",brief:"Model an app as a graph: state, nodes and edges; run your first graph.",link:GH_LG,timing:"2:00–2:40"},
  {title:"LangGraph — conditional edges, cycles, checkpoints",brief:"Branching, loops and persistence so agents can reason over multiple steps.",link:GH_LG,timing:"2:40–3:20"},
  {title:"Building agents with LangGraph (ReAct)",brief:"Assemble a tool-using ReAct agent with LangGraph.",link:GH_LG,timing:"3:20–4:00"},
  {title:"RAG fundamentals — loaders & chunking",brief:"Document loaders and text splitting/chunking for retrieval.",link:GH_RAG,timing:"4:00–4:40"},
  {title:"Embeddings & vector stores",brief:"Turn chunks into embeddings and store/query them in a vector DB.",link:GH_RAG,timing:"4:40–5:20"},
  {title:"Retrievers & full RAG pipeline",brief:"Wire retriever + LLM into an end-to-end RAG question-answering chain.",link:GH_RAG,timing:"5:20–6:00"},
  {title:"Vectorless RAG",brief:"Retrieval without a vector database — when and how to use it.",link:GH_RAG,timing:"6:00–6:40"},
  {title:"Deep Agents (planning / multi-step)",brief:"Deep/multi-agent patterns for complex planning tasks.",link:GH_LG,timing:"6:40–7:20"},
  {title:"Guardrails",brief:"Add input/output guardrails for safe, reliable LLM apps.",link:GH_GUARD,timing:"7:20–8:00"},
  {title:"LLM Evaluation",brief:"Evaluate RAG/agent quality — metrics and running evals.",link:GH_EVAL,timing:"8:00–8:40"},
  {title:"LLM Gateways & putting it together",brief:"Gateways/routing and integrating everything into one app.",link:GH_ROAD,timing:"8:40–9:20"},
  {title:"Capstone project & review",brief:"Build a small end-to-end agentic RAG app and review the whole course.",link:GH_ROAD,timing:"9:20–10:00"},
];
const SD_VIDEO="https://www.youtube.com/watch?v=Vnm-ycSfJx4";
const SD_DOCS="https://docs.telusko.com/docs/system-design/getting-started";
const SYSDESIGN_COURSE=[
  {title:"What is System Design",brief:"What system design is, why it matters, and functional vs non-functional requirements."},
  {title:"Scalability - Vertical vs Horizontal",brief:"Scaling up one machine vs scaling out to many; why stateless services scale."},
  {title:"Load Balancing",brief:"Spreading traffic across servers; algorithms, health checks, L4 vs L7."},
  {title:"Caching",brief:"Cache layers, hit/miss, eviction (LRU/LFU/TTL), and write strategies."},
  {title:"CDN & Content Delivery",brief:"Edge servers that serve static content near users; invalidation & TTLs."},
  {title:"SQL vs NoSQL Databases",brief:"Relational vs document/key-value/wide-column/graph; choosing by access pattern."},
  {title:"Database Replication",brief:"Leader-follower, async vs sync, failover, and read replicas."},
  {title:"Sharding / Partitioning",brief:"Splitting data by a shard key; strategies and hotspots."},
  {title:"Indexing",brief:"B-tree indexes to speed reads; the write/storage trade-off."},
  {title:"CAP Theorem & Consistency",brief:"Consistency vs availability under partitions; strong vs eventual."},
  {title:"Message Queues & Async",brief:"Decoupling with Kafka/RabbitMQ/SQS; pub/sub and idempotency."},
  {title:"Rate Limiting",brief:"Token/leaky bucket, sliding window, 429s, Redis counters."},
  {title:"Consistent Hashing",brief:"Hash ring + virtual nodes so scaling moves little data."},
  {title:"Monolith vs Microservices",brief:"Architecture trade-offs; data ownership and when to split."},
  {title:"API Design & Gateway",brief:"REST design, versioning, pagination, and the API gateway's role."},
  {title:"Proxies - Forward & Reverse",brief:"Forward vs reverse proxies; TLS, caching, load balancing."},
  {title:"Blob / Object Storage",brief:"Storing large files (S3/GCS); metadata in DB, presigned URLs, CDN."},
  {title:"Search - Elasticsearch",brief:"Inverted index, full-text search, keeping the index in sync."},
  {title:"Reliability & Observability",brief:"Monitoring/logging/tracing; retries, timeouts, circuit breakers, SLOs."},
  {title:"Case Study & Review",brief:"End-to-end design (e.g. URL shortener); bottlenecks and full review."},
];
const DSA_BOOK="📘 Data Structures Through C in Depth — S. K. Srivastava & Deepali Srivastava (BPB). Find the book: https://www.google.com/search?q=Data+Structures+Through+C+in+Depth+Srivastava";
// 45-day plan mapped to the book "Data Structures Through C in Depth" (S.K. & Deepali Srivastava).
// Each day: read = book section + page range; steps = elaborate read → trace → code(C) → test → complexity.
const dstep=(read:string,concepts:string,code:string,test:string,extra:string)=>[
  {time:"20 min",task:`Read ${read} — focus on: ${concepts}. Underline definitions and every diagram (the book is in C — read for the concept, you'll code it in Python).`},
  {time:"10 min",task:`Dry-run on paper: ${test}. Trace the references/indexes step by step before coding.`},
  {time:"40 min",task:`Code in Python from scratch: ${code}. Use classes & lists (no pointers needed); run it and fix errors.`},
  {time:"15 min",task:`Test with your own input, then note the time & space complexity. ${extra}`},
  {time:"5 min",task:"Write 3-line notes in your own words and commit the .py file with the day number."},
];
const DSA_COURSE=[
  {title:"Ch1 · Introduction to Data Structures",read:"Ch1 §1.1–1.6 · pp 1–9",brief:"Data types, abstract data types (ADT), data structures, algorithms and how we measure efficiency (time/space).",plan:dstep("Ch1 §1.1–1.6 · pp 1–9","ADT vs data structure, primitive vs non-primitive, algorithm characteristics, Big-O intuition","a program that computes and prints the growth of n, n log n, n², 2ⁿ for n=1..20 in a table","compare which term dominates as n grows","Practice: classify 5 everyday operations by their Big-O.")},
  {title:"Ch2 · Arrays (1-D & 2-D)",read:"Ch2 §2.1 · pp 10–17",brief:"1-D and 2-D arrays: declaration, accessing, processing, initialization and passing arrays to functions.",plan:dstep("Ch2 §2.1 · pp 10–17","row-major storage, address calculation, passing whole array vs element","functions to (a) find max/min, (b) reverse an array in place, (c) transpose a 2-D matrix","reverse {5,2,9,1,7} and transpose a 3×3 matrix","Practice: address of a[i][j] given base address & size.")},
  {title:"Ch2 · Pointers (→ Python references)",read:"Ch2 §2.2 · pp 18–27",brief:"C pointers, dereferencing, pointer & array duality — mapped to how Python names/references and mutability work.",plan:dstep("Ch2 §2.2 · pp 18–27","in C: *, &, pointer arithmetic; in Python: names bind to objects, mutable vs immutable, id()","a function that mutates a list in place (Python's 'reference' behaviour) and one that index-walks a list to sum it","mutate a list inside a function; sum a list with a manual index loop","Practice: why does reassigning inside a function NOT change the caller's int, but list.append() does?")},
  {title:"Ch2 · Dynamic arrays (C malloc → Python lists)",read:"Ch2 §2.3 · pp 27–34",brief:"C dynamic allocation (malloc/realloc/free) and how Python's list handles the same growth automatically.",plan:dstep("Ch2 §2.3 · pp 27–34","in C: heap, sizeof, free; in Python: list over-allocation & amortized append","a DynamicArray class (fixed-capacity list that doubles capacity on overflow, like the book's realloc)","append 10 items and print each capacity doubling","Practice: why is append amortized O(1) even though resizing is O(n)?")},
  {title:"Ch2 · Structures (C struct → Python class)",read:"Ch2 §2.4 · pp 34–47",brief:"C structures and arrays of structures, expressed as Python classes / dataclasses and lists of objects.",plan:dstep("Ch2 §2.4 · pp 34–47","struct fields → class attributes, array of struct → list of objects, self-referential preview (Node)","a Student class (name, roll, marks) and a list of 5 with add & print functions","find the topper among 5 students","Practice: why do linked-list nodes need a reference to another node of the same type?")},
  {title:"Ch3 · Single Linked List — build & traverse",read:"Ch3 §3.1.1–3.1.4 · pp 48–58",brief:"Node design, creating a list, traversing and searching a single linked list.",plan:dstep("Ch3 §3.1.1–3.1.4 · pp 48–58","Node(data, next), head reference, None termination","a Node class + create(), traverse()/print(), search(key)","build 1→2→3→4 and print it; search for 3","Practice: why is traversal O(n) and access not O(1)?")},
  {title:"Ch3 · Single Linked List — insert/delete/reverse",read:"Ch3 §3.1.3–3.1.6 · pp 53–62",brief:"Insertion at beginning/end/position, deletion by value/position, and reversing the list.",plan:dstep("Ch3 §3.1.3–3.1.6 · pp 53–62","re-linking order, handling head, freeing deleted nodes","insertBegin/insertEnd/insertAt, deleteNode, reverse()","insert at pos 3, delete value 2, reverse the whole list","Practice: draw the pointer moves for reversing 1→2→3.")},
  {title:"Ch3 · Doubly Linked List",read:"Ch3 §3.2 · pp 63–72",brief:"Doubly linked list: prev/next design, creation, traversal, insertion, deletion, reversal.",plan:dstep("Ch3 §3.2 · pp 63–72","two links per node, forward & backward traversal","dll with insertFront/insertEnd/delete and both-direction print","insert 3 nodes, delete the middle, print forward & backward","Practice: how many pointers change on a middle deletion?")},
  {title:"Ch3 · Circular Linked List",read:"Ch3 §3.3–3.4 · pp 72–83",brief:"Circular linked list traversal, insertion, creation, deletion; list with a header node.",plan:dstep("Ch3 §3.3–3.4 · pp 72–83","last→first link, stopping condition, header/sentinel node","circular list with insert/delete and a safe traversal that stops at head","build a 4-node circle, delete one node, traverse once","Practice: why is a circular list handy for round-robin?")},
  {title:"Ch3 · Sorted & Sorting a Linked List",read:"Ch3 §3.5–3.6 · pp 83–98",brief:"Maintaining a sorted linked list; selection & bubble sort on a list by exchanging data and by rearranging links.",plan:dstep("Ch3 §3.5–3.6 · pp 83–98","sorted insert, sort by data vs by relinking","sortedInsert() and bubbleSort-by-links on a linked list","insert into a sorted list; sort 4→1→3→2 by relinking","Practice: which is cheaper — swapping data or relinking? Why?")},
  {title:"Ch3 · Polynomials with Linked Lists",read:"Ch3 §3.9–3.10 · pp 98–107",brief:"Represent and add polynomials using linked lists; array-list vs linked-list trade-offs.",plan:dstep("Ch3 §3.9–3.10 · pp 98–107","term{coeff,exp,next}, merging by exponent","create two polynomials and add them into a third list","add 3x²+2x+5 and 4x²+x","Practice: list 2 advantages and 2 disadvantages of linked lists.")},
  {title:"Ch4 · Stack (array & linked)",read:"Ch4 §4.1 · pp 108–113",brief:"Stack ADT (LIFO): array implementation and linked-list implementation with push/pop/peek.",plan:dstep("Ch4 §4.1 · pp 108–113","top pointer, overflow/underflow, LIFO","stack both ways: array-based and linked-list-based with push/pop/peek/isEmpty","push 1,2,3 then pop all; test overflow on a size-3 array stack","Practice: give 3 real uses of a stack.")},
  {title:"Ch4 · Queue & Circular Queue",read:"Ch4 §4.2–4.3 · pp 114–123",brief:"Queue ADT (FIFO): array & linked implementations; the circular queue to reuse space.",plan:dstep("Ch4 §4.2–4.3 · pp 114–123","front/rear, wrap-around with modulo, full vs empty","a linear queue and a circular queue with enqueue/dequeue","fill & wrap a size-5 circular queue; show it detects full","Practice: why does a plain array queue waste space?")},
  {title:"Ch4 · Deque & Priority Queue",read:"Ch4 §4.4–4.5 · pp 123–139",brief:"Double-ended queue (deque) operations and a simple priority queue.",plan:dstep("Ch4 §4.4–4.5 · pp 123–139","insert/delete at both ends, priority ordering","a deque (both-end insert/delete) and a priority queue by insertion order","run a sequence of both-end operations; dequeue by priority","Practice: how is a priority queue different from a normal queue?")},
  {title:"Ch4 · Expression Conversion (infix→postfix)",read:"Ch4 §4.6 · pp 139–146",brief:"Convert infix to postfix/prefix using a stack; evaluate a postfix expression.",plan:dstep("Ch4 §4.6 · pp 139–146","operator precedence, associativity, stack of operators","infixToPostfix() and evalPostfix() using your stack","convert a*b+c and (a+b)*c; evaluate 2 3 + 4 *","Practice: convert (a+b)*(c-d) by hand, then check with code.")},
  {title:"Ch5 · Recursion — fundamentals",read:"Ch5 §5.1–5.4 · pp 147–162",brief:"How recursion works, the call stack, and classic examples: factorial, GCD, Fibonacci, Towers of Hanoi.",plan:dstep("Ch5 §5.1–5.4 · pp 147–162","base case, recursive case, stack frames","recursive factorial, gcd, fibonacci and Towers of Hanoi","trace Hanoi for 3 disks; print each move","Practice: draw the call tree for fib(5).")},
  {title:"Ch5 · Recursion on strings & lists",read:"Ch5 §5.5 · pp 163–166",brief:"Recursion over strings and linked lists; how recursion is implemented with a stack.",plan:dstep("Ch5 §5.5 · pp 163–166","recursion unwinding, implicit stack","recursively reverse a string and print a linked list in reverse","reverse \"hello\"; print 1→2→3 backwards","Practice: rewrite one of these iteratively with an explicit stack.")},
  {title:"Ch5 · Recursion vs Iteration & tail recursion",read:"Ch5 §5.6–5.9 · pp 166–175",brief:"Recursion vs iteration trade-offs, tail recursion, and direct vs indirect recursion.",plan:dstep("Ch5 §5.6–5.9 · pp 166–175","tail call, converting recursion↔iteration, overhead","a tail-recursive factorial and its iterative twin; an indirect-recursion example","compare both factorials; verify same result","Practice: when is iteration better than recursion?")},
  {title:"Ch6 · Trees — terminology & representation",read:"Ch6 §6.1–6.8 · pp 176–185",brief:"Tree terms, binary/strict/complete/full trees, and array vs linked memory representation.",plan:dstep("Ch6 §6.1–6.8 · pp 176–185","root/leaf/height/level, complete vs full, 2i/2i+1 array mapping","a binary tree node struct and build a small tree by hand in code","build a 7-node tree; store it in an array too","Practice: for a complete tree in an array, find children of index i.")},
  {title:"Ch6 · Binary Tree Traversals (recursive)",read:"Ch6 §6.9 · pp 186–188",brief:"Recursive inorder, preorder and postorder traversals of a binary tree.",plan:dstep("Ch6 §6.9 · pp 186–188","visit order for in/pre/post, left-root-right","recursive inorder/preorder/postorder printers","traverse your 7-node tree all three ways","Practice: from a drawing, write all three traversals by hand.")},
  {title:"Ch6 · Non-recursive traversal & tree building",read:"Ch6 §6.9.1–6.11 · pp 188–201",brief:"Iterative traversals using a stack; build a tree from inorder+preorder; height; expression trees.",plan:dstep("Ch6 §6.9.1–6.11 · pp 188–201","explicit stack traversal, unique reconstruction, height","iterative inorder with a stack and a height() function","reconstruct a tree from given inorder+preorder; compute its height","Practice: why do you need TWO traversals to rebuild a tree?")},
  {title:"Ch6 · Binary Search Tree — search & insert",read:"Ch6 §6.12.1–6.12.4 · pp 202–207",brief:"BST property, traversal gives sorted order, searching and insertion.",plan:dstep("Ch6 §6.12.1–6.12.4 · pp 202–207","left<root<right, O(h) search, insert as a leaf","BST insert() and search(); inorder to prove it's sorted","insert 50,30,70,20,40; search 40; print inorder","Practice: what makes a BST degrade to O(n)?")},
  {title:"Ch6 · BST — deletion (all cases)",read:"Ch6 §6.12.5 · pp 208–214",brief:"Deleting a BST node: leaf, one child, and two children (inorder successor).",plan:dstep("Ch6 §6.12.5 · pp 208–214","three deletion cases, inorder successor/predecessor","BST delete() handling all three cases","delete a leaf, a one-child node, and the root (two children)","Practice: why replace with the inorder successor, not any node?")},
  {title:"Ch6 · Threaded Binary Trees",read:"Ch6 §6.13 · pp 214–224",brief:"Threaded trees for stackless traversal: inorder successor/predecessor, insertion & deletion.",plan:dstep("Ch6 §6.13 · pp 214–224","threads replace NULL links, in-threaded tree","an in-threaded BST with a stackless inorder traversal","traverse an in-threaded tree without recursion/stack","Practice: what problem do threads solve vs plain BST?")},
  {title:"Ch6 · AVL Trees — rotations & insertion",read:"Ch6 §6.14.1–6.14.3 · pp 225–247",brief:"Self-balancing AVL trees: balance factor and LL, RR, LR, RL rotations on insertion.",plan:dstep("Ch6 §6.14.1–6.14.3 · pp 225–247","balance factor, 4 rotation cases","AVL insert() with rotations and a height/balance helper","insert 10,20,30 (RR), then 30,20,10 (LL), then a LR case","Practice: identify the rotation for each imbalance by hand.")},
  {title:"Ch6 · AVL deletion & Red-Black intro",read:"Ch6 §6.14.4–6.15.1 · pp 248–260",brief:"AVL deletion with rebalancing; introduction to red-black trees and their properties.",plan:dstep("Ch6 §6.14.4–6.15.1 · pp 248–260","rebalance on delete, RB color rules","AVL delete() with rebalancing; note the 5 red-black properties","delete from your AVL and re-verify balance factors","Practice: list the red-black properties from memory.")},
  {title:"Ch6 · Red-Black Trees",read:"Ch6 §6.15 · pp 258–277",brief:"Red-black tree search, insertion and deletion fix-ups (recoloring + rotations).",plan:dstep("Ch6 §6.15 · pp 258–277","recolor vs rotate, uncle cases","an RB insert with fix-up (recolor/rotate)","insert a few keys and verify no red-red violation","Practice: compare AVL vs Red-Black on insert cost.")},
  {title:"Ch6 · Heaps, Heap Sort & Priority Queue",read:"Ch6 §6.16 · pp 277–286",brief:"Max/min heap, insert (sift-up), delete (sift-down), build-heap, heap sort and priority queue.",plan:dstep("Ch6 §6.16 · pp 277–286","heap property, sift-up/down, array heap","a max-heap with insert, deleteMax, buildHeap and heapSort","build a heap from {4,10,3,5,1}; heap-sort it","Practice: implement a priority queue on top of the heap.")},
  {title:"Ch6 · Huffman & B-Trees",read:"Ch6 §6.18–6.21 · pp 287–318",brief:"Huffman coding tree; B-tree order, search, insertion and deletion for disk-friendly indexing.",plan:dstep("Ch6 §6.18–6.21 · pp 287–318","greedy Huffman merge, B-tree splits/merges","a Huffman tree from character frequencies; hand-trace a B-tree insert","build Huffman codes for a small text; split a full B-tree node","Practice: why do databases use B-trees not BSTs?")},
  {title:"Ch6 · B+ Trees & Digital Search Trees",read:"Ch6 §6.22–6.23 · pp 318–325",brief:"B+ tree (data in leaves, linked leaves) and digital/trie-style search trees.",plan:dstep("Ch6 §6.22–6.23 · pp 318–325","B+ leaf chaining vs B-tree, trie idea","a small B+ tree search by hand and a simple trie insert/search in C","search a range in a B+ tree; insert words into a trie","Practice: why are B+ leaves linked?")},
  {title:"Ch7 · Graphs — terminology & spanning trees",read:"Ch7 §7.1–7.8 · pp 326–334",brief:"Directed/undirected graphs, connectivity, biconnected/strongly-connected, trees and spanning trees.",plan:dstep("Ch7 §7.1–7.8 · pp 326–334","degree, path, cycle, connected components","code the graph vocabulary as comments and draw 3 sample graphs","classify 3 graphs (connected? directed? cyclic?)","Practice: define spanning tree vs minimum spanning tree.")},
  {title:"Ch7 · Graph Representations",read:"Ch7 §7.10–7.11 · pp 335–352",brief:"Adjacency matrix and adjacency list representations; transitive closure & path matrix (Warshall).",plan:dstep("Ch7 §7.10–7.11 · pp 335–352","matrix vs list trade-offs, Warshall's closure","a graph as both adjacency matrix and list; Warshall transitive closure","store a 5-node graph both ways; compute its path matrix","Practice: when is a list better than a matrix?")},
  {title:"Ch7 · Breadth First Search (BFS)",read:"Ch7 §7.12.1 · pp 353–363",brief:"BFS traversal implemented with a queue; level-order exploration and shortest hops.",plan:dstep("Ch7 §7.12.1 · pp 353–363","visited[] array, queue frontier, level order","BFS() using your queue on an adjacency list","BFS from node 0 on a 6-node graph; print visit order","Practice: how does BFS give shortest path in an unweighted graph?")},
  {title:"Ch7 · Depth First Search & Components",read:"Ch7 §7.12.2 · pp 364–397",brief:"DFS (recursive and stack-based); connected components and strongly-connected components.",plan:dstep("Ch7 §7.12.2 · pp 364–397","recursion/stack, back edges, SCC idea","recursive DFS and stack-based DFS; count connected components","DFS from node 0; count components in a disconnected graph","Practice: contrast BFS vs DFS use-cases.")},
  {title:"Ch7 · Minimum Spanning Tree",read:"Ch7 §7.14 · pp 398–409",brief:"Minimum spanning tree via Prim's and Kruskal's algorithms.",plan:dstep("Ch7 §7.14 · pp 398–409","cut property, union-find for Kruskal","Prim's (from a start node) and Kruskal's (with union-find)","find the MST of a small weighted graph both ways","Practice: which is better for dense vs sparse graphs?")},
  {title:"Ch7 · Topological Sorting",read:"Ch7 §7.15 · pp 410–416",brief:"Topological ordering of a DAG using in-degrees (Kahn) or DFS finish times.",plan:dstep("Ch7 §7.15 · pp 410–416","DAG, in-degree, ordering constraints","topological sort via in-degree + queue","order a 6-task dependency DAG","Practice: what breaks topological sort? (a cycle)")},
  {title:"Ch8 · Selection & Bubble Sort",read:"Ch8 §8.1–8.9 · pp 417–427",brief:"Sorting basics (stability, in-place), selection sort and bubble sort with full analysis.",plan:dstep("Ch8 §8.1–8.9 · pp 417–427","stability, in-place, best/worst/avg case","selection sort and bubble sort with a swap counter","sort {5,2,9,1,7}; count comparisons & swaps","Practice: which is stable? Which stops early on sorted input?")},
  {title:"Ch8 · Insertion & Shell Sort",read:"Ch8 §8.10–8.11 · pp 427–434",brief:"Insertion sort and Shell sort (diminishing increment) with analysis.",plan:dstep("Ch8 §8.10–8.11 · pp 427–434","shifting, gap sequence in Shell","insertion sort and Shell sort","sort the same array; try gaps 4,2,1 in Shell","Practice: why is insertion sort great for nearly-sorted data?")},
  {title:"Ch8 · Merge Sort",read:"Ch8 §8.12 · pp 434–444",brief:"Merge sort: top-down recursive, bottom-up iterative, and merge sort for linked lists.",plan:dstep("Ch8 §8.12 · pp 434–444","divide-merge, stable O(n log n), extra space","recursive merge sort and the merge() routine","sort {8,3,5,1,9,2}; watch the recursion split/merge","Practice: why is merge sort preferred for linked lists?")},
  {title:"Ch8 · Quick Sort & Binary Tree Sort",read:"Ch8 §8.13–8.14 · pp 444–454",brief:"Quick sort (partition, pivot choice, analysis) and binary-tree sort.",plan:dstep("Ch8 §8.13–8.14 · pp 444–454","partition, pivot, worst case O(n²)","quick sort with Lomuto/Hoare partition; a BST-based sort","sort a random array; force the worst case (sorted input)","Practice: how does a good pivot avoid O(n²)?")},
  {title:"Ch8 · Heap Sort & Radix Sort",read:"Ch8 §8.15–8.17 · pp 454–471",brief:"Heap sort revisited and non-comparison sorts: radix / address-calculation sort.",plan:dstep("Ch8 §8.15–8.17 · pp 454–471","in-place heap sort, digit buckets in radix","heap sort in place and a radix sort for integers","heap-sort {4,10,3,5,1}; radix-sort {329,457,657,839}","Practice: when can radix sort beat O(n log n)?")},
  {title:"Ch9 · Searching & Hash Functions",read:"Ch9 §9.1–9.3.1 · pp 472–479",brief:"Linear and binary search; hashing idea and hash functions (truncation, mid-square, folding).",plan:dstep("Ch9 §9.1–9.3.1 · pp 472–479","O(log n) binary search, hash function goals","linear & binary search and a small hash table with a mid-square hash","binary-search a sorted array; hash 10 keys and show collisions","Practice: what makes a good hash function?")},
  {title:"Ch9 · Collision Resolution & Hashing",read:"Ch9 §9.3.2–9.3.3 · pp 480–491",brief:"Open addressing (linear/quadratic/double), separate chaining and bucket hashing.",plan:dstep("Ch9 §9.3.2–9.3.3 · pp 480–491","probing sequences, load factor, chaining","a hash table with linear probing AND one with separate chaining","insert keys that collide; compare probing vs chaining","Practice: how does load factor affect performance?")},
  {title:"Ch10 · Storage Management + Review",read:"Ch10 §10.1–10.7 · pp 492–508",brief:"Memory allocation (first/best/worst fit), fragmentation, boundary tag, buddy systems, compaction & garbage collection — then review the whole book.",plan:dstep("Ch10 §10.1–10.7 · pp 492–508","fit strategies, fragmentation, buddy system, mark-and-sweep GC","a simple first-fit allocator over a fixed memory block","allocate & free a few blocks; observe fragmentation","Review: skim every chapter's summary and re-code your weakest data structure.")},
];
function courseStart(){ let s=LS("pos_course_start",""); if(!s){ s=dstrD(new Date()); SS("pos_course_start",s); } const [y,m,d]=String(s).split("-").map(Number); const dt=new Date(y,m-1,d); dt.setHours(0,0,0,0); return dt; }
function seedAllCourses(start?:Date, overwrite:boolean=true){
  const s0=start||courseStart(); const fmt=(m:number)=>`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`;
  const setDay=(cid:string,i:number,rec:any)=>{ const d=new Date(s0); d.setDate(d.getDate()+i); const ds=dstrD(d); const key=planKey(ds); const cur:any=LS(key,{}); const base=Array.isArray(cur.studyList)?cur.studyList:[]; if(!overwrite && base.some((x:any)=>x.courseId===cid)) return; const list=base.filter((x:any)=>x.courseId!==cid); list.push(rec); SS(key,{...cur,studyList:list}); };
  if(overwrite){ purgeCourse("agentic"); purgeCourse("sysdesign"); purgeCourse("dsa"); }
  AGENTIC_COURSE.forEach((day:any,i:number)=>{ const [mm,ss]=day.timing.replace("–","-").split("-")[0].split(":"); const sec=(+mm)*60+(+ss||0);
    setDay("agentic",i,{ id:uid(), courseId:"agentic", label:`Day ${i+1}: ${day.title}`, hours:"1.5", brief:day.brief, resource:day.link, pdf:`/course/day-${String(i+1).padStart(2,"0")}.pdf`, video:`▶ ${day.timing} of the 10h video`, courseVideo:`${YT}&t=${sec}s`, plan:[{time:"40 min",task:`Watch the course video ${day.timing} — ${day.title}`},{time:"40 min",task:"Code along in the GitHub notebook / build the example"},{time:"10 min",task:"Write notes & commit your code"}], next:[] }); });
  SYSDESIGN_COURSE.forEach((day:any,i:number)=>{ const startMin=i*15; const timing=`${fmt(startMin)}-${fmt(startMin+15)}`; const sec=startMin*60;
    setDay("sysdesign",i,{ id:uid(), courseId:"sysdesign", label:`SD Day ${i+1}: ${day.title}`, hours:"1.5", brief:day.brief, resource:SD_DOCS, pdf:`/course/sd-day-${String(i+1).padStart(2,"0")}.pdf`, video:`▶ ${timing} of the 5h video`, courseVideo:`${SD_VIDEO}&t=${sec}s`, plan:[{time:"25 min",task:`Watch the course video ${timing} — ${day.title}`},{time:"45 min",task:"Read the PDF notes + Telusko docs; draw the architecture diagram"},{time:"20 min",task:"Write your own notes"}], next:[] }); });
  DSA_COURSE.forEach((day:any,i:number)=>{
    setDay("dsa",i,{ id:uid(), courseId:"dsa", label:`DSA Day ${i+1}: ${day.title}`, hours:"1.5", brief:`${day.brief}  📖 Book: ${day.read}`, resource:`${DSA_BOOK}  ·  Today: ${day.read}`, pdf:`/course/dsa-day-${String(i+1).padStart(2,"0")}.pdf`, video:`📖 Read from "Data Structures Through C in Depth" (Srivastava) — ${day.read}`, courseVideo:"https://www.google.com/search?q=Data+Structures+Through+C+in+Depth+Srivastava", plan:day.plan||[], next:[] }); });
}
function CoursePlanner(){
  const [course,setCourse]=useState("Complete Agentic AI Course In 10 Hours — LangChain, LangGraph, RAG, Vectorless RAG, Guardrails, Evals (Krish Naik)");
  const [startD,setStartD]=useState(today());
  const [days,setDays]=useState("15"); const [hrs,setHrs]=useState("1.5");
  const [video,setVideo]=useState("https://www.youtube.com/watch?v=rV3HJ4LEZ7k");
  const [res,setRes]=useState(COURSE_RES);
  const [busy,setBusy]=useState(false); const [preview,setPreview]=useState<any[]|null>(null); const [msg,setMsg]=useState("");
  const gen=async()=>{ setBusy(true); setMsg(""); setPreview(null);
    try{ const r=await fetch("/api/course-plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course,days:+days||15,hoursPerDay:+hrs||1.5,videoUrl:video,resources:res})}); const d=await r.json();
      if(Array.isArray(d.days)&&d.days.length) setPreview(d.days); else setMsg(d.error||"No plan returned."); }catch(e){ setMsg("Failed — check your AI key."); } setBusy(false); };
  const addToGoals=()=>{ if(!preview) return; const st=new Date(startD);
    preview.forEach((day:any,i:number)=>{ const d=new Date(st); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const key=planKey(ds); const cur:any=LS(key,{}); const list=Array.isArray(cur.studyList)?cur.studyList:[];
      list.push({id:uid(),label:`Day ${i+1}: ${day.title}`,hours:hrs,plan:(day.tasks||[]).map((t:any)=>({time:t.time,task:t.task})),next:[],video:day.video||"",resource:day.resource||"",courseVideo:video});
      SS(key,{...cur,studyList:list}); });
    const end=new Date(st); end.setDate(end.getDate()+preview.length-1); const es=`${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,"0")}-${String(end.getDate()).padStart(2,"0")}`;
    setMsg(`✓ Added ${preview.length}-day plan to Goals: ${startD} → ${es}. Open each day's Study section to see topics, links & video timing.`);
  };
  return <div className="card" style={{marginBottom:16,background:"linear-gradient(120deg,rgba(168,85,247,.12),rgba(59,130,246,.08))"}}>
    <div className="row" style={{gap:8}}><Chip tint="purple">🎓</Chip><strong>Course Planner — spread a course across days</strong></div>
    <div className="muted" style={{fontSize:12,marginTop:4}}>Give a course + video + resource links. AI builds a day-by-day study plan and drops it into your Goals.</div>
    <input className="in" value={course} onChange={e=>setCourse(e.target.value)} placeholder="Course name" style={{width:"100%",marginTop:10}}/>
    <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
      <input className="in" type="date" value={startD} onChange={e=>setStartD(e.target.value)} style={{width:150}} title="Start date"/>
      <input className="in" type="number" value={days} onChange={e=>setDays(e.target.value)} placeholder="Days" style={{width:80}} title="Days"/>
      <input className="in" type="number" step="0.5" value={hrs} onChange={e=>setHrs(e.target.value)} placeholder="Hrs/day" style={{width:90}} title="Hours per day"/>
      <input className="in" value={video} onChange={e=>setVideo(e.target.value)} placeholder="Course video URL" style={{flex:1,minWidth:180}}/>
    </div>
    <textarea className="in" value={res} onChange={e=>setRes(e.target.value)} placeholder="Resource links (one per line)" style={{width:"100%",minHeight:90,marginTop:8,fontSize:12}}/>
    <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
      <button className="btn" onClick={gen} disabled={busy}>{busy?"🤖 Building plan…":"✨ Generate day-by-day plan"}</button>
      {preview && <button className="btn" onClick={addToGoals} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>➕ Add all {preview.length} days to Goals</button>}
    </div>
    {msg && <div style={{fontSize:12,marginTop:8,color:msg[0]==="✓"?"#6ee7b7":"#f9a8d4"}}>{msg}</div>}
    {preview && <div style={{marginTop:12,maxHeight:340,overflowY:"auto"}}>
      {preview.map((day:any,i:number)=>{ const st=new Date(startD); st.setDate(st.getDate()+i); const ds=st.toLocaleDateString(undefined,{month:"short",day:"numeric"});
        return <div key={i} style={{padding:"10px 0",borderTop:i?"1px solid rgba(255,255,255,.07)":"none"}}>
          <div className="between"><strong style={{fontSize:13}}>Day {i+1} · {ds} — {day.title}</strong></div>
          {day.video && <div className="muted" style={{fontSize:12,marginTop:3}}>📺 {day.video}</div>}
          {day.resource && <div style={{fontSize:12,marginTop:2}}>🔗 <a href={firstUrl(day.resource)||day.resource} target="_blank" rel="noopener" style={{color:"#7dd3fc"}}>{day.resource}</a></div>}
          <ul className="list" style={{marginTop:4}}>{(day.tasks||[]).map((t:any,ti:number)=><li key={ti} style={{fontSize:12,padding:"3px 0"}}><b style={{color:"#c4b5fd"}}>{t.time}</b> — {t.task}</li>)}</ul>
        </div>; })}
    </div>}
  </div>;
}
function GoalPlanner({ sett, mode="all" }: any) {
  const days=sett.planDays||120;
  const [sel,setSel]=useState(today());
  const [p,setP]=useState<any>(loadPlan(today()));
  const [,setT]=useState(0);
  const [fixBusy,setFixBusy]=useState(false); const [fixMsg,setFixMsg]=useState("");
  const [mealBusy,setMealBusy]=useState(""); const [studyBusy,setStudyBusy]=useState(false); const [saved,setSaved]=useState(""); const [undoSnap,setUndoSnap]=useState<any>(null);
  const refresh=()=>setT((x:number)=>x+1);
  const snap=(label:string)=>{ setUndoSnap({date:sel,label,data:JSON.parse(JSON.stringify(LS(planKey(sel),{})))}); };
  const doUndo=()=>{ if(!undoSnap) return; SS(planKey(undoSnap.date),undoSnap.data); if(undoSnap.date===sel) setP(loadPlan(sel)); const lbl=undoSnap.label; setUndoSnap(null); setT((x:number)=>x+1); refresh(); setSaved("↩ Restored: "+lbl); };
  const restoreCourses=()=>{ if(confirm("Restore all 3 study courses from your start date ("+dstrD(courseStart())+")? This re-adds any deleted course days on their correct dates. Your own subjects, workouts, meals & journals stay; course progress ticks reset.")){ seedAllCourses(courseStart(),true); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Course study plans restored."); } };
  const [courseStartInput,setCourseStartInput]=useState(LS("pos_course_start","")||today());
  const applyCourseStart=()=>{ if(!courseStartInput) return; if(!confirm("Re-anchor all 3 courses to START on "+courseStartInput+"? Day 1 moves to that date and the rest follow. Course progress ticks reset.")) return; SS("pos_course_start",courseStartInput); const [y,m,d]=courseStartInput.split("-").map(Number); seedAllCourses(new Date(y,m-1,d),true); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Courses re-anchored to start "+courseStartInput); };
  const [exTab,setExTab]=useState(""); const [studyTab,setStudyTab]=useState("");
  const [mealDraft,setMealDraft]=useState<any>({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}});
  const [mealPrev,setMealPrev]=useState<any>({}); const [mealMod,setMealMod]=useState<any>({});
  const [studyDraft,setStudyDraft]=useState<any>({label:"",hours:""});
  const [exPrompt,setExPrompt]=useState(""); const [exEditBusy,setExEditBusy]=useState(false); const [planInfo,setPlanInfo]=useState<string|null>(null); const [notesBusy,setNotesBusy]=useState(""); const [askText,setAskText]=useState(""); const [codeBusy,setCodeBusy]=useState("");
  const genCode=async(subj:any)=>{ setCodeBusy(subj.id);
    try{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const r=await fetch("/api/code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course:subj.label,topic,brief:subj.brief,videos:subj.video})}); const d=await r.json();
      if(d.code){ save({studyList:(p.studyList||[]).map((s:any)=>s.id===subj.id?{...s,codeFile:{filename:d.filename||"code.txt",lang:d.lang||"",code:d.code}}:s)}); } else alert(d.error||"Failed to generate code."); }
    catch(e){ alert("Failed — check your AI key."); } setCodeBusy(""); };
  const copyCode=(code:string)=>{ try{ (navigator as any).clipboard.writeText(code); alert("Code copied ✓"); }catch(e){ alert("Copy failed — select & copy manually."); } };
  const downloadCode=(cf:any)=>{ try{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([cf.code],{type:"text/plain"})); a.download=cf.filename||"code.txt"; a.click(); }catch(e){} };
  const vscodeRepo=(url:string)=>{ const m=String(url||"").match(/github\.com\/([^\/]+)\/([^\/#?]+)/); return m?`https://vscode.dev/github/${m[1]}/${m[2]}`:""; };
  const [timer,setTimer]=useState<any>(null); const [nowTs,setNowTs]=useState(0);
  useEffect(()=>{ if(!timer || !timer.startedAt) return; const id=setInterval(()=>setNowTs(Date.now()),1000); return ()=>clearInterval(id); },[timer]);
  const fmtEl=(secs:number)=>`${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
  const elapsedSec=(tm:any)=> tm? Math.max(0,Math.floor((tm.accum||0) + (tm.startedAt? (nowTs-tm.startedAt)/1000 : 0))) : 0;
  const startTask=(subj:any,idx:number,timeStr:string)=>{ const key=subj.id+"#"+idx; if(timer && timer.key!==key){ alert("Log or finish the running timer first."); return; } const tgt=parseInt(String(timeStr))||0; setTimer({key,id:subj.id,idx,target:tgt,accum:0,startedAt:Date.now(),onBreak:false}); setNowTs(Date.now()); };
  const pauseTimer=(brk:boolean)=>{ setTimer((t:any)=> !t?t: (t.startedAt? {...t,accum:(t.accum||0)+(Date.now()-t.startedAt)/1000,startedAt:null,onBreak:!!brk} : {...t,onBreak:!!brk}) ); };
  const resumeTimer=()=>{ setTimer((t:any)=> t&&!t.startedAt? {...t,startedAt:Date.now(),onBreak:false}:t); setNowTs(Date.now()); };
  const logTask=(subj:any)=>{ if(!timer) return; const secs=(timer.accum||0)+(timer.startedAt?(Date.now()-timer.startedAt)/1000:0); const mins=Math.max(0,Math.round(secs/60)); const idx=timer.idx;
    save({studyList:(p.studyList||[]).map((s:any)=>{ if(s.id!==subj.id) return s; const plan=(s.plan||[]).map((t:any,i:number)=>i===idx?{...t,done:true}:t); return {...s,plan,studied:(+s.studied||0)+mins}; })});
    try{ const sd:any=loadStudy(sel); const k=subj.courseId||"study"; sd[k]=(sd[k]||0)+mins; SS(studyKey(sel),sd); }catch(e){}
    setTimer(null); setSaved("⏱ Logged "+mins+" min · task done"); };
  const [exChat,setExChat]=useState(""); const [stChat,setStChat]=useState(""); const [chatBusy,setChatBusy]=useState("");
  const [opMode,setOpMode]=useState("swap"); const [dayA,setDayA]=useState(today()); const [dayB,setDayB]=useState(""); const [opPrompt,setOpPrompt]=useState("");
  const buildExDay=(ds:string)=>{ const c:any=LS(planKey(ds),{}); return {date:ds,sessions:(c.exSessions||[]).map((s:any)=>({type:s.type,time:s.time||"",exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:+x.sets||0,reps:+x.reps||0,weight:+x.weight||0}))}))}; };
  const applyExDays=(resDays:any[],okMsg:string)=>{ resDays.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const exSessions=(dd.sessions||[]).map((s:any)=>({id:uid(),time:s.time||"",type:s.type||"Workout",done:false,steps:"",distance:"",duration:"",detail:"",selected:(s.exercises||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))})); SS(planKey(dd.date),{...c,exSessions}); }); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved(okMsg); };
  const runExEdit=async(daysList:any[],prompt:string,okMsg:string)=>{ setChatBusy("ex"); snap("Exercise edit");
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"exercise",days:daysList,prompt})}); if(!r.ok){ alert(r.status===404?"Deploy the latest build first (needs /api/plan-edit).":`Server error ${r.status} — try a shorter prompt.`); setChatBusy(""); return; } const d=await r.json(); if(Array.isArray(d.days)) applyExDays(d.days,okMsg); else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")); } setChatBusy(""); };
  const swapDays=()=>{ if(!dayB||dayA===dayB){ alert("Pick two different days to swap."); return; } snap("Swapped days"); const ca:any=LS(planKey(dayA),{}); const cb:any=LS(planKey(dayB),{}); const ea=Array.isArray(ca.exSessions)?ca.exSessions:[]; const eb=Array.isArray(cb.exSessions)?cb.exSessions:[]; SS(planKey(dayA),{...ca,exSessions:eb}); SS(planKey(dayB),{...cb,exSessions:ea}); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Swapped "+dayA+" ↔ "+dayB); };
  const modifyDayEx=()=>{ if(!opPrompt.trim()){ alert("Type what to change."); return; } runExEdit([buildExDay(dayA)],opPrompt,"✓ "+dayA+" workout modified."); setOpPrompt(""); };
  const addDayEx=()=>{ if(!opPrompt.trim()){ alert("Describe the workout to add."); return; } runExEdit([buildExDay(dayA)],"Add a NEW workout session to this day, keeping any existing sessions: "+opPrompt,"✓ Session added to "+dayA); setOpPrompt(""); };
  const applyExerciseChat=async()=>{ if(!exChat.trim())return; setChatBusy("ex"); snap("Exercise 10-day edit");
    const days:any[]=[]; for(let i=0;i<10;i++){ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); days.push({date:ds,sessions:(c.exSessions||[]).map((s:any)=>({type:s.type,time:s.time||"",exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:+x.sets||0,reps:+x.reps||0,weight:+x.weight||0}))}))}); }
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"exercise",days,prompt:exChat})});
      if(!r.ok){ alert(r.status===404?"Update not live yet — deploy the latest build (this feature needs the new /api/plan-edit route).":`Server error ${r.status} — the AI edit may have timed out. Try a shorter prompt.`); setChatBusy(""); return; }
      const d=await r.json();
      if(Array.isArray(d.days)){ d.days.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const exSessions=(dd.sessions||[]).map((s:any)=>({id:uid(),time:s.time||"",type:s.type||"Workout",done:false,steps:"",distance:"",duration:"",detail:"",selected:(s.exercises||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))})); SS(planKey(dd.date),{...c,exSessions}); }); setExChat(""); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Exercise 10-day plan updated."); } else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")+". Check you're online and on the latest build."); } setChatBusy(""); };
  const applyStudyChat=async()=>{ if(!stChat.trim())return; setChatBusy("st"); snap("Study 10-day edit");
    const pool:any={}; const days:any[]=[]; for(let i=0;i<10;i++){ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); (c.studyList||[]).forEach((s:any)=>{ if(!pool[s.label]) pool[s.label]=s; }); days.push({date:ds,subjects:(c.studyList||[]).map((s:any)=>({label:s.label,brief:s.brief||""}))}); }
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"study",days,prompt:stChat})});
      if(!r.ok){ alert(r.status===404?"Update not live yet — deploy the latest build (this feature needs the new /api/plan-edit route).":`Server error ${r.status} — the AI edit may have timed out. Try a shorter prompt.`); setChatBusy(""); return; }
      const d=await r.json();
      if(Array.isArray(d.days)){ d.days.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const studyList=(dd.subjects||[]).map((it:any)=>{ const ex=pool[it.label]; return ex? {...ex, brief: it.brief||ex.brief} : {id:uid(),label:it.label,brief:it.brief||"",plan:[],next:[]}; }); SS(planKey(dd.date),{...c,studyList}); }); setStChat(""); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Study 10-day plan updated."); } else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")+". Check you're online and on the latest build."); } setChatBusy(""); };
  const askClaude=(subj:any)=>{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const q=`I'm studying "${topic}"${subj.video?` (lectures: ${String(subj.video).replace(/^▶\s*/,"")})`:""}. ${askText.trim()||"Explain this topic in detail with theory, examples and common interview questions."}`; window.open("https://claude.ai/new?q="+encodeURIComponent(q),"_blank"); };
  const genNotes=async(subj:any)=>{ setNotesBusy(subj.id);
    try{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const r=await fetch("/api/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course:subj.label,topic,brief:subj.brief,videos:subj.video})}); const d=await r.json();
      if(d.notes){ save({studyList:(p.studyList||[]).map((s:any)=>s.id===subj.id?{...s,notes:d.notes}:s)}); } else alert(d.error||"Failed to generate notes."); }
    catch(e){ alert("Failed — check your AI key."); } setNotesBusy(""); };
  useEffect(()=>{ const pl=loadPlan(sel); setP(pl); setFixMsg(""); setSaved("");
    setExTab((pl.exSessions[0]||{}).id||""); setStudyTab((pl.studyList[0]||{}).id||"");
    setMealDraft({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}}); setStudyDraft({label:"",hours:""}); },[sel]);
  const save=(patch:any)=>{ const n={...p,...patch}; setP(n); SS(planKey(sel),n); setT(x=>x+1); setSaved(""); };
  const doSave=()=>{ SS(planKey(sel),p); setSaved("✓ Saved "+new Date().toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})+" — synced for the future"); };
  const clearEx=()=>{ if(confirm("Clear all exercise sessions for this day?")){ snap("Exercise cleared"); save({exSessions:[]}); } };
  const clearMeals=()=>{ if(confirm("Clear all meals for this day?")){ snap("Meals cleared"); save({meals:{breakfast:[],lunch:[],dinner:[]}}); } };
  const clearStudy=()=>{ if(confirm("Clear all study subjects for this day?")){ snap("Study cleared"); save({studyList:[]}); } };
  const clearJournal=()=>{ if(confirm("Clear the journal for this day?")){ snap("Journal cleared"); save({journal:""}); } };
  const clearDay=()=>{ if(confirm("Clear the WHOLE plan for "+sel+"?")){ snap("Whole day cleared"); const blank=JSON.parse(JSON.stringify(PLAN_DEF)); setP(blank); SS(planKey(sel),blank); setT(x=>x+1); setSaved(""); setExTab(""); setStudyTab(""); } };
  const clearBtn=(fn:()=>void)=><button className="btn ghost sm" onClick={fn}>🗑 Clear</button>;
  const actBtns=(skipFn:()=>void,clearFn:()=>void)=><div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={skipFn}>😴 Skip/Rest</button><button className="btn ghost sm" onClick={clearFn}>🗑 Clear</button></div>;
  const shift=(n:number)=>{ const d=new Date(sel); d.setDate(d.getDate()+n); setSel(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); };
  const addDaysD=(ds:string,n:number)=>{ const [y,m,dd]=ds.split("-").map(Number); return dstrD(new Date(y,m-1,dd+n)); };
  const emptyMeals=()=>({breakfast:[],lunch:[],dinner:[]});
  const hasCat=(c:any,cat:string)=> cat==="meals" ? !!(c&&c.meals&&((c.meals.breakfast||[]).length||(c.meals.lunch||[]).length||(c.meals.dinner||[]).length)) : !!(c&&Array.isArray(c[cat])&&c[cat].length);
  const shiftCategory=(fromDs:string,cat:string,n:number)=>{ const dates:string[]=[]; for(let i=0;i<250;i++){ const ds=addDaysD(fromDs,i); const c:any=LS(planKey(ds),null); if(hasCat(c,cat)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const c:any=LS(planKey(ds),{}); const tgt=addDaysD(ds,n); const tc:any=LS(planKey(tgt),{});
      if(cat==="meals"){ const cm=c.meals||emptyMeals(); const tm=tc.meals||emptyMeals(); SS(planKey(tgt),{...tc,meals:{breakfast:[...(tm.breakfast||[]),...(cm.breakfast||[])],lunch:[...(tm.lunch||[]),...(cm.lunch||[])],dinner:[...(tm.dinner||[]),...(cm.dinner||[])]}}); SS(planKey(ds),{...c,meals:emptyMeals()}); }
      else { SS(planKey(tgt),{...tc,[cat]:[...(Array.isArray(tc[cat])?tc[cat]:[]),...(Array.isArray(c[cat])?c[cat]:[])]}); SS(planKey(ds),{...c,[cat]:[]}); }
    });
  };
  const afterShift=(msg:string)=>{ setT(x=>x+1); refresh(); setP(loadPlan(sel)); alert(msg); };
  const skipExercise=()=>{ if(!confirm("Rest from EXERCISE on "+sel+"? Your exercise plan from here shifts forward 1 day (nothing lost).")) return; shiftCategory(sel,"exSessions",1); afterShift("✓ Exercise rested on "+sel+" — exercise plan shifted forward 1 day."); };
  const skipMeals=()=>{ if(!confirm("Skip MEALS plan on "+sel+"? Your meal plan from here shifts forward 1 day.")) return; shiftCategory(sel,"meals",1); afterShift("✓ Meals shifted forward 1 day from "+sel+"."); };
  const skipStudy=()=>{ if(!confirm("Rest from STUDY on "+sel+"? Your study plan from here shifts forward 1 day (no day is lost).")) return; shiftCategory(sel,"studyList",1); afterShift("✓ Study rested on "+sel+" — study plan shifted forward 1 day."); };
  const skipRestDay=()=>{ if(!confirm("Full REST day on "+sel+"? Exercise, meals AND study all shift forward 1 day.")) return; shiftCategory(sel,"exSessions",1); shiftCategory(sel,"meals",1); shiftCategory(sel,"studyList",1); afterShift("✓ "+sel+" is a full rest day — everything shifted forward 1 day."); };
  const isGymSess=(s:any)=>GYM_TYPES.includes(s.type);
  const awayDay=()=>{ if(!confirm("Mark "+sel+" as AWAY?\nYou still walk your 11,000 steps, but every GYM session from here shifts forward 1 day — nothing is skipped.")) return; snap("Away day");
    const dates:string[]=[]; for(let i=0;i<220;i++){ const ds=addDaysD(sel,i); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.exSessions)&&c.exSessions.some(isGymSess)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const nd=addDaysD(ds,1); const c:any=LS(planKey(ds),{}); const gym=(c.exSessions||[]).filter(isGymSess).map((g:any)=>({...g,done:false,selected:(g.selected||[]).map((x:any)=>({...x,done:false}))})); const keep=(c.exSessions||[]).filter((s:any)=>!isGymSess(s)); SS(planKey(ds),{...c,exSessions:keep}); const cn:any=LS(planKey(nd),{}); const others=(cn.exSessions||[]); SS(planKey(nd),{...cn,exSessions:[...others,...gym]}); });
    afterShift("✓ "+sel+" set as Away — gym shifted forward 1 day. Keep your 11,000-step walk today."); };
  const [woStartInput,setWoStartInput]=useState(LS("pos_workout_start","")||today());
  const applyWorkoutSeed=()=>{ if(!woStartInput) return; if(!confirm("Load the 125-day workout cycle starting "+woStartInput+"?\nPush → Pull → Legs → Rest → Push → Pull → Legs → Biceps&Triceps (repeats), plus an 11,000-step walk every day. Your own added sessions stay; only auto-loaded ones refresh.")) return; SS("pos_workout_start",woStartInput); const [y,m,d]=woStartInput.split("-").map(Number); seedWorkoutPlan(new Date(y,m-1,d),125,true); SS("pos_seed_workout","v1"); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ 125-day workout plan loaded from "+woStartInput); };
  const courseName=(cid:string)=> cid==="agentic"?"Agentic AI": cid==="sysdesign"?"System Design": cid==="dsa"?"DSA": "this subject";
  const shiftCourse=(cid:string,fromDs:string,n:number)=>{ const dates:string[]=[]; for(let i=0;i<320;i++){ const ds=addDaysD(fromDs,i); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.studyList)&&c.studyList.some((s:any)=>s.courseId===cid)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const c:any=LS(planKey(ds),{}); const tgt=addDaysD(ds,n); const tc:any=LS(planKey(tgt),{}); const moving=(c.studyList||[]).filter((s:any)=>s.courseId===cid); const staying=(c.studyList||[]).filter((s:any)=>s.courseId!==cid);
      SS(planKey(tgt),{...tc,studyList:[...(Array.isArray(tc.studyList)?tc.studyList:[]),...moving]}); SS(planKey(ds),{...c,studyList:staying}); }); };
  const skipSubject=(subj:any)=>{ const cid=subj.courseId;
    if(cid){ if(!confirm("Rest/skip "+courseName(cid)+" on "+sel+"? Only this course shifts forward 1 day (nothing lost).")) return; snap("Skipped "+courseName(cid)); shiftCourse(cid,sel,1); afterShift("✓ "+courseName(cid)+" shifted forward 1 day from "+sel+"."); }
    else { if(!confirm("Skip this subject on "+sel+"? It moves to tomorrow.")) return; snap("Subject skipped"); const cur:any=LS(planKey(sel),{}); const stay=(cur.studyList||[]).filter((s:any)=>s.id!==subj.id); SS(planKey(sel),{...cur,studyList:stay}); const tgt=addDaysD(sel,1); const tc:any=LS(planKey(tgt),{}); SS(planKey(tgt),{...tc,studyList:[...(Array.isArray(tc.studyList)?tc.studyList:[]),subj]}); afterShift("✓ Subject moved to "+tgt+"."); } };
  const filled=(d:string)=>{ const x=loadPlan(d); const meals=(x.meals?.breakfast||[]).length+(x.meals?.lunch||[]).length+(x.meals?.dinner||[]).length; return !!((x.exSessions||[]).length||meals||(x.studyList||[]).length||x.journal); };
  const start=new Date(sett.planStart);
  const cells=[]; for(let i=0;i<days;i++){ const d=new Date(start); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; const f=filled(ds);
    cells.push(<div key={i} onClick={()=>setSel(ds)} title={`Day ${i+1} · ${ds}${f?" · planned":""}`} className={"cal-cell"+(ds===sel?" today":"")} style={{cursor:"pointer",background:f?"rgba(16,185,129,.35)":undefined}}><div className="cd">{i+1}</div><div className="cs">{f?"✓":""}</div></div>); }
  const plannedCount=(()=>{ let n=0; for(let i=0;i<days;i++){ const d=new Date(start); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if(filled(ds))n++; } return n; })();
  /* exercise sessions */
  const addSession=()=>{ const id=uid(); save({exSessions:[...(p.exSessions||[]),{id,time:"",type:"Walk",selected:[],detail:"",steps:"",distance:"",duration:""}]}); setExTab(id); };
  const updSession=(id:string,patch:any)=> save({exSessions:(p.exSessions||[]).map((s:any)=>s.id===id?{...s,...patch}:s)});
  const delSession=(id:string)=>{ const list=(p.exSessions||[]).filter((s:any)=>s.id!==id); save({exSessions:list}); if(exTab===id) setExTab((list[0]||{}).id||""); };
  const curS=(p.exSessions||[]).find((s:any)=>s.id===exTab)||(p.exSessions||[])[0];
  const toggleSessDone=(id:string)=> save({exSessions:(p.exSessions||[]).map((s:any)=>s.id===id?{...s,done:!s.done,selected:(s.selected||[]).map((x:any)=>({...x,done:!s.done}))}:s)});
  const submitSession=(id:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s) return; const nd=!s.done; save({exSessions:(p.exSessions||[]).map((x:any)=>x.id===id?{...x,done:nd,selected:(x.selected||[]).map((e:any)=>({...e,done:nd}))}:x)}); setSaved(nd?("✅ "+(s.type||"Session")+" submitted as done — reflected on your dashboard"):("↩ "+(s.type||"Session")+" reopened")); };
  /* auto-tick planned sessions when the watch / workout logs show they were done */
  const autoCheckExercise=(silent?:boolean)=>{ const sessions=p.exSessions||[]; if(!sessions.length){ if(!silent) alert("No sessions to check."); return; }
    const acts=LS("pos_gh_acts",[]).filter((a:any)=>a.date===sel);
    const gh=LS("pos_ghealth",[]).find((x:any)=>x.date===sel)||{};
    const health=LS("pos_health",{}); const isToday=sel===today();
    const wo=LS("pos_workouts",[]).filter((w:any)=>w.date===sel);
    const daySteps=Math.max(+gh.steps||0, acts.reduce((a:number,x:any)=>a+(+x.steps||0),0), isToday?(+health.steps||0):0);
    const dayDist=Math.max(+gh.distance||0, acts.reduce((a:number,x:any)=>a+(+x.distance||0),0), isToday?(+health.distance||0):0);
    let changed=false;
    const next=sessions.map((s:any)=>{ if(s.done) return s; let done=false;
      if(EX_LIB[s.type]) done=wo.some((w:any)=>(w.type||"").toLowerCase()===s.type.toLowerCase());
      else if(s.type==="Walk"||s.type==="Cardio"||s.type==="HIIT"){ const planSteps=+s.steps||0; const hasAct=acts.some((a:any)=>/walk|run|cardio|hike|cycle|bike|hiit/i.test(a.type||"")); done = hasAct || (planSteps? daySteps>=planSteps*0.85 : daySteps>=500) || dayDist>=0.3; }
      else if(s.type==="Yoga") done=acts.some((a:any)=>/yoga/i.test(a.type||""));
      if(done){ changed=true; return {...s,done:true,selected:(s.selected||[]).map((x:any)=>({...x,done:true}))}; } return s; });
    if(changed) save({exSessions:next}); else if(!silent) alert(`No auto-match for ${sel}.\nWatch shows: ${daySteps.toLocaleString()} steps · ${Math.round(dayDist*10)/10} km · ${acts.length} recorded activit${acts.length===1?"y":"ies"} · ${wo.length} gym log(s).\nTip: tap ‘Sync from watch’ on the Google Health tab first, or tick the session manually.`);
  };
  useEffect(()=>{ const t=setTimeout(()=>autoCheckExercise(true),400); return ()=>clearTimeout(t); /* eslint-disable-next-line */ },[sel,p.exSessions.length]);
  const toggleSessEx=(id:string,name:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; const cur=s.selected||[]; const nx=cur.some((x:any)=>x.name===name)?cur.filter((x:any)=>x.name!==name):[...cur,{name,sets:"3",reps:"10",weight:"",note:""}]; updSession(id,{selected:nx}); };
  const setSessExField=(id:string,name:string,field:string,val:any)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; updSession(id,{selected:(s.selected||[]).map((x:any)=>x.name===name?{...x,[field]:val}:x)}); };
  const editSessionAI=async(id:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s||!exPrompt.trim())return; setExEditBusy(true);
    try{ const r=await fetch("/api/edit-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:s.type,exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:x.sets,reps:x.reps,weight:x.weight})),prompt:exPrompt})}); const d=await r.json();
      if(Array.isArray(d.exercises)) updSession(id,{selected:d.exercises.map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))}); setExPrompt(""); }catch(e){} setExEditBusy(false); };
  /* meals */
  const addMealItem=async(group:string)=>{ const g=mealDraft[group]||{}; if(!(g.food||"").trim())return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:g.food})}); const d=await r.json(); const tt=d.total||{};
      const entry={id:uid(),time:g.time||"",name:g.food,cal:Math.round(tt.cal||0),protein:Math.round(tt.protein||0),carbs:Math.round(tt.carbs||0),fat:Math.round(tt.fat||0),fiber:Math.round(tt.fiber||0)};
      save({meals:{...p.meals,[group]:[...(p.meals[group]||[]),entry]}}); setMealDraft((s:any)=>({...s,[group]:{time:"",food:""}})); }catch(e){} setMealBusy(""); };
  const syncMealToNutrition=(it:any,add:boolean)=>{ const planId="plan_"+(it.id||it.name); const m=loadNut(sel); m.meals=m.meals||[];
    if(add){ if(!m.meals.some((x:any)=>x.planId===planId)) m.meals.push({name:it.name,cal:+it.cal||0,protein:+it.protein||0,carbs:+it.carbs||0,fat:+it.fat||0,fiber:+it.fiber||0,planId}); }
    else { m.meals=m.meals.filter((x:any)=>x.planId!==planId); }
    SS(nutKey(sel),m); };
  const delMealItem=(group:string,idx:number)=>{ const it=(p.meals[group]||[])[idx]; if(it&&it.done) syncMealToNutrition(it,false); save({meals:{...p.meals,[group]:(p.meals[group]||[]).filter((_:any,i:number)=>i!==idx)}}); };
  const analyzeMeal=async(group:string)=>{ const g=mealDraft[group]||{}; if(!(g.food||"").trim())return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:g.food})}); const d=await r.json(); setMealPrev((s:any)=>({...s,[group]:{text:g.food,time:g.time||"",total:d.total||{},items:d.items||[]}})); }catch(e){} setMealBusy(""); };
  const modifyMeal=async(group:string)=>{ const prev=mealPrev[group]; const chg=(mealMod[group]||"").trim(); if(!prev||!chg)return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:`${prev.text}. Adjustment: ${chg}`})}); const d=await r.json(); setMealPrev((s:any)=>({...s,[group]:{...prev,text:`${prev.text} (${chg})`,total:d.total||{},items:d.items||[]}})); setMealMod((s:any)=>({...s,[group]:""})); }catch(e){} setMealBusy(""); };
  const confirmMeal=(group:string)=>{ const prev=mealPrev[group]; if(!prev)return; const tt=prev.total||{}; const entry={id:uid(),time:prev.time||"",name:prev.text,cal:Math.round(tt.cal||0),protein:Math.round(tt.protein||0),carbs:Math.round(tt.carbs||0),fat:Math.round(tt.fat||0),fiber:Math.round(tt.fiber||0)}; save({meals:{...p.meals,[group]:[...(p.meals[group]||[]),entry]}}); setMealPrev((s:any)=>({...s,[group]:null})); setMealDraft((s:any)=>({...s,[group]:{time:"",food:""}})); };
  const toggleMealDone=(group:string,idx:number)=>{ const it=(p.meals[group]||[])[idx]; const nowDone=!it.done; syncMealToNutrition(it,nowDone); save({meals:{...p.meals,[group]:(p.meals[group]||[]).map((x:any,i:number)=>i===idx?{...x,done:nowDone}:x)}}); };
  const toggleStudyTask=(id:string,idx:number)=> save({studyList:(p.studyList||[]).map((s:any)=>s.id===id?{...s,plan:(s.plan||[]).map((r:any,i:number)=>i===idx?{...r,done:!r.done}:r)}:s)});
  const groupTot=(group:string)=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; (p.meals[group]||[]).forEach((it:any)=>{t.cal+=+it.cal||0;t.protein+=+it.protein||0;t.carbs+=+it.carbs||0;t.fat+=+it.fat||0;t.fiber+=+it.fiber||0;}); return t; };
  const dayTotal=(()=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; ["breakfast","lunch","dinner"].forEach(k=>{ const g=groupTot(k); t.cal+=g.cal;t.protein+=g.protein;t.carbs+=g.carbs;t.fat+=g.fat;t.fiber+=g.fiber; }); return t; })();
  /* study subjects */
  const addSubject=async()=>{ const label=(studyDraft.label||"").trim(); if(!label)return; const id=uid(); const subj={id,label,hours:studyDraft.hours||"",plan:[],next:[]};
    save({studyList:[...(p.studyList||[]),subj]}); setStudyTab(id); setStudyDraft({label:"",hours:""}); setStudyBusy(true);
    try{ const r=await fetch("/api/study-path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:label,hours:subj.hours})}); const d=await r.json();
      setP((prev:any)=>{ const n={...prev,studyList:(prev.studyList||[]).map((s:any)=>s.id===id?{...s,plan:d.plan||[],next:d.next||[]}:s)}; SS(planKey(sel),n); return n; }); }catch(e){} setStudyBusy(false); };
  const delSubject=(id:string)=>{ snap("Study subject removed"); const list=(p.studyList||[]).filter((s:any)=>s.id!==id); save({studyList:list}); if(studyTab===id) setStudyTab((list[0]||{}).id||""); };
  const curSubj=(p.studyList||[]).find((s:any)=>s.id===studyTab)||(p.studyList||[])[0];
  const fixGrammar=async()=>{ if(!(p.journal||"").trim()){ setFixMsg("Write something in the journal first."); return; } setFixBusy(true); setFixMsg("");
    try{ const r=await fetch("/api/proofread",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:p.journal})}); const d=await r.json();
      if(d.text && d.text!==p.journal){ save({journal:d.text}); setFixMsg("✓ Grammar & spelling corrected."); } else setFixMsg("Looks good — no changes needed."); }
    catch(e){ setFixMsg("Couldn't proofread right now."); } setFixBusy(false); };
  return <div style={{marginTop:16}}>
    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:10}}>
        <div><strong>📋 {days}-Day Daily Planner</strong><div className="muted" style={{fontSize:12,marginTop:2}}>Add as many sessions, meals &amp; subjects as you like. {plannedCount} of {days} days planned.</div></div>
        <div className="row" style={{gap:6}}>
          <button className="btn ghost sm" onClick={()=>shift(-1)}>‹ Prev</button>
          <input className="in" type="date" value={sel} onChange={e=>setSel(e.target.value)} style={{width:150}}/>
          <button className="btn ghost sm" onClick={()=>shift(1)}>Next ›</button>
          <button className="btn ghost sm" onClick={()=>setSel(today())}>Today</button>
          <button className="btn sm" onClick={doSave}>💾 Save day</button>
          <button className="btn ghost sm" onClick={skipRestDay}>😴 Skip / Rest day</button>
          <button className="btn ghost sm" onClick={clearDay}>🗑 Clear day</button>
          {undoSnap && <button className="btn sm" onClick={doUndo} style={{background:"linear-gradient(100deg,var(--orange),var(--pink))"}}>↩ Undo ({undoSnap.label})</button>}
        </div>
      </div>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginTop:10}}>
        <div className="muted" style={{fontSize:12}}>Planning for <b style={{color:"#E7ECF3"}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b></div>
        {saved && <span style={{fontSize:12,color:"#6ee7b7"}}>{saved}</span>}
      </div>
    </div>

    {mode!=="study" && <>
    <PRow icon="🏋️" tint="blue" title="Exercise — add each session (e.g. 6 AM walk, 1 PM gym)" action={<div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={awayDay} title="Walk only today — push your gym sessions forward 1 day">🧳 Away</button><button className="btn ghost sm" onClick={skipExercise}>😴 Rest</button><button className="btn ghost sm" onClick={clearEx}>🗑 Clear</button></div>}>
      <div className="card" style={{marginBottom:12,background:"rgba(59,130,246,.07)",padding:"10px 12px"}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:12}}><b>125-day workout cycle</b> — Push · Pull · Legs · Rest · Push · Pull · Legs · Biceps&Triceps, repeating, with an 11,000-step walk every day.</div>
          <div className="row" style={{gap:6}}><input className="in" type="date" value={woStartInput} onChange={e=>setWoStartInput(e.target.value)} style={{width:150}} title="Start date"/><button className="btn sm" onClick={applyWorkoutSeed}>⚡ Load 125-day plan</button></div>
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>Tip: on any day you can’t train, hit 🧳 Away — you keep your walk and the whole gym cycle slides forward a day (nothing lost).</div>
      </div>
      <div className="row" style={{flexWrap:"wrap",gap:10,alignItems:"stretch"}}>
        {(p.exSessions||[]).map((s:any)=>{ const active=curS&&curS.id===s.id; const em=SESS_EMOJI[s.type]||"🏋️"; const cnt=(s.selected||[]).length; const grad=SESS_GRAD[s.type]||"rgba(255,255,255,.04)"; return (
          <button key={s.id} onClick={()=>setExTab(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:14,cursor:"pointer",border:active?"1px solid rgba(96,165,250,.7)":"1px solid var(--stroke)",background:active?grad:"rgba(255,255,255,.03)",boxShadow:active?"0 6px 20px rgba(59,130,246,.22)":"none",transition:"all .15s"}}>
            <span style={{fontSize:22,lineHeight:1}}>{em}</span>
            <span style={{textAlign:"left"}}><b style={{fontSize:13,color:"#E7ECF3",display:"block"}}>{s.type}</b><span style={{fontSize:11,color:"#8b93a5"}}>{s.time||"—"}{cnt?` · ${cnt} ex`:s.steps?` · ${(+s.steps).toLocaleString()} steps`:""}</span></span>
            <span style={{marginLeft:4,fontSize:16}}>{s.done?"✅":"⭕"}</span>
          </button> ); })}
        <button className="btn ghost sm" onClick={addSession} style={{alignSelf:"center"}}>+ Add session</button>
        {(p.exSessions||[]).length>0 && <button className="btn ghost sm" onClick={()=>autoCheckExercise(false)} title="Check your watch & workout logs and tick anything that's done" style={{alignSelf:"center"}}>🔄 Auto-check from watch</button>}
      </div>
      {curS? <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="row" style={{flexWrap:"wrap",gap:8,alignItems:"center"}}>
          <button className={"btn "+(curS.done?"":"ghost")+" sm"} onClick={()=>toggleSessDone(curS.id)}>{curS.done?"✅ Done":"⬜ Mark done"}</button>
          <input className="in" type="time" value={curS.time||""} onChange={e=>updSession(curS.id,{time:e.target.value})} style={{width:120}}/>
          {EX_TYPES.map(t=><button key={t} className={"btn "+(curS.type===t?"":"ghost")+" sm"} onClick={()=>updSession(curS.id,{type:t,selected:[]})}>{t}</button>)}
          <button className="btn ghost sm" style={{marginLeft:"auto"}} onClick={()=>delSession(curS.id)}>🗑 Remove</button>
        </div>
        {EX_LIB[curS.type]? <div style={{marginTop:12}}>
          <div className="muted" style={{fontSize:11,marginBottom:8}}>Tick {curS.type} exercises ({(curS.selected||[]).length}):</div>
          <div className="row" style={{flexWrap:"wrap",gap:8}}>{EX_LIB[curS.type].map(ex=>{ const on=(curS.selected||[]).some((x:any)=>x.name===ex); return <button key={ex} className={"btn "+(on?"":"ghost")+" sm"} onClick={()=>toggleSessEx(curS.id,ex)} style={{fontWeight:500}}>{on?"✓ ":""}{ex}</button>; })}</div>
          {(curS.selected||[]).length>0 && <div style={{overflowX:"auto",marginTop:12}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
            <thead><tr>{["Exercise","Sets","Reps","Weight (kg)","Note",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
            <tbody>{(curS.selected||[]).map((o:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <td style={{padding:"6px",fontSize:13,fontWeight:600}}><span onClick={()=>setSessExField(curS.id,o.name,"done",!o.done)} style={{cursor:"pointer",textDecoration:o.done?"line-through":"none",color:o.done?"#6ee7b7":undefined}}>{o.done?"✅ ":"⬜ "}{o.name}</span> <a href={demoLink(o.name)} target="_blank" rel="noopener" title="Watch demo" style={{marginLeft:6,fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺</a></td>
              <td style={{padding:"6px"}}><input className="in" value={o.sets||""} onChange={e=>setSessExField(curS.id,o.name,"sets",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.reps||""} onChange={e=>setSessExField(curS.id,o.name,"reps",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.weight||""} onChange={e=>setSessExField(curS.id,o.name,"weight",e.target.value)} placeholder="opt" style={{width:70}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.note||""} onChange={e=>setSessExField(curS.id,o.name,"note",e.target.value)} placeholder="note" style={{minWidth:100}}/></td>
              <td style={{padding:"6px",whiteSpace:"nowrap"}}><span className="btn ghost sm" style={{cursor:"pointer",marginRight:4}} title="How to do this" onClick={()=>setPlanInfo(planInfo===o.name?null:o.name)}>ⓘ</span><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>toggleSessEx(curS.id,o.name)}>✕</span></td>
            </tr>)}</tbody>
          </table></div>}
          {planInfo && (curS.selected||[]).some((o:any)=>o.name===planInfo) && <div className="muted" style={{fontSize:13,lineHeight:1.6,marginTop:10,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)"}}>
            <div className="between"><b style={{color:"#E7ECF3"}}>{exEmoji(planInfo)} {planInfo}</b><a href={demoLink(planInfo)} target="_blank" rel="noopener" style={{fontSize:12,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a></div>
            <div style={{marginTop:6}}>{HOWTO[planInfo]||"Perform with controlled form and a full range of motion — tap Demo to watch it."}</div>
          </div>}
        </div> : <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
          <input className="in" value={curS.steps||""} onChange={e=>updSession(curS.id,{steps:e.target.value})} placeholder="Steps (e.g. 10000)" style={{width:150}}/>
          <input className="in" value={curS.distance||""} onChange={e=>updSession(curS.id,{distance:e.target.value})} placeholder="Distance km" style={{width:120}}/>
          <input className="in" value={curS.duration||""} onChange={e=>updSession(curS.id,{duration:e.target.value})} placeholder="Duration min" style={{width:120}}/>
          <input className="in" value={curS.detail||""} onChange={e=>updSession(curS.id,{detail:e.target.value})} placeholder="Notes — e.g. easy pace, park loop" style={{flex:1,minWidth:160}}/>
        </div>}
        <div className="between" style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.08)",flexWrap:"wrap",gap:10}}>
          <div className="muted" style={{fontSize:12}}>{(curS.selected||[]).length? `${(curS.selected||[]).filter((x:any)=>x.done).length}/${(curS.selected||[]).length} exercises ticked` : (curS.type==="Walk"?"11,000-step walk":"Log your session, then submit")}</div>
          <button onClick={()=>submitSession(curS.id)} style={{padding:"11px 22px",borderRadius:14,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,color:"#fff",background:curS.done?"linear-gradient(100deg,#22c55e,#10b981)":"linear-gradient(100deg,var(--blue),#8B5CF6)",boxShadow:curS.done?"0 6px 18px rgba(16,185,129,.35)":"0 6px 18px rgba(59,130,246,.35)"}}>{curS.done?`✅ ${curS.type} done — tap to undo`:`🎯 Submit ${curS.type} as done`}</button>
        </div>
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>No sessions yet — tap “+ Add session”. Add one for your morning walk and another for the gym.</div>}
    </PRow>

    <div className="card" style={{marginBottom:14}}>
      <div className="row" style={{gap:10,marginBottom:8}}><Chip tint="blue">📅</Chip><strong style={{fontSize:15}}>Next 10 days — exercise outlook</strong></div>
      <div className="grid g2">
        {Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); const ses=(Array.isArray(c.exSessions)?c.exSessions:[]); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); const isToday=ds===today();
          return <div key={ds} onClick={()=>setSel(ds)} style={{cursor:"pointer",padding:"10px 12px",borderRadius:12,border:"1px solid "+(ds===sel?"var(--stroke2)":"var(--stroke)"),background:ds===sel?"rgba(59,130,246,.12)":ses.length?"rgba(255,255,255,.03)":"transparent"}}>
            <div className="between"><b style={{fontSize:13}}>{dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}{isToday?" · Today":""}</b><span className="muted" style={{fontSize:11}}>{ses.length?`${ses.length} session${ses.length>1?"s":""}`:"Rest / none"}</span></div>
            {ses.length? ses.map((s:any,si:number)=><div key={si} className="muted" style={{fontSize:12,marginTop:3}}>{s.done?"✅ ":"• "}{s.time?s.time+" · ":""}<b style={{color:"#E7ECF3"}}>{s.type}</b>{Array.isArray(s.selected)&&s.selected.length?` — ${s.selected.length} exercise${s.selected.length>1?"s":""}`:s.steps?` — ${s.steps} steps`:s.distance?` — ${s.distance}km`:""}</div>) : <div className="muted" style={{fontSize:12,marginTop:3}}>No workout planned</div>}
          </div>; })}
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Tap a day to open and edit it. Empty days are rest / unplanned.</div>
      {(()=>{ const opts=Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); return {ds,label:dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})+(ds===today()?" · Today":"")}; });
        return <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)"}}>
          <div className="row" style={{gap:8,flexWrap:"wrap"}}>
            {[["swap","🔀 Swap"],["modify","✎ Modify"],["add","➕ Add"]].map(([m,lbl])=><button key={m} className={"btn "+(opMode===m?"":"ghost")+" sm"} onClick={()=>setOpMode(m)}>{lbl}</button>)}
          </div>
          {opMode==="swap"? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
            <select className="in" value={dayA} onChange={e=>setDayA(e.target.value)}>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select>
            <span style={{fontSize:18}}>↔</span>
            <select className="in" value={dayB} onChange={e=>setDayB(e.target.value)}><option value="" style={OPT}>Pick day B…</option>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select>
            <button className="btn sm" onClick={swapDays}>🔀 Swap days</button>
          </div> : <div style={{marginTop:10}}>
            <div className="row" style={{gap:8,flexWrap:"wrap",alignItems:"center"}}><span className="muted" style={{fontSize:12}}>Day:</span>
              <select className="in" value={dayA} onChange={e=>setDayA(e.target.value)}>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select></div>
            <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
              <input className="in" value={opPrompt} onChange={e=>setOpPrompt(e.target.value)} placeholder={opMode==="modify"?"Change… e.g. +5% weight, swap bench for dumbbell press":"Add… e.g. 30-min evening cardio, or a Push session"} style={{flex:1,minWidth:200}} onKeyDown={e=>{ if(e.key==="Enter"){ opMode==="modify"?modifyDayEx():addDayEx(); } }}/>
              <button className="btn sm" onClick={opMode==="modify"?modifyDayEx:addDayEx} disabled={chatBusy==="ex"}>{chatBusy==="ex"?"🤖…":(opMode==="modify"?"✎ Modify":"➕ Add")}</button>
            </div>
          </div>}
          <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.07)"}} className="row"><input className="in" value={exChat} onChange={e=>setExChat(e.target.value)} placeholder="…or describe any change across all 10 days" style={{flex:1,minWidth:180}} onKeyDown={e=>{ if(e.key==="Enter") applyExerciseChat(); }}/><button className="btn ghost sm" onClick={applyExerciseChat} disabled={chatBusy==="ex"}>{chatBusy==="ex"?"🤖…":"✨ Apply"}</button></div>
        </div>; })()}
    </div>

    <PRow icon="🍎" tint="emerald" title="Meals — add items with times, AI counts each" action={actBtns(skipMeals,clearMeals)}>
      {["breakfast","lunch","dinner"].map((key)=>{ const items=p.meals[key]||[]; const gt=groupTot(key); const lbl=key.charAt(0).toUpperCase()+key.slice(1); const dr=mealDraft[key]||{time:"",food:""};
        return <div key={key} style={{marginBottom:14,paddingBottom:14,borderBottom:key!=="dinner"?"1px solid rgba(255,255,255,.06)":"none"}}>
          <strong style={{fontSize:13}}>{key==="breakfast"?"🌅":key==="lunch"?"🥗":"🌙"} {lbl}{gt.cal?` — ${Math.round(gt.cal)} kcal · P ${Math.round(gt.protein)}g`:""}</strong>
          {items.map((it:any,i:number)=><div key={i} className="row" style={{gap:8,marginTop:8,padding:"7px 10px",borderRadius:10,background:"rgba(255,255,255,.04)"}}>
            <span style={{cursor:"pointer",fontSize:16}} onClick={()=>toggleMealDone(key,i)}>{it.done?"✅":"⬜"}</span>
            <div style={{flex:1,textDecoration:it.done?"line-through":"none",opacity:it.done?.6:1}}><span style={{fontSize:13}}>{it.time?<b style={{color:"#6ee7b7"}}>{it.time} </b>:null}{it.name}</span><div className="muted" style={{fontSize:11}}>{it.cal} kcal · P {it.protein}g · C {it.carbs}g · F {it.fat}g · Fiber {it.fiber}g</div></div>
            <span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delMealItem(key,i)}>✕</span>
          </div>)}
          <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
            <input className="in" type="time" value={dr.time} onChange={e=>setMealDraft((s:any)=>({...s,[key]:{...dr,time:e.target.value}}))} style={{width:120}}/>
            <input className="in" value={dr.food} onChange={e=>setMealDraft((s:any)=>({...s,[key]:{...dr,food:e.target.value}}))} placeholder={`Add a ${key} item — e.g. 3 eggs, 2 roti`} style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") analyzeMeal(key); }}/>
            <button className="btn sm" onClick={()=>analyzeMeal(key)} disabled={mealBusy===key}>{mealBusy===key?"🤖…":"✨ Analyze"}</button>
          </div>
          {mealPrev[key] && (()=>{ const pv=mealPrev[key]; const tt=pv.total||{}; return <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.28)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:13}}>Nutrition of “{pv.text}”</strong><span className="muted" style={{fontSize:11}}>Correct? Modify below or add it.</span></div>
            <div className="row" style={{flexWrap:"wrap",gap:6,marginTop:8}}>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>🔥 {Math.round(tt.cal||0)} kcal</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Protein {Math.round(tt.protein||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Carbs {Math.round(tt.carbs||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Fat {Math.round(tt.fat||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Fiber {Math.round(tt.fiber||0)}g</span>
            </div>
            {(pv.items||[]).length>1 && <div className="muted" style={{fontSize:11,marginTop:6}}>{pv.items.map((it:any)=>`${it.name}${it.qty?` (${it.qty})`:""} ${Math.round(it.cal||0)}kcal`).join(" · ")}</div>}
            <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
              <input className="in" value={mealMod[key]||""} onChange={e=>setMealMod((s:any)=>({...s,[key]:e.target.value}))} placeholder="Modify — e.g. make it 2 eggs, add 1 tsp butter" style={{flex:1,minWidth:180}} onKeyDown={e=>{ if(e.key==="Enter") modifyMeal(key); }}/>
              <button className="btn ghost sm" onClick={()=>modifyMeal(key)} disabled={mealBusy===key}>{mealBusy===key?"🤖…":"✨ Modify"}</button>
            </div>
            <div className="row" style={{gap:8,marginTop:10}}>
              <button className="btn sm" onClick={()=>confirmMeal(key)}>✅ Add to {key}</button>
              <button className="btn ghost sm" onClick={()=>setMealPrev((s:any)=>({...s,[key]:null}))}>Cancel</button>
            </div>
          </div>; })()}
        </div>; })}
      {dayTotal.cal? <div style={{marginTop:4,padding:"10px 12px",borderRadius:12,background:"rgba(16,185,129,.10)",border:"1px solid rgba(16,185,129,.25)"}}>
        <div className="row" style={{flexWrap:"wrap",gap:10}}><strong style={{fontSize:13}}>Day total</strong>
          <span className="muted" style={{fontSize:13}}>🔥 <b style={{color:"#E7ECF3"}}>{Math.round(dayTotal.cal)}</b> kcal · P {Math.round(dayTotal.protein)}g · C {Math.round(dayTotal.carbs)}g · F {Math.round(dayTotal.fat)}g · Fiber {Math.round(dayTotal.fiber)}g</span></div>
      </div>:null}
    </PRow>
    </>}

    {mode!=="goals" && <>
    <PRow icon="📚" tint="purple" title="Study — add subjects, AI builds a timed plan for each" action={<div className="row" style={{gap:8,flexWrap:"wrap"}}><button className="btn ghost sm" onClick={restoreCourses}>↻ Restore courses</button><button className="btn ghost sm" onClick={skipStudy}>😴 Skip/Rest</button><button className="btn ghost sm" onClick={clearStudy}>🗑 Clear</button></div>}>
      <div className="row" style={{flexWrap:"wrap",gap:8}}>
        <input className="in" value={studyDraft.label} onChange={e=>setStudyDraft((s:any)=>({...s,label:e.target.value}))} placeholder="e.g. 2 hour data structures" style={{flex:1,minWidth:200}} onKeyDown={e=>{ if(e.key==="Enter") addSubject(); }}/>
        <input className="in" type="number" value={studyDraft.hours} onChange={e=>setStudyDraft((s:any)=>({...s,hours:e.target.value}))} placeholder="Hours" style={{width:90}}/>
        <button className="btn sm" onClick={addSubject} disabled={studyBusy||!studyDraft.label.trim()}>{studyBusy?"🤖 Planning…":"✨ Add & plan"}</button>
      </div>
      {(p.studyList||[]).length>0 && <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
        {(p.studyList||[]).map((s:any)=><button key={s.id} className={"btn "+(curSubj&&curSubj.id===s.id?"":"ghost")+" sm"} onClick={()=>setStudyTab(s.id)}>{s.label}</button>)}
      </div>}
      {curSubj? <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>{curSubj.label}{curSubj.hours?` · ${curSubj.hours}h`:""}</strong>
          <div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={()=>skipSubject(curSubj)}>😴 Skip {curSubj.courseId?courseName(curSubj.courseId):"subject"}</button><button className="btn ghost sm" onClick={()=>delSubject(curSubj.id)}>🗑 Remove</button></div></div>
        {curSubj.brief && <div style={{fontSize:13,lineHeight:1.6,marginTop:8}}>{curSubj.brief}</div>}
        {(+curSubj.studied||0)>0 && <div className="muted" style={{fontSize:12,marginTop:8}}>⏱ Studied today: <b style={{color:"#E7ECF3"}}>{curSubj.studied} min</b></div>}
        {(curSubj.video||curSubj.resource||curSubj.courseVideo) && <div style={{marginTop:8,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.04)",fontSize:12,lineHeight:1.8}}>
          {curSubj.video && <div className="muted">📺 {curSubj.video}{curSubj.courseVideo && <> · <a href={curSubj.courseVideo} target="_blank" rel="noopener" style={{color:"#7dd3fc",fontWeight:600}}>▶ open at this time</a></>}</div>}
          {curSubj.resource && <div>🔗 Study material: <a href={firstUrl(curSubj.resource)||curSubj.resource} target="_blank" rel="noopener" style={{color:"#7dd3fc",wordBreak:"break-all"}}>{firstUrl(curSubj.resource)||curSubj.resource}</a></div>}
          {curSubj.pdf && <div>📄 Syllabus PDF: <a href={curSubj.pdf} target="_blank" rel="noopener" style={{color:"#fcd34d",fontWeight:600}}>Open day PDF</a></div>}
        </div>}
        <div style={{marginTop:12}}>
          {!curSubj.notes && <button className="btn sm" onClick={()=>genNotes(curSubj)} disabled={notesBusy===curSubj.id}>{notesBusy===curSubj.id?"🤖 Writing detailed notes…":"📖 Generate detailed notes (theory · scenarios · Q&A)"}</button>}
          {curSubj.notes && <div className="card" style={{background:"rgba(255,255,255,.03)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>📖 Detailed notes</strong>
              <div className="row" style={{gap:8}}>
                <button className="btn ghost sm" onClick={()=>printNotes(curSubj.label, mdToHtml(curSubj.notes))}>🖨 Save as PDF</button>
                <button className="btn ghost sm" onClick={()=>genNotes(curSubj)} disabled={notesBusy===curSubj.id}>{notesBusy===curSubj.id?"🤖…":"↻ Regenerate"}</button>
              </div>
            </div>
            <div style={{marginTop:8,fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(curSubj.notes)}}/>
          </div>}
        </div>
        <div style={{marginTop:10}}>
          {!curSubj.codeFile && <button className="btn sm" onClick={()=>genCode(curSubj)} disabled={codeBusy===curSubj.id}>{codeBusy===curSubj.id?"🤖 Writing code…":"💻 Get today's code"}</button>}
          {curSubj.codeFile && <div className="card" style={{background:"rgba(255,255,255,.03)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>💻 {curSubj.codeFile.filename}{curSubj.codeFile.lang?` · ${curSubj.codeFile.lang}`:""}</strong>
              <div className="row" style={{gap:8,flexWrap:"wrap"}}>
                <button className="btn ghost sm" onClick={()=>copyCode(curSubj.codeFile.code)}>📋 Copy</button>
                <button className="btn ghost sm" onClick={()=>downloadCode(curSubj.codeFile)}>⬇ Download</button>
                {vscodeRepo(curSubj.resource) && <a className="btn ghost sm" href={vscodeRepo(curSubj.resource)} target="_blank" rel="noopener">↗ Repo in VS Code</a>}
                <button className="btn ghost sm" onClick={()=>genCode(curSubj)} disabled={codeBusy===curSubj.id}>{codeBusy===curSubj.id?"🤖…":"↻"}</button>
              </div>
            </div>
            <pre style={{marginTop:8,padding:12,borderRadius:10,background:"#0b1020",border:"1px solid var(--stroke)",overflowX:"auto",fontSize:12,lineHeight:1.55,color:"#d5dbe6",whiteSpace:"pre",maxHeight:360}}>{curSubj.codeFile.code}</pre>
            <div className="muted" style={{fontSize:11,marginTop:6}}>Copy or ⬇ Download the file and open it in VS Code, or open the course repo in VS Code (web).</div>
          </div>}
        </div>
        <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)"}}>
          <div className="row" style={{gap:8}}><span>💬</span><strong style={{fontSize:13}}>Ask Claude about this topic</strong></div>
          <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
            <input className="in" value={askText} onChange={e=>setAskText(e.target.value)} placeholder="Type a question… (leave blank for a full explanation)" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") askClaude(curSubj); }}/>
            <button className="btn sm" onClick={()=>askClaude(curSubj)}>💬 Ask Claude ↗</button>
          </div>
          <div className="muted" style={{fontSize:11,marginTop:6}}>Opens claude.ai in a new tab with your question and this topic as context.</div>
        </div>
        {(curSubj.plan||[]).length>0? <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
          <thead><tr>{["","Time","Focus","Timer"].map((h,hi)=><th key={hi} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
          <tbody>{curSubj.plan.map((x:any,i:number)=>{ const running=timer&&timer.key===curSubj.id+"#"+i; const el=running?elapsedSec(timer):0; const over=running&&timer.target&&el>=timer.target*60; const isRun=running&&!!timer.startedAt;
            return <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <td onClick={()=>toggleStudyTask(curSubj.id,i)} style={{padding:"7px 6px",cursor:"pointer",fontSize:15}}>{x.done?"✅":"⬜"}</td>
              <td style={{padding:"7px 6px",fontSize:12,whiteSpace:"nowrap",color:"#c4b5fd",fontWeight:600,textDecoration:x.done?"line-through":"none"}}>{x.time}</td>
              <td style={{padding:"7px 6px",fontSize:13,textDecoration:x.done?"line-through":"none",opacity:x.done?.6:1}}>{x.task}</td>
              <td style={{padding:"7px 6px",whiteSpace:"nowrap"}}>{running? <span className="row" style={{gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:700,color:over?"#f9a8d4":isRun?"#6ee7b7":"#8A94A6",fontVariantNumeric:"tabular-nums"}}>{fmtEl(el)}{timer.onBreak?" ☕":""}</span>
                  {isRun? <button className="btn ghost sm" title="Pause" onClick={()=>pauseTimer(false)}>⏸</button> : <button className="btn ghost sm" title="Resume" onClick={resumeTimer}>▶</button>}
                  {isRun && <button className="btn ghost sm" title="Take a break" onClick={()=>pauseTimer(true)}>☕ Break</button>}
                  <button className="btn sm" onClick={()=>logTask(curSubj)}>💾 Log</button>
                </span> : <button className="btn ghost sm" onClick={()=>startTask(curSubj,i,x.time)} disabled={x.done}>▶ Start</button>}</td>
            </tr>; })}</tbody>
        </table></div> : <div className="muted" style={{fontSize:12,marginTop:8}}>Building plan…</div>}
        {(curSubj.next||[]).length>0 && <div style={{marginTop:10}}><div className="muted" style={{fontSize:11,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Up next</div><ul className="list">{curSubj.next.map((x:string,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--mut2)"}}/><span style={{fontSize:13}} className="muted">{x}</span></li>)}</ul></div>}
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>Add subjects like “2 hour data structures” and “DevOps” — each gets its own tab with a timed plan.</div>}
    </PRow>

    <div className="card" style={{marginBottom:14}}>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginBottom:8}}><div className="row" style={{gap:10}}><Chip tint="purple">📅</Chip><strong style={{fontSize:15}}>Next 10 days — study outlook</strong></div>
        <div className="row" style={{gap:6,flexWrap:"wrap",alignItems:"center"}}><span className="muted" style={{fontSize:11}}>Course start:</span><input className="in" type="date" value={courseStartInput} onChange={e=>setCourseStartInput(e.target.value)} style={{width:140}}/><button className="btn ghost sm" onClick={applyCourseStart}>Set start</button></div></div>
      <div className="grid g2">
        {Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); const subs=(Array.isArray(c.studyList)?c.studyList:[]); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); const isToday=ds===today();
          const doneCount=subs.filter((s:any)=>(s.plan||[]).length && (s.plan||[]).every((t:any)=>t.done)).length;
          return <div key={ds} onClick={()=>setSel(ds)} style={{cursor:"pointer",padding:"10px 12px",borderRadius:12,border:"1px solid "+(ds===sel?"var(--stroke2)":"var(--stroke)"),background:ds===sel?"rgba(168,85,247,.12)":subs.length?"rgba(255,255,255,.03)":"transparent"}}>
            <div className="between"><b style={{fontSize:13}}>{dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}{isToday?" · Today":""}</b><span className="muted" style={{fontSize:11}}>{subs.length?`${doneCount}/${subs.length} done`:"None"}</span></div>
            {subs.length? subs.map((s:any,si:number)=>{ const complete=(s.plan||[]).length && (s.plan||[]).every((t:any)=>t.done); return <div key={si} className="muted" style={{fontSize:12,marginTop:3,textDecoration:complete?"line-through":"none"}}>{complete?"✅ ":"• "}{s.label}</div>; }) : <div className="muted" style={{fontSize:12,marginTop:3}}>No study planned</div>}
          </div>; })}
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Tap a day to open it. ✅ = all that day&apos;s tasks ticked.</div>
      <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.25)"}}>
        <div className="row" style={{gap:8}}><span>💬</span><strong style={{fontSize:13}}>Change the 10-day study plan with AI</strong></div>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <input className="in" value={stChat} onChange={e=>setStChat(e.target.value)} placeholder="e.g. move DSA to mornings, swap day 2 and 4, add a revision day after day 5" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") applyStudyChat(); }}/>
          <button className="btn sm" onClick={applyStudyChat} disabled={chatBusy==="st"}>{chatBusy==="st"?"🤖…":"✨ Apply"}</button>
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>Course links, PDFs &amp; notes are kept when a subject isn&apos;t renamed.</div>
      </div>
    </div>
    </>}

    {mode!=="study" && <>
    <PRow icon="📓" tint="orange" title="Daily Journal" action={clearBtn(clearJournal)}>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div><div style={{fontSize:16,fontWeight:700}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long"})}</div><div className="muted" style={{fontSize:12}}>{new Date(sel).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}</div></div>
        <button className="btn ghost sm" onClick={fixGrammar} disabled={fixBusy}>{fixBusy?"✨ Fixing…":"✨ Fix grammar & spelling"}</button>
      </div>
      <textarea className="in" value={p.journal||""} onChange={e=>save({journal:e.target.value})} placeholder={"Dear diary…\n\n• Highlights of the day —\n• Challenges —\n• Grateful for —\n• Tomorrow —\n\nWrite freely, then tap ‘Fix grammar & spelling’."} style={{width:"100%",minHeight:220,lineHeight:1.8,fontSize:15}}/>
      {fixMsg && <div className="muted" style={{fontSize:12,marginTop:6}}>{fixMsg}</div>}
    </PRow>

    <div className="card" style={{marginTop:2}}><strong>{days}-Day Plan Overview</strong><div className="muted" style={{fontSize:12,marginTop:2,marginBottom:6}}>Green = planned. Tap any day to edit it.</div><div className="cal-grid">{cells}</div></div>
    </>}
  </div>;
}

/* ---------- ENGLISH (45-day fluency) ---------- */
function English(){
  let st=LS("pos_eng_start",""); if(!st){ st=today(); SS("pos_eng_start",st); }
  const [sel,setSel]=useState(today());
  const dayIdx=(()=>{ const [y,m,d]=String(st).split("-").map(Number); const s0=new Date(y,m-1,d); const [y2,m2,d2]=sel.split("-").map(Number); const cur=new Date(y2,m2-1,d2); const diff=Math.round((cur.getTime()-s0.getTime())/86400000); return Math.max(0,Math.min(44,diff)); })();
  const topic=ENGLISH_TOPICS[dayIdx];
  const [data,setData]=useState<any>(LS("pos_eng_"+today(),{chat:[],essay:"",lesson:"",essayResult:""}));
  useEffect(()=>{ setData(LS("pos_eng_"+sel,{chat:[],essay:"",lesson:"",essayResult:""})); },[sel]);
  const save=(patch:any)=>{ setData((d:any)=>{ const n={...d,...patch}; SS("pos_eng_"+sel,n); return n; }); };
  const [busy,setBusy]=useState(""); const [chatIn,setChatIn]=useState(""); const [scenario,setScenario]=useState("Free conversation");
  const getFeedback=async()=>{ if(!(data.chat||[]).length){ alert("Have a short conversation first."); return; } setBusy("fb"); try{ const r=await fetch("/api/english-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:data.chat})}); const d=await r.json(); if(d.report) save({report:d.report}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const [listening,setListening]=useState(false); const [speakOn,setSpeakOn]=useState(true); const recRef=useRef<any>(null); const finalRef=useRef(""); const stoppingRef=useRef(false); const onStopRef=useRef<any>(null); const [micCtx,setMicCtx]=useState("");
  const speak=(t:string)=>{ try{ if(!speakOn||typeof window==="undefined"||!(window as any).speechSynthesis) return; const synth=(window as any).speechSynthesis; const clean=String(t).replace(/^Fix:[^\n]*\n?/im,""); const u=new (window as any).SpeechSynthesisUtterance(clean); u.lang="en-IN"; u.rate=0.95;
    const vs=synth.getVoices()||[]; const v=vs.find((x:any)=>x.lang==="en-IN")||vs.find((x:any)=>/en[-_]IN|India|Hindi|Ravi|Heera|Aditi|Rishi/i.test((x.lang||"")+(x.name||""))); if(v) u.voice=v;
    synth.cancel(); synth.speak(u); }catch(e){} };
  const startListening=(cb?:any,ctx?:string)=>{ const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR){ alert("Voice input needs Chrome/Edge (Web Speech API). You can still type."); return; }
    try{ if((window as any).speechSynthesis) (window as any).speechSynthesis.cancel(); }catch(e){}
    try{ const rec=new SR(); rec.lang="en-IN"; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1; recRef.current=rec; finalRef.current=""; stoppingRef.current=false; onStopRef.current=cb||((t:string)=>sendChat(false,t)); setMicCtx(ctx||"chat"); setListening(true); setChatIn("");
      rec.onresult=(e:any)=>{ let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const tr=e.results[i][0].transcript; if(e.results[i].isFinal) finalRef.current+=tr+" "; else interim+=tr; } setChatIn((finalRef.current+interim).trim()); };
      rec.onerror=()=>{};
      rec.onend=()=>{ if(!stoppingRef.current){ try{ rec.start(); return; }catch(e){} } setListening(false); };
      rec.start(); }catch(e){ setListening(false); alert("Couldn't start the microphone."); } };
  const stopListening=()=>{ stoppingRef.current=true; try{ recRef.current&&recRef.current.stop(); }catch(e){} setListening(false); const t=(finalRef.current||chatIn).trim(); finalRef.current=""; const cb=onStopRef.current; onStopRef.current=null; setMicCtx(""); if(t && cb) cb(t); };
  const shift=(n:number)=>{ const [y,m,d]=sel.split("-").map(Number); const dt=new Date(y,m-1,d+n); setSel(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`); };
  const getLesson=async()=>{ setBusy("lesson"); try{ const r=await fetch("/api/english-lesson",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({day:dayIdx+1,topic})}); const d=await r.json(); if(d.lesson) save({lesson:d.lesson}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const sendChat=async(first:boolean,textArg?:string)=>{ const txt=textArg!=null?textArg:chatIn; if(!first && !String(txt).trim()) return; setBusy("chat"); const base=Array.isArray(data.chat)?data.chat:[]; const msgs=first?[]:[...base,{role:"user",content:txt}]; if(!first){ save({chat:msgs}); setChatIn(""); }
    const convTopic = scenario && scenario!=="Free conversation" ? `Role-play scenario: ${scenario}. Stay in character as the other person in this scenario.` : topic;
    try{ const r=await fetch("/api/english-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs,topic:convTopic})}); const d=await r.json(); if(d.reply){ const n=[...msgs,{role:"bot",content:d.reply,corrected:d.corrected||"",issues:Array.isArray(d.issues)?d.issues:[]}]; save({chat:n}); speak((d.corrected?"Say: "+d.corrected+". ":"")+d.reply); } else if(d.error) alert(d.error); }catch(e){ alert("Chat failed — check your AI key."); } setBusy(""); };
  const checkEssay=async()=>{ if(!(data.essay||"").trim()){ alert("Write your essay first."); return; } setBusy("essay"); try{ const r=await fetch("/api/essay-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:data.essay})}); const d=await r.json(); if(d.result) save({essayResult:d.result}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const [drill,setDrill]=useState<any>(LS("pos_engdrill_"+today(),{sentences:[],idx:0,attempts:[],review:""}));
  useEffect(()=>{ setDrill(LS("pos_engdrill_"+sel,{sentences:[],idx:0,attempts:[],review:""})); },[sel]);
  const saveDrill=(patch:any)=>{ setDrill((d:any)=>{ const n={...d,...patch}; SS("pos_engdrill_"+sel,n); return n; }); };
  const startDrill=async()=>{ setBusy("drill"); try{ const r=await fetch("/api/english-drill",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,count:25})}); const d=await r.json(); if(Array.isArray(d.sentences)&&d.sentences.length){ const paras:string[]=[]; for(let i=0;i<d.sentences.length;i+=5) paras.push(d.sentences.slice(i,i+5).join(" ")); const n={sentences:paras,idx:0,attempts:[],review:""}; setDrill(n); SS("pos_engdrill_"+sel,n); speak(paras[0]); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const recordAttempt=(said:string)=>{ setDrill((d:any)=>{ const tgt=d.sentences[d.idx]||""; const attempts=[...(d.attempts||[]),{target:tgt,said}]; const idx=d.idx+1; const n={...d,attempts,idx}; SS("pos_engdrill_"+sel,n); if(idx<d.sentences.length) setTimeout(()=>speak(d.sentences[idx]),500); return n; }); };
  const reviewDrill=async()=>{ if(!(drill.attempts||[]).length){ alert("Repeat a few sentences first."); return; } setBusy("dreview"); try{ const r=await fetch("/api/drill-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({attempts:drill.attempts})}); const d=await r.json(); if(d.review) saveDrill({review:d.review}); else alert(d.error||"Failed"); }catch(e){ alert("Failed."); } setBusy(""); };
  const restartDrill=()=>{ const n={sentences:[],idx:0,attempts:[],review:""}; setDrill(n); SS("pos_engdrill_"+sel,n); };
  const norm=(s:string)=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
  // Pronunciation practice
  const [pron,setPron]=useState<any>(LS("pos_engpron_"+today(),{items:[],idx:0,last:null,right:0}));
  useEffect(()=>{ setPron(LS("pos_engpron_"+sel,{items:[],idx:0,last:null,right:0})); },[sel]);
  const savePron=(patch:any)=>{ setPron((d:any)=>{ const n={...d,...patch}; SS("pos_engpron_"+sel,n); return n; }); };
  const startPron=async()=>{ setBusy("pron"); try{ const r=await fetch("/api/word-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"pronunciation",topic,count:12})}); const d=await r.json(); if(Array.isArray(d.items)){ const n={items:d.items,idx:0,last:null,right:0}; setPron(n); SS("pos_engpron_"+sel,n); setTimeout(()=>speak(d.items[0].word),300); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const checkPron=(said:string)=>{ setPron((d:any)=>{ const it=d.items[d.idx]||{}; const ok=norm(said).includes(norm(it.word))||norm(it.word).includes(norm(said)); const n={...d,last:{word:it.word,said,ok,tip:it.tip},right:d.right+(ok?1:0)}; SS("pos_engpron_"+sel,n); return n; }); };
  const nextPron=()=>{ setPron((d:any)=>{ const idx=Math.min(d.idx+1,d.items.length); const n={...d,idx,last:null}; SS("pos_engpron_"+sel,n); if(idx<d.items.length) setTimeout(()=>speak(d.items[idx].word),300); return n; }); };
  // Spelling practice (dictation)
  const [spell,setSpell]=useState<any>(LS("pos_engspell_"+today(),{items:[],idx:0,input:"",last:null,right:0}));
  useEffect(()=>{ setSpell(LS("pos_engspell_"+sel,{items:[],idx:0,input:"",last:null,right:0})); },[sel]);
  const saveSpell=(patch:any)=>{ setSpell((d:any)=>{ const n={...d,...patch}; SS("pos_engspell_"+sel,n); return n; }); };
  const startSpell=async()=>{ setBusy("spell"); try{ const r=await fetch("/api/word-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"spelling",topic,count:12})}); const d=await r.json(); if(Array.isArray(d.items)){ const n={items:d.items,idx:0,input:"",last:null,right:0}; setSpell(n); SS("pos_engspell_"+sel,n); setTimeout(()=>speak(d.items[0].word),300); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const checkSpell=()=>{ setSpell((d:any)=>{ const it=d.items[d.idx]||{}; const ok=norm(d.input)===norm(it.word); const n={...d,last:{word:it.word,typed:d.input,ok},right:d.right+(ok?1:0)}; SS("pos_engspell_"+sel,n); return n; }); };
  const nextSpell=()=>{ setSpell((d:any)=>{ const idx=Math.min(d.idx+1,d.items.length); const n={...d,idx,input:"",last:null}; SS("pos_engspell_"+sel,n); if(idx<d.items.length) setTimeout(()=>speak(d.items[idx].word),300); return n; }); };
  return <>
    <Head t="English — 45-Day Fluency" p={`Day ${dayIdx+1} of 45 · ${topic}`} />
    {(()=>{ const ps=(re:RegExp)=>{ const m=String(data.report||"").match(re); return m?+m[1]:null; };
      const flu=ps(/fluency[^0-9]*(\d{1,3})/i), gra=ps(/grammar[^0-9]*(\d{1,3})/i), voc=ps(/vocab\w*[^0-9]*(\d{1,3})/i);
      const cefr=(String(data.report||"").match(/\b(A2|B1|B2|C1|C2)\b/)||[])[1]||"—";
      const vals=[flu,gra,voc].filter((x:any)=>x!=null) as number[];
      const overall=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
      const sub:any[]=[["Pronunciation",null,"#22c55e"],["Vocabulary",voc,"#3b82f6"],["Grammar",gra,"#a855f7"],["Fluency",flu,"#f59e0b"]];
      return <div className="panel" style={{marginBottom:16}}>
        <div className="panel-h"><div className="t">🗣️ Fluency Score</div><span className="lk">{overall!=null?"From your latest speaking session":"Do a speaking session to score"}</span></div>
        <div className="fluency">
          <div className="fl-main"><div className="ring" style={{["--p" as any]:overall||0,["--c" as any]:"#3b82f6"}}><div className="rc"><b>{overall??"—"}</b><small>/100</small></div></div><div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{cefr!=="—"?cefr+" · ":""}{overall!=null?(overall>=80?"Advanced":overall>=60?"Upper-Int":"Intermediate"):"Start a session"}</div></div>
          {sub.map((x:any,i:number)=><div className="fl-sub" key={i}><div className="fn">{x[0]}</div><div className="fv" style={{color:x[2]}}>{x[1]??"—"}</div><div className="fg" style={{color:x[2]}}>{x[1]!=null?(x[1]>=80?"Excellent":x[1]>=70?"Good":"Fair"):"—"}</div></div>)}
        </div>
      </div>; })()}
    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:10}}>
        <div><strong>Day {dayIdx+1} / 45</strong><div className="muted" style={{fontSize:12,marginTop:2}}>{topic}</div></div>
        <div className="row" style={{gap:6}}>
          <button className="btn ghost sm" onClick={()=>shift(-1)}>‹ Prev</button>
          <input className="in" type="date" value={sel} onChange={e=>setSel(e.target.value)} style={{width:150}}/>
          <button className="btn ghost sm" onClick={()=>shift(1)}>Next ›</button>
          <button className="btn ghost sm" onClick={()=>setSel(today())}>Today</button>
        </div>
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Intermediate → fluent. ~45 min/day: 15 min lesson · 15 min interview bot · 15 min essay correction. Started {String(st)}.</div>
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="blue">📘</Chip><strong>1 · Today&apos;s Lesson (15 min)</strong></div><div className="row" style={{gap:8}}><MiniTimer minutes={15}/><button className="btn sm" onClick={getLesson} disabled={busy==="lesson"}>{busy==="lesson"?"🤖…":data.lesson?"↻ New lesson":"✨ Get lesson"}</button></div></div>
      {data.lesson? <div style={{marginTop:10,fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(data.lesson)}}/> : <div className="muted" style={{fontSize:12,marginTop:8}}>Tap “Get lesson” for today&apos;s {topic} lesson.</div>}
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="emerald">🎤</Chip><strong>2 · Speaking Coach (15 min)</strong></div><div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={()=>{ setSpeakOn(v=>!v); if(speakOn && (window as any).speechSynthesis) (window as any).speechSynthesis.cancel(); }}>{speakOn?"🔊 Voice on":"🔇 Voice off"}</button><MiniTimer minutes={15}/></div></div>
      <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
        <span className="muted" style={{fontSize:12}}>Scenario:</span>
        <select className="in" value={scenario} onChange={e=>{ setScenario(e.target.value); if((data.chat||[]).length && confirm("Start this new scenario fresh? (clears the current chat)")) save({chat:[],report:""}); }} style={{minWidth:180}}>{SCENARIOS.map(sn=><option key={sn} value={sn} style={OPT}>{sn}</option>)}</select>
        {(data.chat||[]).length>0 && <button className="btn ghost sm" onClick={getFeedback} disabled={busy==="fb"}>{busy==="fb"?"🤖 Scoring…":"🏁 End & get feedback"}</button>}
      </div>
      <div style={{marginTop:10,maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
        {(data.chat||[]).map((m:any,i:number)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%"}}>
          {m.role==="bot" && (m.corrected||m.fix||(m.issues&&m.issues.length)) && <div style={{fontSize:12,color:"#fcd34d",background:"rgba(245,158,11,.10)",border:"1px solid rgba(245,158,11,.28)",borderRadius:10,padding:"6px 10px",marginBottom:4}}>
            {(m.corrected||m.fix) && <div>✏️ Say: {m.corrected||String(m.fix).replace(/^Say:\s*/i,"")}</div>}
            {(m.issues||[]).map((it:string,ii:number)=><div key={ii} style={{marginTop:2,opacity:.95}}>{/pronounce/i.test(it)?"🗣️ ":"• "}{it}</div>)}
          </div>}
          <div style={{padding:"8px 12px",borderRadius:12,fontSize:13,lineHeight:1.5,background:m.role==="user"?"rgba(59,130,246,.18)":"rgba(16,185,129,.10)",border:"1px solid var(--stroke)"}}>{m.role==="user"?"🧑 ":"🎤 "}{m.content}{m.role==="bot"&&<button className="btn ghost sm" style={{marginLeft:8,padding:"1px 7px"}} title="Hear again" onClick={()=>speak(m.content)}>🔊</button>}</div>
        </div>)}
        {!(data.chat||[]).length && <div className="muted" style={{fontSize:12}}>Start the interview and answer out loud (type your answers). The bot asks questions and corrects you.</div>}
      </div>
      <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
        {!(data.chat||[]).length && <button className="btn sm" onClick={()=>sendChat(true)} disabled={busy==="chat"}>{busy==="chat"?"🤖…":"▶ Start interview"}</button>}
        <button className={"btn "+(listening&&micCtx==="chat"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening(undefined,"chat")} disabled={busy==="chat"||(listening&&micCtx!=="chat")} style={listening&&micCtx==="chat"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="chat"?"⏹ Stop & send":"🎙️ Speak"}</button>
        <input className="in" value={chatIn} onChange={e=>setChatIn(e.target.value)} placeholder={listening?"Listening… speak, then tap Stop & send":"…or type your answer"} style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") sendChat(false); }}/>
        <button className="btn sm" onClick={()=>sendChat(false)} disabled={busy==="chat"}>{busy==="chat"?"🤖…":"Send"}</button>
        {(data.chat||[]).length>0 && <button className="btn ghost sm" onClick={()=>save({chat:[],report:""})}>Clear</button>}
      </div>
      {data.report && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.28)",fontSize:13,color:"#d5dbe6"}}><div className="between" style={{marginBottom:4}}><strong>📊 Session report</strong><button className="btn ghost sm" onClick={()=>save({report:""})}>✕</button></div><div dangerouslySetInnerHTML={{__html:mdToHtml(data.report)}}/></div>}
    </div>

    <div className="card">
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="purple">✍️</Chip><strong>3 · Essay — get corrected (15 min)</strong></div><div className="row" style={{gap:8}}><MiniTimer minutes={15}/><button className="btn sm" onClick={checkEssay} disabled={busy==="essay"}>{busy==="essay"?"🤖…":"✨ Check my essay"}</button></div></div>
      <textarea className="in" value={data.essay||""} onChange={e=>save({essay:e.target.value})} placeholder={`Write a short essay on: ${topic}. AI will fix tenses, grammar and suggest better words.`} style={{width:"100%",minHeight:140,marginTop:10,lineHeight:1.6}}/>
      {data.essayResult && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(data.essayResult)}}/>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="cyan">🔁</Chip><strong>4 · Repeat-after-me drill — paragraphs (15 min)</strong></div><div className="row" style={{gap:8}}>{drill.sentences.length>0 && <span className="muted" style={{fontSize:12}}>Para {Math.min(drill.idx+1,drill.sentences.length)}/{drill.sentences.length}</span>}<MiniTimer minutes={15}/></div></div>
      {!drill.sentences.length ? <div style={{marginTop:10}}>
        <div className="muted" style={{fontSize:12}}>The bot reads a short paragraph (4–5 sentences); you repeat the whole thing aloud. It records every attempt and reviews your mistakes at the end.</div>
        <button className="btn sm" style={{marginTop:8}} onClick={startDrill} disabled={busy==="drill"}>{busy==="drill"?"🤖 Preparing…":"▶ Start drill"}</button>
      </div> : drill.idx<drill.sentences.length ? <div style={{marginTop:10}}>
        <div style={{padding:14,borderRadius:12,background:"rgba(6,182,212,.10)",border:"1px solid rgba(6,182,212,.28)",fontSize:16,lineHeight:1.6}}>{drill.sentences[drill.idx]} <button className="btn ghost sm" style={{marginLeft:6}} onClick={()=>speak(drill.sentences[drill.idx])}>🔊 Hear</button></div>
        <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <button className={"btn "+(listening&&micCtx==="drill"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening((t:string)=>recordAttempt(t),"drill")} disabled={busy!==""||(listening&&micCtx!=="drill")} style={listening&&micCtx==="drill"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="drill"?"⏹ Done — next paragraph":"🎙️ Repeat the paragraph"}</button>
          <button className="btn ghost sm" onClick={()=>recordAttempt("(skipped)")}>Skip</button>
          <button className="btn ghost sm" onClick={reviewDrill} disabled={busy==="dreview"}>{busy==="dreview"?"🤖…":"Finish & review"}</button>
        </div>
        {listening&&micCtx==="drill" && (chatIn||"").trim() && <div className="muted" style={{fontSize:12,marginTop:8}}>Heard: {chatIn}</div>}
        <div className="muted" style={{fontSize:11,marginTop:6}}>Recorded {drill.attempts.length} paragraph(s). Read the whole paragraph, then tap “Done — next paragraph”.</div>
      </div> : <div style={{marginTop:10}}>
        <div className="muted" style={{fontSize:13}}>All {drill.sentences.length} sentences done — recorded {drill.attempts.length}.</div>
        <button className="btn sm" style={{marginTop:8}} onClick={reviewDrill} disabled={busy==="dreview"}>{busy==="dreview"?"🤖 Reviewing…":"📋 Review my mistakes"}</button>
      </div>}
      {drill.review && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(drill.review)}}/>}
      {drill.sentences.length>0 && <div style={{marginTop:8}}><button className="btn ghost sm" onClick={restartDrill}>↺ New drill</button></div>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="pink">🗣️</Chip><strong>5 · Pronunciation practice</strong></div>{pron.items.length>0 && <span className="muted" style={{fontSize:12}}>{Math.min(pron.idx,pron.items.length)}/{pron.items.length} · ✅ {pron.right}</span>}</div>
      {!pron.items.length ? <div style={{marginTop:10}}><div className="muted" style={{fontSize:12}}>Hear a word, say it back — it checks your pronunciation and gives a tip.</div><button className="btn sm" style={{marginTop:8}} onClick={startPron} disabled={busy==="pron"}>{busy==="pron"?"🤖…":"▶ Start"}</button></div>
      : pron.idx<pron.items.length ? <div style={{marginTop:10}}>
        <div style={{padding:14,borderRadius:12,background:"rgba(236,72,153,.10)",border:"1px solid rgba(236,72,153,.28)"}}>
          <div style={{fontSize:20,fontWeight:700}}>{pron.items[pron.idx].word} <button className="btn ghost sm" style={{marginLeft:6}} onClick={()=>speak(pron.items[pron.idx].word)}>🔊 Hear</button></div>
          {pron.items[pron.idx].tip && <div className="muted" style={{fontSize:12,marginTop:4}}>💡 {pron.items[pron.idx].tip}</div>}
        </div>
        {!pron.last ? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <button className={"btn "+(listening&&micCtx==="pron"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening((t:string)=>checkPron(t),"pron")} disabled={busy!==""||(listening&&micCtx!=="pron")} style={listening&&micCtx==="pron"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="pron"?"⏹ Done":"🎙️ Say it"}</button>
          <button className="btn ghost sm" onClick={nextPron}>Skip</button>
        </div> : <div style={{marginTop:10}}>
          <div style={{fontSize:14,fontWeight:700,color:pron.last.ok?"#6ee7b7":"#f9a8d4"}}>{pron.last.ok?"✅ Great pronunciation!":"❌ Not quite"}</div>
          <div className="muted" style={{fontSize:12,marginTop:3}}>Heard: “{pron.last.said||"—"}” · Target: “{pron.last.word}”{pron.last.tip?` · 💡 ${pron.last.tip}`:""}</div>
          <div className="row" style={{gap:8,marginTop:8}}><button className="btn ghost sm" onClick={()=>{ savePron({last:null}); }}>🎙️ Try again</button><button className="btn sm" onClick={nextPron}>Next →</button></div>
        </div>}
      </div> : <div style={{marginTop:10}}><div className="muted" style={{fontSize:13}}>Done! ✅ {pron.right}/{pron.items.length} good.</div><button className="btn sm" style={{marginTop:8}} onClick={startPron} disabled={busy==="pron"}>↺ New set</button></div>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="orange">🔤</Chip><strong>6 · Spelling practice (dictation)</strong></div>{spell.items.length>0 && <span className="muted" style={{fontSize:12}}>{Math.min(spell.idx,spell.items.length)}/{spell.items.length} · ✅ {spell.right}</span>}</div>
      {!spell.items.length ? <div style={{marginTop:10}}><div className="muted" style={{fontSize:12}}>The bot says a word (hidden) — you type the spelling. It checks and shows the correct spelling.</div><button className="btn sm" style={{marginTop:8}} onClick={startSpell} disabled={busy==="spell"}>{busy==="spell"?"🤖…":"▶ Start"}</button></div>
      : spell.idx<spell.items.length ? <div style={{marginTop:10}}>
        <div className="row" style={{gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button className="btn sm" onClick={()=>speak(spell.items[spell.idx].word)}>🔊 Hear the word</button>
          {spell.items[spell.idx].hint && <span className="muted" style={{fontSize:12}}>💡 {spell.items[spell.idx].hint}</span>}
        </div>
        {!spell.last ? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <input className="in" value={spell.input} onChange={e=>saveSpell({input:e.target.value})} placeholder="Type the spelling…" style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") checkSpell(); }}/>
          <button className="btn sm" onClick={checkSpell} disabled={!(spell.input||"").trim()}>Check</button>
          <button className="btn ghost sm" onClick={nextSpell}>Skip</button>
        </div> : <div style={{marginTop:10}}>
          <div style={{fontSize:14,fontWeight:700,color:spell.last.ok?"#6ee7b7":"#f9a8d4"}}>{spell.last.ok?"✅ Correct!":"❌ Not quite"}</div>
          <div className="muted" style={{fontSize:12,marginTop:3}}>You typed: “{spell.last.typed||"—"}” · Correct: <b style={{color:"#E7ECF3"}}>{spell.last.word}</b></div>
          <button className="btn sm" style={{marginTop:8}} onClick={nextSpell}>Next →</button>
        </div>}
      </div> : <div style={{marginTop:10}}><div className="muted" style={{fontSize:13}}>Done! ✅ {spell.right}/{spell.items.length} correct.</div><button className="btn sm" style={{marginTop:8}} onClick={startSpell} disabled={busy==="spell"}>↺ New set</button></div>}
    </div>
  </>;
}

/* ---------- SETTINGS ---------- */
function Settings({ sett, save }: any) {
  const F=(lbl:string,k:string,type="number")=><div style={{marginTop:12}}><div className="lbl muted" style={{marginBottom:6}}>{lbl}</div><input className="in" type={type} defaultValue={(sett as any)[k]} onBlur={e=>save({...sett,[k]:type==="number"?(+e.target.value||0):e.target.value})} style={{width:"100%"}}/></div>;
  return <>
    <Head t="Settings" p="Personalise your OS" />
    <div className="grid g2">
      <div className="card"><strong>Profile & Plan</strong>{F("Name","name","text")}{F("Age","age")}{F("Height (ft)","heightFt")}{F("Height (in)","heightIn")}{F("Plan start","planStart","date")}{F("Plan length (days)","planDays")}{F("Weight goal (kg)","weightGoal")}</div>
      <div className="card"><strong>Daily Targets</strong>{F("Calorie goal","calorieGoal")}{F("Protein goal (g)","proteinGoal")}{F("Carb goal (g)","carbGoal")}{F("Fat goal (g)","fatGoal")}{F("Fiber goal (g)","fiberGoal")}{F("Water goal (L)","waterGoal")}{F("Step goal","stepGoal")}
        <div style={{marginTop:16}} className="muted"><div className="li"><span className="dot" style={{background:"var(--emerald)"}}/><div>Gmail & Calendar — live via your Google sign-in</div></div></div>
      </div>
    </div>
    <ReminderCenter />
    <DataControls />
  </>;
}
