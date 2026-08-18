"use client";
import { useEffect, useState, Component } from "react";

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
import Fitness from "@/components/Fitness";
import SyncManager from "@/components/SyncManager";
import Assistant from "@/components/Assistant";

/* ---------- storage helpers ---------- */
const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const PPL: Record<number,string> = {0:"Recovery",1:"Push",2:"Pull",3:"Legs",4:"Push",5:"Pull",6:"Legs"};

type Sett = { name:string; age:number; heightFt:number; heightIn:number; planStart:string; planDays:number; weightGoal:number; calorieGoal:number; proteinGoal:number; carbGoal:number; fatGoal:number; fiberGoal:number; waterGoal:number; stepGoal:number; };
const DEF_SETT: Sett = { name:"Mohit", age:36, heightFt:6, heightIn:1, planStart:today(), planDays:120, weightGoal:87, calorieGoal:2350, proteinGoal:180, carbGoal:250, fatGoal:70, fiberGoal:35, waterGoal:3.5, stepGoal:9000 };

const NAV = [
  { k:"home", ic:"🏠", t:"Dashboard" }, { k:"health", ic:"❤️", t:"Health" }, { k:"exercise", ic:"🏋️", t:"Exercise" },
  { k:"nutrition", ic:"🍎", t:"Nutrition" }, { k:"study", ic:"📚", t:"Study" }, { k:"gmail", ic:"📧", t:"Gmail" },
  { k:"calendar", ic:"📅", t:"Calendar" }, { k:"goals", ic:"🎯", t:"Goals" }, { k:"settings", ic:"⚙️", t:"Settings" },
];

