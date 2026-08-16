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
            <span style={{ fontSize:10, color:"var(--mut2)" }} title="build marker — bump this to verify a deploy went live">build&nbsp;35</span>
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
    <PlanCalendar sett={sett}/>
  </>;
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
    <PlanCalendar sett={sett}/>
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
  </>;
}