export default function Dashboard({ onSignOut, name }: { onSignOut: ()=>void; name: string }) {
  const [view, setView] = useState<string>("home");
  const [clock, setClock] = useState("");
  const [sett, setSett] = useState<Sett>(DEF_SETT);
  const [tick, setTick] = useState(0);
  const [selDate, setSelDate] = useState(today());
  const refresh = () => setTick(t => t + 1);
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
      <div className="main">
        <div className="topbar">
          <strong style={{ textTransform:"capitalize" }}>{view === "home" ? "Dashboard" : view}</strong>
          <div className="row" style={{gap:6,flexWrap:"wrap"}}>
            {["home","nutrition","study"].includes(view) && <>
              <button className="btn ghost sm" onClick={()=>shiftDate(-1)}>‹</button>
              <input className="in" type="date" value={selDate} max={today()} onChange={e=>setSelDate(e.target.value)} style={{width:150}}/>
              <button className="btn ghost sm" onClick={()=>shiftDate(1)} disabled={selDate>=today()}>›</button>
              <button className="btn ghost sm" onClick={()=>setSelDate(today())}>Today</button>
            </>}
            <span className="in" style={{ padding:"6px 12px" }}>{clock}</span>
            <span style={{ fontSize:10, color:"var(--mut2)" }} title="build marker — bump this to verify a deploy went live">build&nbsp;51</span>
          </div>
        </div>
        <div className="content"><Boundary key={view}>
          {view==="home" && <Home sett={sett} tick={tick} date={selDate} />}
          {view==="health" && <Health sett={sett} refresh={refresh} tick={tick} />}
          {view==="exercise" && <Fitness />}
          {view==="nutrition" && <Nutrition sett={sett} refresh={refresh} tick={tick} date={selDate} />}
          {view==="study" && <Study refresh={refresh} tick={tick} date={selDate} />}
          {view==="gmail" && <Gmail />}
          {view==="calendar" && <Calendar sett={sett} tick={tick} />}
          {view==="goals" && <Goals sett={sett} tick={tick} />}
          {view==="settings" && <Settings sett={sett} save={saveSett} />}
        </Boundary></div>
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
  const start = new Date(sett.planStart); const dayNo = Math.max(1, Math.floor((new Date(D).getTime()-start.getTime())/86400000)+1);
  const h = new Date().getHours(); const greet = h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  const pretty = new Date(D).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  return <>
    <Head t={viewing? `Dashboard — ${pretty}` : `${greet}, ${sett.name}`} p={viewing? `📅 Viewing a past day · Day ${dayNo} of your ${sett.planDays}-day plan` : `${pretty} · Day ${dayNo} of your ${sett.planDays}-day plan`} />
    <div className="card" style={{marginBottom:16,background:"linear-gradient(120deg,rgba(99,102,241,.18),rgba(16,185,129,.10))"}}>
      <div className="between"><div className="row"><span style={{fontSize:20}}>🚀</span><strong>Today&apos;s Mission</strong></div><span className="in" style={{padding:"4px 10px"}}>{PPL[new Date().getDay()]} Day</span></div>
      <p style={{marginBottom:0,lineHeight:1.55}}>Train {PPL[new Date().getDay()]} (~55 min), hit {sett.proteinGoal}g protein (now {nt.protein}g), study across AI/DevOps/System Design, and clear your inbox before deep work.</p>
    </div>
    <div className="grid g4">
      <Kpi lbl="Current Weight" ic="⚖️" tint="emerald" val={cur} unit="kg" sub={`Goal ${sett.weightGoal}kg`} />
      <Kpi lbl="Calories Left" ic="🔥" tint="orange" val={sett.calorieGoal-nt.cal} unit="kcal" sub={`${nt.cal} eaten`} />
      <Kpi lbl="Protein" ic="🍗" tint="blue" val={nt.protein} unit={`/${sett.proteinGoal}g`} sub="today" />
      <Kpi lbl="Study Today" ic="📚" tint="purple" val={fmt(st)} sub={`streak ${streak()}d`} />
    </div>
    <div className="grid g3" style={{marginTop:16}}>
      <PieCard title="Today's Macros" data={[{name:"Protein",value:nt.protein},{name:"Carbs",value:nt.carbs},{name:"Fat",value:nt.fat}]}/>
      <BarCard title="Study — last 7 days (hrs)" color="#A855F7" data={last7().map(x=>({name:x.name,value:Math.round(studyTotal(x.ds)/60*10)/10}))}/>
      <LineCard title="Weight trend (kg)" color="#10B981" data={w.map((x:any)=>({name:x.date.slice(5),value:x.kg}))}/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <BarCard title="Calories — last 7 days" color="#F59E0B" data={last7().map(x=>({name:x.name,value:nutTotals(x.ds).cal}))}/>
      <PieCard title="Study split" data={[{name:"AI",value:loadStudy(D).ai||0},{name:"DevOps",value:loadStudy(D).devops||0},{name:"System",value:loadStudy(D).system||0}]}/>
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
      try{ const r=await fetch("/api/nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({food:name})}); const d=await r.json(); cal=d.cal||0;p=d.protein||0;c=d.carbs||0;f=d.fat||0;fb=d.fiber||0; }catch(e){}
      setBusy(false);
    } else if(!cal){ cal=Math.round(p*4+c*4+f*9); }
    const m=loadNut(D); m.meals.push({name,cal,protein:p,carbs:c,fat:f,fiber:fb}); SS(nutKey(D),m);
    ["nName","nCal","nP","nC","nF","nFb"].forEach(i=>el(i).value=""); refresh(); };
  const del=(i:number)=>{ const m=loadNut(D); m.meals.splice(i,1); SS(nutKey(D),m); refresh(); };
  const water=(d:number)=>{ const m=loadNut(D); m.water=Math.max(0,Math.round((m.water+d)*100)/100); SS(nutKey(D),m); refresh(); };
  const R=(lbl:string,v:number,g:number,color:string,u:string)=><div className="card"><div className="between"><div className="lbl muted">{lbl}</div></div><div className="val" style={{fontSize:24,fontWeight:760,marginTop:6}}>{v}<small className="muted"> /{g}{u}</small></div><Bar v={v} goal={g} color={color}/></div>;
  return <>
    <Head t="Nutrition" p="Log every macro yourself" />
    <div className="grid g4">{R("Calories",t.cal,sett.calorieGoal,"var(--orange)","kcal")}{R("Protein",t.protein,sett.proteinGoal,"var(--emerald)","g")}{R("Carbs",t.carbs,sett.carbGoal,"var(--blue)","g")}{R("Fat",t.fat,sett.fatGoal,"var(--pink)","g")}</div>
    <div className="grid g2" style={{marginTop:16}}>
      <div className="card"><strong>Log a meal</strong>
        <div className="row" style={{marginTop:12}}><input className="in" id="nName" placeholder="Food name" style={{flex:1}}/></div>
        <div className="row" style={{marginTop:8,flexWrap:"wrap",gap:8}}><input className="in" id="nCal" type="number" placeholder="Calories" style={{width:100}}/><input className="in" id="nP" type="number" placeholder="Protein g" style={{width:100}}/><input className="in" id="nC" type="number" placeholder="Carbs g" style={{width:95}}/><input className="in" id="nF" type="number" placeholder="Fat g" style={{width:85}}/><input className="in" id="nFb" type="number" placeholder="Fiber g" style={{width:90}}/><button className="btn" onClick={add} disabled={busy}>{busy?"🤖 Fetching…":"Add meal"}</button></div>
        <div className="muted" style={{fontSize:11,margin:"6px 0"}}>Type just the food name and hit Add — Claude auto-fills protein, carbs, fat &amp; fiber. Fill any field yourself to override.</div>
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
function Study({ refresh, tick, date }: any) {
  const D=date||today(); const s=loadStudy(D); const weekend=[0,6].includes(new Date(D).getDay()); const goal=weekend?300:240;
  const log=(k:string,v:number)=>{ if(!(v>0))return; const d=loadStudy(D); d[k]=(d[k]||0)+v; SS(studyKey(D),d); refresh(); };
  const cur=LS("pos_curriculum",seedCurr()); if(!LS("pos_curriculum",null)) SS("pos_curriculum",cur);
  return <>
    <Head t="Study" p="AI · DevOps · System Design" />
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
    <Curriculum />
  </>;
}
function weekStudy(){let t=0;const d=new Date();for(let i=0;i<7;i++){const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;t+=studyTotal(ds);d.setDate(d.getDate()-1);}return t;}
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
  return <>
    <Head t="Goals" p={`${sett.planDays}-day transformation`} />
    <div className="card" style={{background:"linear-gradient(120deg,rgba(236,72,153,.15),rgba(99,102,241,.12))"}}>
      <div className="between"><strong>{sett.planDays}-Day Transformation</strong><span className="in" style={{padding:"4px 10px"}}>{sett.planDays-dayNo} days left</span></div>
      <div className="val" style={{fontSize:30,fontWeight:770,marginTop:10}}>{pct}%</div><Bar v={pct} goal={100} color="linear-gradient(90deg,var(--pink),var(--indigo))"/>
      <div className="muted" style={{marginTop:6}}>Day {dayNo} of {sett.planDays} · started {sett.planStart}</div>
    </div>
    <GoalPlanner sett={sett}/>
    <PlanCalendar sett={sett}/>
  </>;
}
/* ---------- 120-day daily goal planner ---------- */
function planKey(d:string){ return "pos_plan_"+d; }
const PLAN_DEF:any={exSessions:[],meals:{breakfast:[],lunch:[],dinner:[]},studyList:[],journal:""};
function loadPlan(d:string){ const raw:any=LS(planKey(d),{}); const mealArr=(g:string)=>Array.isArray(raw.meals?.[g])?raw.meals[g]:[];
  return {...PLAN_DEF, ...raw, exSessions:Array.isArray(raw.exSessions)?raw.exSessions:[], studyList:Array.isArray(raw.studyList)?raw.studyList:[], meals:{breakfast:mealArr("breakfast"),lunch:mealArr("lunch"),dinner:mealArr("dinner")}, journal:raw.journal||""}; }
const EX_TYPES=["Rest","Push","Pull","Legs","Cardio","Walk","HIIT","Yoga"];
const P_PUSH=["Bench Press","Incline Dumbbell Press","Machine Chest Press","Cable Fly","Shoulder Press","Lateral Raise","Rear Delt Fly","Tricep Pushdown","Overhead Tricep Extension","Dips"];
const P_PULL=["Deadlift","Lat Pulldown","Pull-ups","Barbell Row","Seated Cable Row","Single Arm Row","Face Pull","Barbell Curl","Hammer Curl","Preacher Curl"];
const P_LEGS=["Squat","Romanian Deadlift","Leg Press","Walking Lunges","Leg Extension","Hamstring Curl","Bulgarian Split Squat","Standing Calf Raise","Hip Thrust","Glute Bridge"];
const EX_LIB:Record<string,string[]>={Push:P_PUSH,Pull:P_PULL,Legs:P_LEGS};
const COURSES=["AI / ML","Interview Prep","Data Structures & Algorithms","System Design","DevOps","Cloud","Frontend","Other"];
function PRow({ icon, tint, title, action, children }: any){ return <div className="card" style={{marginBottom:14}}>
  <div className="between" style={{gap:10,marginBottom:10,flexWrap:"wrap"}}><div className="row" style={{gap:10}}><Chip tint={tint}>{icon}</Chip><strong style={{fontSize:15}}>{title}</strong></div>{action}</div>{children}</div>; }
const OPT = { background:"#0f172a", color:"#E7ECF3" } as any;
const uid=()=>Math.random().toString(36).slice(2,9);
function GoalPlanner({ sett }: any) {
  const days=sett.planDays||120;
  const [sel,setSel]=useState(today());
  const [p,setP]=useState<any>(loadPlan(today()));
  const [,setT]=useState(0);
  const [fixBusy,setFixBusy]=useState(false); const [fixMsg,setFixMsg]=useState("");
  const [mealBusy,setMealBusy]=useState(""); const [studyBusy,setStudyBusy]=useState(false); const [saved,setSaved]=useState("");
  const [exTab,setExTab]=useState(""); const [studyTab,setStudyTab]=useState("");
  const [mealDraft,setMealDraft]=useState<any>({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}});
  const [studyDraft,setStudyDraft]=useState<any>({label:"",hours:""});
  useEffect(()=>{ const pl=loadPlan(sel); setP(pl); setFixMsg(""); setSaved("");
    setExTab((pl.exSessions[0]||{}).id||""); setStudyTab((pl.studyList[0]||{}).id||"");
    setMealDraft({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}}); setStudyDraft({label:"",hours:""}); },[sel]);
  const save=(patch:any)=>{ const n={...p,...patch}; setP(n); SS(planKey(sel),n); setT(x=>x+1); setSaved(""); };
  const doSave=()=>{ SS(planKey(sel),p); setSaved("✓ Saved "+new Date().toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})+" — synced for the future"); };
  const clearEx=()=>{ if(confirm("Clear all exercise sessions for this day?")) save({exSessions:[]}); };
  const clearMeals=()=>{ if(confirm("Clear all meals for this day?")) save({meals:{breakfast:[],lunch:[],dinner:[]}}); };
  const clearStudy=()=>{ if(confirm("Clear all study subjects for this day?")) save({studyList:[]}); };
  const clearJournal=()=>{ if(confirm("Clear the journal for this day?")) save({journal:""}); };
  const clearDay=()=>{ if(confirm("Clear the WHOLE plan for "+sel+"?")){ const blank=JSON.parse(JSON.stringify(PLAN_DEF)); setP(blank); SS(planKey(sel),blank); setT(x=>x+1); setSaved(""); setExTab(""); setStudyTab(""); } };
  const clearBtn=(fn:()=>void)=><button className="btn ghost sm" onClick={fn}>🗑 Clear</button>;
  const shift=(n:number)=>{ const d=new Date(sel); d.setDate(d.getDate()+n); setSel(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); };
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
  /* auto-tick planned sessions when the watch / workout logs show they were done */
  const autoCheckExercise=(silent?:boolean)=>{ const sessions=p.exSessions||[]; if(!sessions.length){ if(!silent) alert("No sessions to check."); return; }
    const acts=LS("pos_gh_acts",[]).filter((a:any)=>a.date===sel);
    const gh=LS("pos_ghealth",[]).find((x:any)=>x.date===sel)||{};
    const wo=LS("pos_workouts",[]).filter((w:any)=>w.date===sel);
    let changed=false;
    const next=sessions.map((s:any)=>{ if(s.done) return s; let done=false;
      if(EX_LIB[s.type]) done=wo.some((w:any)=>(w.type||"").toLowerCase()===s.type.toLowerCase());
      else if(s.type==="Walk"||s.type==="Cardio"||s.type==="HIIT"){ const planSteps=+s.steps||0; const hasAct=acts.some((a:any)=>/walk|run|cardio|hike|cycle|bike|hiit/i.test(a.type||"")); const stepsOK=planSteps? (+gh.steps||0)>=planSteps*0.9 : false; done=hasAct||stepsOK; }
      else if(s.type==="Yoga") done=acts.some((a:any)=>/yoga/i.test(a.type||""));
      if(done){ changed=true; return {...s,done:true,selected:(s.selected||[]).map((x:any)=>({...x,done:true}))}; } return s; });
    if(changed) save({exSessions:next}); else if(!silent) alert("No matching activity found yet in your watch/workout logs for "+sel+".");
  };
  useEffect(()=>{ const t=setTimeout(()=>autoCheckExercise(true),400); return ()=>clearTimeout(t); /* eslint-disable-next-line */ },[sel,p.exSessions.length]);
  const toggleSessEx=(id:string,name:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; const cur=s.selected||[]; const nx=cur.some((x:any)=>x.name===name)?cur.filter((x:any)=>x.name!==name):[...cur,{name,sets:"3",reps:"10",weight:"",note:""}]; updSession(id,{selected:nx}); };
  const setSessExField=(id:string,name:string,field:string,val:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; updSession(id,{selected:(s.selected||[]).map((x:any)=>x.name===name?{...x,[field]:val}:x)}); };
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
  const toggleMealDone=(group:string,idx:number)=>{ const it=(p.meals[group]||[])[idx]; const nowDone=!it.done; syncMealToNutrition(it,nowDone); save({meals:{...p.meals,[group]:(p.meals[group]||[]).map((x:any,i:number)=>i===idx?{...x,done:nowDone}:x)}}); };
  const toggleStudyTask=(id:string,idx:number)=> save({studyList:(p.studyList||[]).map((s:any)=>s.id===id?{...s,plan:(s.plan||[]).map((r:any,i:number)=>i===idx?{...r,done:!r.done}:r)}:s)});
  const groupTot=(group:string)=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; (p.meals[group]||[]).forEach((it:any)=>{t.cal+=+it.cal||0;t.protein+=+it.protein||0;t.carbs+=+it.carbs||0;t.fat+=+it.fat||0;t.fiber+=+it.fiber||0;}); return t; };
  const dayTotal=(()=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; ["breakfast","lunch","dinner"].forEach(k=>{ const g=groupTot(k); t.cal+=g.cal;t.protein+=g.protein;t.carbs+=g.carbs;t.fat+=g.fat;t.fiber+=g.fiber; }); return t; })();
  /* study subjects */
  const addSubject=async()=>{ const label=(studyDraft.label||"").trim(); if(!label)return; const id=uid(); const subj={id,label,hours:studyDraft.hours||"",plan:[],next:[]};
    save({studyList:[...(p.studyList||[]),subj]}); setStudyTab(id); setStudyDraft({label:"",hours:""}); setStudyBusy(true);
    try{ const r=await fetch("/api/study-path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:label,hours:subj.hours})}); const d=await r.json();
      setP((prev:any)=>{ const n={...prev,studyList:(prev.studyList||[]).map((s:any)=>s.id===id?{...s,plan:d.plan||[],next:d.next||[]}:s)}; SS(planKey(sel),n); return n; }); }catch(e){} setStudyBusy(false); };
  const delSubject=(id:string)=>{ const list=(p.studyList||[]).filter((s:any)=>s.id!==id); save({studyList:list}); if(studyTab===id) setStudyTab((list[0]||{}).id||""); };
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
          <button className="btn ghost sm" onClick={clearDay}>🗑 Clear day</button>
        </div>
      </div>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginTop:10}}>
        <div className="muted" style={{fontSize:12}}>Planning for <b style={{color:"#E7ECF3"}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b> · scheduled workout: <b style={{color:"#E7ECF3"}}>{PPL[new Date(sel).getDay()]}</b></div>
        {saved && <span style={{fontSize:12,color:"#6ee7b7"}}>{saved}</span>}
      </div>
    </div>

    <PRow icon="🏋️" tint="blue" title="Exercise — add each session (e.g. 6 AM walk, 1 PM gym)" action={clearBtn(clearEx)}>
      <div className="row" style={{flexWrap:"wrap",gap:8,alignItems:"center"}}>
        {(p.exSessions||[]).map((s:any)=><button key={s.id} className={"btn "+(curS&&curS.id===s.id?"":"ghost")+" sm"} onClick={()=>setExTab(s.id)}>{s.done?"✅ ":""}{s.time||"—"} · {s.type}</button>)}
        <button className="btn ghost sm" onClick={addSession}>+ Add session</button>
        {(p.exSessions||[]).length>0 && <button className="btn ghost sm" onClick={()=>autoCheckExercise(false)} title="Check your watch & workout logs and tick anything that's done">🔄 Auto-check from watch</button>}
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
              <td onClick={()=>setSessExField(curS.id,o.name,"done",!o.done)} style={{padding:"6px",fontSize:13,fontWeight:600,cursor:"pointer",textDecoration:o.done?"line-through":"none",color:o.done?"#6ee7b7":undefined}}>{o.done?"✅ ":"⬜ "}{o.name}</td>
              <td style={{padding:"6px"}}><input className="in" value={o.sets||""} onChange={e=>setSessExField(curS.id,o.name,"sets",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.reps||""} onChange={e=>setSessExField(curS.id,o.name,"reps",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.weight||""} onChange={e=>setSessExField(curS.id,o.name,"weight",e.target.value)} placeholder="opt" style={{width:70}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.note||""} onChange={e=>setSessExField(curS.id,o.name,"note",e.target.value)} placeholder="note" style={{minWidth:100}}/></td>
              <td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>toggleSessEx(curS.id,o.name)}>✕</span></td>
            </tr>)}</tbody>
          </table></div>}
        </div> : <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
          <input className="in" value={curS.steps||""} onChange={e=>updSession(curS.id,{steps:e.target.value})} placeholder="Steps (e.g. 10000)" style={{width:150}}/>
          <input className="in" value={curS.distance||""} onChange={e=>updSession(curS.id,{distance:e.target.value})} placeholder="Distance km" style={{width:120}}/>
          <input className="in" value={curS.duration||""} onChange={e=>updSession(curS.id,{duration:e.target.value})} placeholder="Duration min" style={{width:120}}/>
          <input className="in" value={curS.detail||""} onChange={e=>updSession(curS.id,{detail:e.target.value})} placeholder="Notes — e.g. easy pace, park loop" style={{flex:1,minWidth:160}}/>
        </div>}
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>No sessions yet — tap “+ Add session”. Add one for your morning walk and another for the gym.</div>}
    </PRow>

    <PRow icon="🍎" tint="emerald" title="Meals — add items with times, AI counts each" action={clearBtn(clearMeals)}>
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
            <input className="in" value={dr.food} onChange={e=>setMealDraft((s:any)=>({...s,[key]:{...dr,food:e.target.value}}))} placeholder={`Add a ${key} item — e.g. 3 eggs`} style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") addMealItem(key); }}/>
            <button className="btn sm" onClick={()=>addMealItem(key)} disabled={mealBusy===key}>{mealBusy===key?"🤖…":"✨ Add & count"}</button>
          </div>
        </div>; })}
      {dayTotal.cal? <div style={{marginTop:4,padding:"10px 12px",borderRadius:12,background:"rgba(16,185,129,.10)",border:"1px solid rgba(16,185,129,.25)"}}>
        <div className="row" style={{flexWrap:"wrap",gap:10}}><strong style={{fontSize:13}}>Day total</strong>
          <span className="muted" style={{fontSize:13}}>🔥 <b style={{color:"#E7ECF3"}}>{Math.round(dayTotal.cal)}</b> kcal · P {Math.round(dayTotal.protein)}g · C {Math.round(dayTotal.carbs)}g · F {Math.round(dayTotal.fat)}g · Fiber {Math.round(dayTotal.fiber)}g</span></div>
      </div>:null}
    </PRow>

    <PRow icon="📚" tint="purple" title="Study — add subjects, AI builds a timed plan for each" action={clearBtn(clearStudy)}>
      <div className="row" style={{flexWrap:"wrap",gap:8}}>
        <input className="in" value={studyDraft.label} onChange={e=>setStudyDraft((s:any)=>({...s,label:e.target.value}))} placeholder="e.g. 2 hour data structures" style={{flex:1,minWidth:200}} onKeyDown={e=>{ if(e.key==="Enter") addSubject(); }}/>
        <input className="in" type="number" value={studyDraft.hours} onChange={e=>setStudyDraft((s:any)=>({...s,hours:e.target.value}))} placeholder="Hours" style={{width:90}}/>
        <button className="btn sm" onClick={addSubject} disabled={studyBusy||!studyDraft.label.trim()}>{studyBusy?"🤖 Planning…":"✨ Add & plan"}</button>
      </div>
      {(p.studyList||[]).length>0 && <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
        {(p.studyList||[]).map((s:any)=><button key={s.id} className={"btn "+(curSubj&&curSubj.id===s.id?"":"ghost")+" sm"} onClick={()=>setStudyTab(s.id)}>{s.label}</button>)}
      </div>}
      {curSubj? <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>{curSubj.label}{curSubj.hours?` · ${curSubj.hours}h`:""}</strong><button className="btn ghost sm" onClick={()=>delSubject(curSubj.id)}>🗑 Remove</button></div>
        {(curSubj.plan||[]).length>0? <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
          <thead><tr>{["","Time","Focus"].map((h,hi)=><th key={hi} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
          <tbody>{curSubj.plan.map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}><td onClick={()=>toggleStudyTask(curSubj.id,i)} style={{padding:"7px 6px",cursor:"pointer",fontSize:15}}>{x.done?"✅":"⬜"}</td><td style={{padding:"7px 6px",fontSize:12,whiteSpace:"nowrap",color:"#c4b5fd",fontWeight:600,textDecoration:x.done?"line-through":"none"}}>{x.time}</td><td style={{padding:"7px 6px",fontSize:13,textDecoration:x.done?"line-through":"none",opacity:x.done?.6:1}}>{x.task}</td></tr>)}</tbody>
        </table></div> : <div className="muted" style={{fontSize:12,marginTop:8}}>Building plan…</div>}
        {(curSubj.next||[]).length>0 && <div style={{marginTop:10}}><div className="muted" style={{fontSize:11,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Up next</div><ul className="list">{curSubj.next.map((x:string,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--mut2)"}}/><span style={{fontSize:13}} className="muted">{x}</span></li>)}</ul></div>}
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>Add subjects like “2 hour data structures” and “DevOps” — each gets its own tab with a timed plan.</div>}
    </PRow>

    <PRow icon="📓" tint="orange" title="Daily Journal" action={clearBtn(clearJournal)}>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div><div style={{fontSize:16,fontWeight:700}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long"})}</div><div className="muted" style={{fontSize:12}}>{new Date(sel).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}</div></div>
        <button className="btn ghost sm" onClick={fixGrammar} disabled={fixBusy}>{fixBusy?"✨ Fixing…":"✨ Fix grammar & spelling"}</button>
      </div>
      <textarea className="in" value={p.journal||""} onChange={e=>save({journal:e.target.value})} placeholder={"Dear diary…\n\n• Highlights of the day —\n• Challenges —\n• Grateful for —\n• Tomorrow —\n\nWrite freely, then tap ‘Fix grammar & spelling’."} style={{width:"100%",minHeight:220,lineHeight:1.8,fontSize:15}}/>
      {fixMsg && <div className="muted" style={{fontSize:12,marginTop:6}}>{fixMsg}</div>}
    </PRow>

    <div className="card" style={{marginTop:2}}><strong>{days}-Day Plan Overview</strong><div className="muted" style={{fontSize:12,marginTop:2,marginBottom:6}}>Green = planned. Tap any day to edit it.</div><div className="cal-grid">{cells}</div></div>
  </div>;
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
  </>;
}
